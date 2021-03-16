import { Container } from '../react-dom/ReactDomRoot'
import {
  BeforeMutationMask,
  ContentReset,
  MutationMask,
  NoFlags,
  Placement,
  Update,
} from './ReactFiberFlags'
import {
  appendChild,
  appendChildToContainer,
  insertBefore,
  insertInContainerBefore,
} from './ReactFiberHostConfig'
import { Fiber, FiberRoot } from './ReactInternalTypes'
import { HostComponent, HostRoot, HostText } from './ReactWorkTags'

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

const commitDeletion = (
  finishedRoot: FiberRoot,
  current: Fiber,
  nearestMountedAncestor: Fiber
): void => {}

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

const commitMutationEffectsOnFiber = (
  finishedWork: Fiber,
  root: FiberRoot
): void => {
  const flags = finishedWork.flags

  if (flags & ContentReset) {
    //todo
  }

  const primaryFlags = flags & (Placement | Update)

  switch (primaryFlags) {
    case Placement: {
      commitPlacement(finishedWork)
      finishedWork.flags &= ~Placement
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

    //todo 删除fiber节点
    // const deletions = fiber.deletions
    // if (deletions !== null) {
    //   for (let i = 0; i < deletions.length; ++i) {
    //     const childToDelete = deletions[i]

    //     commitDeletion(root, childToDelete, fiber)
    //   }
    // }

    const child = fiber.child

    if ((fiber.subtreeFlags & MutationMask) !== NoFlags && child !== null) {
      ensureCorrectReturnPointer(child, fiber)
      nextEffect = child
    } else {
      commitMutationEffects_complete(root)
    }
  }
}
