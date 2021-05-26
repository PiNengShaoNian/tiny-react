import {
  commitUpdate,
  removeChild,
  UpdatePayload,
} from '../react-dom/ReactDOMHostConfig'
import { Container } from '../react-dom/ReactDomRoot'
import {
  BeforeMutationMask,
  ChildDeletion,
  ContentReset,
  MutationMask,
  NoFlags,
  PassiveMask,
  Placement,
  Update,
  Passive,
  PlacementAndUpdate,
} from './ReactFiberFlags'
import { FunctionComponentUpdateQueue } from './ReactFiberHooks'
import {
  appendChild,
  appendChildToContainer,
  commitTextUpdate,
  insertBefore,
  insertInContainerBefore,
} from './ReactFiberHostConfig'
import {
  HookFlags,
  HasEffect as HookHasEffect,
  Passive as HookPassive,
} from './ReactHookEffectTags'
import { Fiber, FiberRoot } from './ReactInternalTypes'
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
} from './ReactWorkTags'

let nextEffect: Fiber | null = null

const ensureCorrectReturnPointer = (
  fiber: Fiber,
  expectedReturnFiber: Fiber
): void => {
  fiber.return = expectedReturnFiber
}

const commitBeforeMutationEffects_begin = () => {
  while (nextEffect !== null) {
    const fiber = nextEffect
    const child = fiber.child

    //如果子树由beforeMutation标记
    if (
      (fiber.subtreeFlags & BeforeMutationMask) !== NoFlags &&
      child !== null
    ) {
      ensureCorrectReturnPointer(child, fiber)
      nextEffect = child
    } else {
      commitBeforeMutationEffects_complete()
    }
  }
}
const commitBeforeMutationEffects_complete = () => {
  while (nextEffect !== null) {
    const fiber = nextEffect

    commitBeforeMutationEffectsOnFiber(fiber)

    const sibling = fiber.sibling

    if (sibling !== null) {
      nextEffect = sibling
      return
    }

    nextEffect = fiber.return
  }
}

export const commitPassiveUnmountEffects = (firstChild: Fiber): void => {
  nextEffect = firstChild
  commitPassiveUnmountEffects_begin()
}

const commitPassiveUnmountInsideDeletedTreeOnFiber = (
  current: Fiber,
  nearestMountedAncestor: Fiber | null
): void => {
  switch (current.tag) {
    case FunctionComponent:
      throw new Error('Not Implement')

    default:
      break
  }
}

const detachFiberAfterEffects = (fiber: Fiber) => {
  const alternate = fiber.alternate
  if (alternate !== null) {
    fiber.alternate = null
    detachFiberAfterEffects(alternate)
  }

  fiber.child = null
  fiber.deletions = null
  fiber.memoizedProps = null
  fiber.memoizedState = null
  fiber.pendingProps = null
  fiber.sibling = null
  fiber.stateNode = null
  fiber.updateQueue = null
}

const commitPassiveUnmountEffectsInsideOfDeletedTree_complete = (
  deletedSubtreeRoot: Fiber
) => {
  while (nextEffect !== null) {
    const fiber = nextEffect
    const sibling = fiber.sibling
    const returnFiber = fiber.return

    if (fiber === deletedSubtreeRoot) {
      detachFiberAfterEffects(fiber)
      nextEffect = null
      return
    }

    if (sibling !== null) {
      ensureCorrectReturnPointer(sibling, returnFiber!)
      nextEffect = sibling
      return
    }

    nextEffect = returnFiber
  }
}

const commitPassiveUnmountEffectsInsideOfDeletedTree_begin = (
  deletedSubtreeRoot: Fiber,
  nearestMountedAncestor: Fiber | null
) => {
  while (nextEffect !== null) {
    const fiber = nextEffect
    commitPassiveUnmountInsideDeletedTreeOnFiber(fiber, nearestMountedAncestor)

    const child = fiber.child
    if (child !== null) {
      ensureCorrectReturnPointer(child, fiber)
      nextEffect = child
    } else {
      commitPassiveUnmountEffectsInsideOfDeletedTree_complete(
        deletedSubtreeRoot
      )
    }
  }
}

