import {
  createTextInstance,
  finalizeInitialChildren,
  prepareUpdate,
  Props,
  Type,
} from '../react-dom/ReactDOMHostConfig'
import { NoFlags, StaticMask, Update } from './ReactFiberFlags'
import { appendInitialChild, createInstance } from './ReactFiberHostConfig'
import { mergeLanes, NoLanes } from './ReactFiberLane'
import { Fiber } from './ReactInternalTypes'
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
  MemoComponent,
  SimpleMemoComponent,
} from './ReactWorkTags'

/**
 * 将以workInProgress为根的fiber子树,其中包含的所有dom节点，其中最顶层dom
 * 节点加到parent dom节点的子节点中
 * @param parent
 * @param workInProgress
 * @returns
 */
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
       * 比如下面的例子
       *          FunctionComp A
       * FunctionCompB     FunctionCompC    FunctionCompD
       *                       domE
       * 如果进入循环时此时node为domE，一轮循环后当node被赋值为FunctionCompC后就会跳出这个循环
       * 然后继续进行FunctionCompD的工作
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

/**
 * 将该节点的子节点上的lanes,和flags全部冒泡到他的childLanes和subtreeFlags中
 * 只用冒泡一级就行，因为我们对每层的节点都会进行该操作
 * @param completedWork 其子节点需要冒泡的节点
 * @returns
 */
const bubbleProperties = (completedWork: Fiber): boolean => {
  //didBailout用来判断completedWork是否为静态节点，如果一个节点为静态节点
  //那么该节点会经过bailoutOnAlreadyFinishedWork并且他的childLanes为NoLanes
  //此时两棵fiber树中他子节点对于的fiber节点是严格相等的
  //详细逻辑可以查看react-reconciler\ReactFiber.ts下的
  //createWorkInProgress函数
  const didBailout =
    completedWork.alternate !== null &&
    completedWork.alternate.child === completedWork.child
  let subtreeFlags = NoFlags
  let newChildLanes = NoLanes

  //在这会根据是否didBailout选择是否只保留该节点
  //subtreeFlags,flags中的StaticMask我们的实现中并没有
  //使用到StaticMask所以只保留StaticMask相当于把subtreeFlags,flags
  //清除
  if (!didBailout) {
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
    completedWork.subtreeFlags |= subtreeFlags
  } else {
    let child = completedWork.child

    while (child !== null) {
      newChildLanes = mergeLanes(
        newChildLanes,
        mergeLanes(child.lanes, child.childLanes)
      )

      subtreeFlags |= child.subtreeFlags & StaticMask
      subtreeFlags |= child.flags & StaticMask

      child.return = completedWork

      child = child.sibling
    }

    completedWork.subtreeFlags |= subtreeFlags
  }

  completedWork.childLanes = newChildLanes
  return didBailout
}

/**
 * 为一个fiber节点打上更新标记，待会commit阶段会根据flags的类型
 * 进行相应的操做
 * @param workInProgress
 */
const markUpdate = (workInProgress: Fiber) => {
  workInProgress.flags |= Update
}

/**
 * 判断该文本节点更新前后的文本有没有发生改变，
 * 如果改变了就把他打上更新标记
 * @param current
 * @param workInProgress
 * @param oldText
 * @param newText
 */
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
    //更新前后的props没有变化该host component不需要进行工作
    return
  }

  const instance: Element = workInProgress.stateNode

  //前后的属性不一样，找出那些属性需要进行更新
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
    case SimpleMemoComponent:
    case MemoComponent:
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

        //由于是深度优先遍历，当workInProgress进行归阶段时，
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

        //此时current的memoizedProps和pendingProps字段都存储着更新前的文本
        //workInProgress的memoizedProps和pendingProps字段都存储着更新后的文本
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
