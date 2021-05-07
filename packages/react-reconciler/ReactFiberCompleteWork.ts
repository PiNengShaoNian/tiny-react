import {
  createTextInstance,
  finalizeInitialChildren,
  prepareUpdate,
  Props,
  Type,
} from '../react-dom/ReactDOMHostConfig'
import { NoFlags, Update } from './ReactFiberFlags'
import { appendInitialChild, createInstance } from './ReactFiberHostConfig'
import { mergeLanes, NoLanes } from './ReactFiberLane'
import { Fiber } from './ReactInternalTypes'
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
} from './ReactWorkTags'

const appendAllChildren = (parent: Element, workInProgress: Fiber): void => {
  let node: Fiber | null = workInProgress.child
  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode)
    } else if (node.child !== null) {
      //如果该子节点不是一个HostComponent则继续向下找
      node.child.return = node
      node = node.child
      continue
    }

    if (node === workInProgress) {
      return
    }

    while (node.sibling === null) {
      //该层级所有以node为父节点的子树中离parent最近的dom已经完成追加，是时候返回到上层了
      /**
       *          FunctionComp A
       * FunctionCompB     FunctionCompC    FunctionCompD
       *                       domE
       * 如果此时处于node为domE，那么将node置为FunctionCompC就会跳出这个循环
       *
       */
      if (node.return === null || node.return === workInProgress) return

      node = node?.return ?? null
    }

    //以该node为父节点的子树中离parent最近的dom已经完成追加，尝试对同级中其他fiber节点执行相同操作
    node.sibling.return = node.return
    node = node.sibling
  }
}

const bubbleProperties = (completedWork: Fiber): boolean => {
  const didBailout =
    completedWork.alternate !== null &&
    completedWork.alternate.child === completedWork.child
  let subtreeFlags = NoFlags
  let newChildLanes = NoLanes

  if (!didBailout) {
    let child = completedWork.child

    while (child !== null) {
      subtreeFlags |= child.subtreeFlags
      subtreeFlags |= child.flags

      child.return = completedWork

      child = child.sibling
    }
    completedWork.subtreeFlags |= subtreeFlags
  } else {
    let child = completedWork.child

    while (child !== null) {
      newChildLanes = mergeLanes(
        newChildLanes,
        mergeLanes(child.lanes, child.childLanes)
      )

      subtreeFlags |= child.subtreeFlags
      subtreeFlags |= child.flags

      child.return = completedWork

      child = child.sibling
    }
  }

  return didBailout
}

const hadNoMutationsEffects = (current: null | Fiber, completedWork: Fiber) => {
  // const didBailout = current !== null && current.child === completedWork.child

  // if (didBailout) return didBailout
  //todo
  return false
}

const markUpdate = (workInProgress: Fiber) => {
  workInProgress.flags |= Update
}

const updateHostText = (
  current: Fiber,
  workInProgress: Fiber,
  oldText: string,
  newText: string
) => {
  if (oldText !== newText) {
    markUpdate(workInProgress)
  }
}

const updateHostComponent = (
  current: Fiber,
  workInProgress: Fiber,
  type: Type,
  newProps: Props
) => {
  const oldProps = current.memoizedProps
  if (oldProps === newProps) {
    return
  }

  const instance: Element = workInProgress.stateNode

  const updatePayload = prepareUpdate(instance, type, oldProps, newProps)

  workInProgress.updateQueue = updatePayload
  if (updatePayload) {
    markUpdate(workInProgress)
  }
}

export const completeWork = (
  current: Fiber | null,
  workInProgress: Fiber
): Fiber | null => {
  const newProps = workInProgress.pendingProps

  switch (workInProgress.tag) {
    case IndeterminateComponent:
    case FunctionComponent:
      bubbleProperties(workInProgress)
      return null
    case HostRoot: {
      //todo
      //   const fiberRoot = workInProgress.stateNode
      bubbleProperties(workInProgress)
      return null
    }
    case HostComponent: {
      const type = workInProgress.type
      if (current !== null && workInProgress.stateNode != null) {
        updateHostComponent(current, workInProgress, type, newProps)
      } else {
        const instance = createInstance(type, newProps, workInProgress)

        //由于是前序遍历，当workInProgress进行归阶段时，
        //其所有子节点都已完成了递和归阶段，也就是意味着其子树的所有dom节点已经创建
        //所以只需要把子树中离instance最近的dom节点追加到instance上即可
        appendAllChildren(instance, workInProgress)
        workInProgress.stateNode = instance

        if (finalizeInitialChildren(instance, type, newProps)) {
          throw new Error('Not Implement')
        }
      }

      bubbleProperties(workInProgress)
      return null
    }
    case HostText: {
      const newText = newProps

      if (current && workInProgress.stateNode !== null) {
        /**
         * 如果我们复用了改节点，那么意味着我们需要一个side-effect去做这个更新
         */
        const oldText = current.memoizedProps
        updateHostText(current, workInProgress, oldText, newText)
      } else {
        workInProgress.stateNode = createTextInstance(newText)
      }
      bubbleProperties(workInProgress)
      return null
    }
  }

  throw new Error('Not implement')
}