const commitPassiveUnmountEffects_begin = () => {
  while (nextEffect !== null) {
    const fiber = nextEffect
    const child = fiber.child

    if ((nextEffect.flags & ChildDeletion) !== NoFlags) {
      const deletions = fiber.deletions
      if (deletions !== null) {
        for (let i = 0; i < deletions.length; ++i) {
          const fiberToDelete = deletions[i]
          nextEffect = fiberToDelete
          commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
            fiberToDelete,
            fiber
          )
        }
        const previousFiber = fiber.alternate

        if (previousFiber !== null) {
          let detachedChild = previousFiber.child
          if (detachedChild !== null) {
            previousFiber.child = null
            do {
              const detachedSibling: Fiber | null = detachedChild.sibling
              detachedChild.sibling = null
              detachedChild = detachedSibling
            } while (detachedChild !== null)
          }
        }

        nextEffect = fiber
      }

      if ((fiber.subtreeFlags & PassiveMask) !== NoFlags && child !== null) {
        ensureCorrectReturnPointer(child, fiber)
        nextEffect = child
      } else {
        commitPassiveUnmountEffects_complete()
      }
    }

    if ((fiber.subtreeFlags & PassiveMask) !== NoFlags && child !== null) {
      ensureCorrectReturnPointer(child, fiber)
      nextEffect = child
    } else {
      commitPassiveUnmountEffects_complete()
    }
  }
}

const commitPassiveUnmountEffects_complete = () => {
  while (nextEffect !== null) {
    const fiber = nextEffect
    if ((fiber.flags & Passive) !== NoFlags) {
      commitPassiveUnmountOnFiber(fiber)
    }

    const sibling = fiber.sibling
    if (sibling !== null) {
      ensureCorrectReturnPointer(sibling, fiber.return!)
      nextEffect = sibling
      return
    }

    nextEffect = fiber.return
  }
}

const commitHookEffectListUnmount = (flags: HookFlags, finishedWork: Fiber) => {
  const updateQueue: FunctionComponentUpdateQueue | null =
    finishedWork.updateQueue as any

  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null

  if (lastEffect !== null) {
    const firstEffect = lastEffect.next
    let effect = firstEffect
    do {
      if ((effect.tag & flags) === flags) {
        const destroy = effect.destroy
        effect.destroy = undefined
        if (destroy !== undefined) {
          destroy()
        }
      }

      effect = effect.next
    } while (effect !== firstEffect)
  }
}

const commitPassiveUnmountOnFiber = (finishedWork: Fiber): void => {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      commitHookEffectListUnmount(HookHasEffect | HookPassive, finishedWork)
      break
    }
    default: {
      throw new Error('Not Implement')
    }
  }
}

const commitHookEffectListMount = (tag: number, finishedWork: Fiber): void => {
  const updateQueue: FunctionComponentUpdateQueue | null =
    finishedWork.updateQueue as any
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next

    let effect = firstEffect

    do {
      if ((effect.tag & tag) === tag) {
        const create = effect.create
        effect.destroy = create()
      }

      effect = effect.next
    } while (effect !== firstEffect)
  }
}

const commitPassiveMountOnFiber = (
  finishedRoot: FiberRoot,
  finishedWork: Fiber
): void => {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      commitHookEffectListMount(HookPassive | HookHasEffect, finishedWork)
      break
    }
    default: {
      throw new Error('Not Implement')
    }
  }
}

const commitPassiveMountEffects_complete = (
  subtreeRoot: Fiber,
  root: FiberRoot
) => {
  while (nextEffect !== null) {
    const fiber = nextEffect

    if ((fiber.flags & Passive) !== NoFlags) {
      commitPassiveMountOnFiber(root, fiber)
    }

    if (fiber === subtreeRoot) {
      nextEffect = null
      return
    }

    const sibling = fiber.sibling
    if (sibling !== null) {
      ensureCorrectReturnPointer(sibling, fiber.return!)
      nextEffect = sibling
      return
    }

    nextEffect = fiber.return
  }
}

const commitPassiveMountEffects_begin = (
  subtreeRoot: Fiber,
  root: FiberRoot
): void => {
  while (nextEffect !== null) {
    const fiber = nextEffect
    const firstChild = fiber.child

    if ((fiber.subtreeFlags & PassiveMask) !== NoFlags && firstChild !== null) {
      ensureCorrectReturnPointer(firstChild, fiber)
      nextEffect = firstChild
    } else {
      commitPassiveMountEffects_complete(subtreeRoot, root)
    }
  }
}

export const commitPassiveMountEffects = (
  root: FiberRoot,
  finishedWork: Fiber
): void => {
  nextEffect = finishedWork
  commitPassiveMountEffects_begin(finishedWork, root)
}

const commitBeforeMutationEffectsOnFiber = (finishedWork: Fiber): void => {
  const current = finishedWork.alternate
  const flags = finishedWork.flags

  //todo Snapshot
}

export const commitBeforeMutationEffects = (
  root: FiberRoot,
  firstChild: Fiber
): void => {
  nextEffect = firstChild

  commitBeforeMutationEffects_begin()
}

export const commitMutationEffects = (
  root: FiberRoot,
  firstChild: Fiber
): void => {
  nextEffect = firstChild

  commitMutationEffects_begin(root)
}

const commitUnmount = (
  finishedRoot: FiberRoot,
  current: Fiber,
  nearestMountedAncestor: Fiber
): void => {
  switch (current.tag) {
    case HostComponent: {
      //todo safelyDetachRef
      return
    }
    default:
      throw new Error('Not Implement')
  }
}

/**
 * 把以root为根节点的子fiber树unmount
 * @param finishedRoot
 * @param root
 * @param nearestMountedAncestor
 * @returns
 */
const commitNestedUnmounts = (
  finishedRoot: FiberRoot,
  root: Fiber,
  nearestMountedAncestor: Fiber
) => {
  let node: Fiber = root

  //下面的代码相当于dfs的循环版本
  while (true) {
    commitUnmount(finishedRoot, node, nearestMountedAncestor)

    //如果该节点有子节点有子节点则一直往下走
    if (node.child !== null) {
      node.child.return = node
      node = node.child
      continue
    }

    if (node === root) return

    //该层已经全部处理完，是时候返回上一层了
    while (node.sibling === null) {
      if (node.return === null || node.return === root) {
        return
      }

      node = node.return
    }

    node.sibling.return = node.return
    node = node.sibling
  }
}

const unmountHostComponents = (
  finishedRoot: FiberRoot,
  current: Fiber,
  nearestMountedAncestor: Fiber
): void => {
  let node: Fiber = current

  let currentParentIsValid = false

  let currentParent
  let currentParentIsContainer

  while (true) {
    if (!currentParentIsValid) {
      let parent = node.return

      findParent: while (true) {
        const parentStateNode = parent?.stateNode
        switch (parent?.tag) {
          case HostComponent:
            currentParent = parentStateNode
            currentParentIsContainer = false
            break findParent
          case HostRoot:
            currentParent = parentStateNode.containerInfo
            currentParentIsContainer = true
            break findParent
        }
        parent = parent!.return
      }

      currentParentIsValid = true
    }

    if (node.tag === HostComponent || node.tag === HostText) {
      commitNestedUnmounts(finishedRoot, node, nearestMountedAncestor)

      if (currentParentIsContainer) {
        throw new Error('Not Implement')
      } else {
        removeChild(currentParent, node.stateNode)
      }
    } else {
      throw new Error('Not Implement')
    }

    if (node === current) {
      return
    }

    throw new Error('Not Implement')
  }
}

const detachFiberMutation = (fiber: Fiber) => {
  //剪短return指针将结点从树中断开
  const alternate = fiber.alternate
  if (alternate !== null) {
    alternate.return = null
  }
  fiber.return = null
}

const commitDeletion = (
  finishedRoot: FiberRoot,
  current: Fiber,
  nearestMountedAncestor: Fiber
): void => {
  unmountHostComponents(finishedRoot, current, nearestMountedAncestor)

  detachFiberMutation(current)
}

const isHostParent = (fiber: Fiber): boolean => {
  return fiber.tag === HostComponent || fiber.tag === HostRoot
}

const getHostParentFiber = (fiber: Fiber): Fiber => {
  let parent = fiber.return

  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent
    }

    parent = parent.return
  }

  throw new Error('Expected to find a host parent')
}
/**
 * 找到一个fiber节点右边首个不需要插入的dom节点
 * @param fiber 从该节点开始往右边找
 * @returns 找到的dom节点
 */
const getHostSibling = (fiber: Fiber): Element | null => {
  let node: Fiber = fiber

  siblings: while (true) {
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) return null
      node = node.return
    }

    node.sibling.return = node.return
    node = node.sibling

    while (node.tag !== HostComponent) {
      if (node.flags & Placement) {
        continue siblings
      }

      if (node.child === null) {
        continue siblings
      } else {
        node.child.return = node
        node = node.child
      }
    }

    if (!(node.flags & Placement)) {
      return node.stateNode
    }
  }
}

const insertOrAppendPlacementNode = (
  node: Fiber,
  before: Element | null,
  parent: Element
): void => {
  const { tag } = node

  const isHost = tag === HostComponent || tag === HostText

  if (isHost) {
    const stateNode = isHost ? node.stateNode : node.stateNode.instance
    if (before) {
      insertBefore(parent, stateNode, before)
    } else {
      appendChild(parent, stateNode)
    }
  } else {
    const child = node.child
    if (child !== null) {
      insertOrAppendPlacementNode(child, before, parent)

      let sibling = child.sibling

      while (sibling !== null) {
        insertOrAppendPlacementNode(sibling, before, parent)
        sibling = sibling.sibling
      }
    }
  }
}

const insertOrAppendPlacementNodeIntoContainer = (
  node: Fiber,
  before: Element | null,
  parent: Container
): void => {
  const { tag } = node
  const isHost = tag === HostComponent || tag === HostText

  if (isHost) {
    const stateNode = node.stateNode

    if (before) {
      insertInContainerBefore(parent, stateNode, before)
    } else {
      appendChildToContainer(parent, stateNode)
    }
  } else {
    const child = node.child

    if (child !== null) {
      insertOrAppendPlacementNodeIntoContainer(child, before, parent)
      let sibling = child.sibling
      while (sibling !== null) {
        insertOrAppendPlacementNodeIntoContainer(sibling, before, parent)
        sibling = sibling.sibling
      }
    }
  }
}

const commitPlacement = (finishedWork: Fiber): void => {
  const parentFiber = getHostParentFiber(finishedWork)

  let parent
  let isContainer

  const parentStateNode = parentFiber.stateNode

  switch (parentFiber.tag) {
    case HostComponent:
      parent = parentStateNode
      isContainer = false
      break

    case HostRoot:
      parent = parentStateNode.containerInfo
      isContainer = true
      break
    default: {
      throw new Error('Invalid host parent fiber')
    }
  }

  if (parentFiber.flags & ContentReset) {
    //todo
    throw new Error('Not Implement')
  }

  const before = getHostSibling(finishedWork)

  if (isContainer) {
    insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent)
  } else {
    insertOrAppendPlacementNode(finishedWork, before, parent)
  }
}

export const commitLayoutEffects = (
  finishedWork: Fiber,
  root: FiberRoot
): void => {
  nextEffect = finishedWork

  //todo
  //   commitLayoutEffects_begin(finishedWork, root)
}

const commitWork = (current: Fiber | null, finishedWork: Fiber): void => {
  switch (finishedWork.tag) {
    case FunctionComponent:
      // commitHookEffectListUnmount()
      throw new Error('Not Implement')

      return
    case HostComponent: {
      const instance: Element = finishedWork.stateNode

      if (instance) {
        const newProps = finishedWork.memoizedProps
        const oldProps = current !== null ? current.memoizedProps : newProps
        const type = finishedWork.type

        const updatePayload: null | UpdatePayload =
          finishedWork.updateQueue as any

        finishedWork.updateQueue = null

        if (updatePayload !== null) {
          commitUpdate(
            instance,
            updatePayload,
            type,
            oldProps,
            newProps,
            finishedWork
          )
        }
      }
    }
    case HostText: {
      const textInstance: Text = finishedWork.stateNode
      const newText = finishedWork.memoizedProps

      const oldText = current !== null ? current.memoizedProps : newText

      commitTextUpdate(textInstance, oldText, newText)
      return
    }
    default: {
      throw new Error('Not Implement')
    }
  }
}

const commitMutationEffectsOnFiber = (
  finishedWork: Fiber,
  root: FiberRoot
): void => {
  const flags = finishedWork.flags

  if (flags & ContentReset) {
    //todo
    throw new Error('Not Implement')
  }

  const primaryFlags = flags & (Placement | Update)

  switch (primaryFlags) {
    case Placement: {
      commitPlacement(finishedWork)
      finishedWork.flags &= ~Placement
      break
    }
    case 0: {
      break
    }
    case PlacementAndUpdate: {
      commitPlacement(finishedWork)
      finishedWork.flags &= ~Placement
      const current = finishedWork.alternate
      commitWork(current, finishedWork)
      break
    }
    case Update: {
      const current = finishedWork.alternate
      commitWork(current, finishedWork)
      break
    }
    default: {
      throw new Error('Not Implement')
    }
  }
}

const commitMutationEffects_complete = (root: FiberRoot) => {
  while (nextEffect !== null) {
    const fiber = nextEffect

    commitMutationEffectsOnFiber(fiber, root)

    const sibling = fiber.sibling
    if (sibling !== null) {
      ensureCorrectReturnPointer(sibling, fiber.return!)
      nextEffect = sibling
      return
    }

    nextEffect = fiber.return
  }
}

const commitMutationEffects_begin = (root: FiberRoot): void => {
  while (nextEffect !== null) {
    const fiber = nextEffect

    // todo 删除fiber节点
    const deletions = fiber.deletions
    if (deletions !== null) {
      for (let i = 0; i < deletions.length; ++i) {
        const childToDelete = deletions[i]

        commitDeletion(root, childToDelete, fiber)
      }
    }

    const child = fiber.child

    if ((fiber.subtreeFlags & MutationMask) !== NoFlags && child !== null) {
      ensureCorrectReturnPointer(child, fiber)
      nextEffect = child
    } else {
      commitMutationEffects_complete(root)
    }
  }
}
