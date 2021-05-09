import { shouldSetTextContent } from './ReactFiberHostConfig'
import {
  cloneChildFibers,
  mountChildFibers,
  reconcileChildFibers,
} from './ReactChildFiber'
import { renderWithHooks } from './ReactFiberHooks'
import { Fiber } from './ReactInternalTypes'
import { cloneUpdateQueue, processUpdateQueue } from './ReactUpdateQueue'
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  HostText,
  IndeterminateComponent,
} from './ReactWorkTags'
import { includesSomeLane, Lanes, NoLanes } from './ReactFiberLane'

let didReceiveUpdate = false

const updateFunctionComponent = (
  current: Fiber | null,
  workInProgress: Fiber,
  Component: Function,
  nextProps: any,
  renderLanes: Lanes
): Fiber | null => {
  const nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component as any,
    nextProps,
    null,
    renderLanes
  )

  if (current !== null && !didReceiveUpdate) {
    // throw new Error('Not Implement')
    current.lanes = NoLanes
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes)
  }

  reconcileChildren(current, workInProgress, nextChildren, renderLanes)
  return workInProgress.child
}

const bailoutOnAlreadyFinishedWork = (
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null => {
  //检查该节点的children是否存在待进行的工作
  if (!includesSomeLane(renderLanes, workInProgress.childLanes)) {
    /**
     * children也没有待进行的工作，我们可以直接跳过他们的render工作
     */
    return null
  }

  //该节点没有工作，但是他的子节点有，clone他的子节点，然后继续
  cloneChildFibers(current, workInProgress)
  return workInProgress.child
}

/**
 * 更新HostRoot节点
 * @param current
 * @param workInProgress
 * @returns
 */
const updateHostRoot = (
  current: Fiber,
  workInProgress: Fiber,
  renderLanes: Lanes
) => {
  cloneUpdateQueue(current, workInProgress)
  //当第一次mount时payload为 {element: jsx对象}
  const prevState = workInProgress.memoizedState
  const prevChildren = prevState !== null ? prevState.element : null
  //HostRoot的pendingProps为null
  const nextProps = workInProgress.pendingProps
  processUpdateQueue(workInProgress, nextProps, null)
  const nextState = workInProgress.memoizedState

  const nextChildren = nextState.element

  if (nextChildren === prevChildren) {
    //todo 前后jsx对象没有变
    return null
  }

  reconcileChildren(current, workInProgress, nextChildren, renderLanes)

  return workInProgress.child
}

const reconcileChildren = (
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
  renderLanes: Lanes
) => {
  if (current === null) {
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes
    )
  } else {
    //todo update
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
      renderLanes
    )
  }
}

const mountIndeterminateComponent = (
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  renderLanes: Lanes
): Fiber | null => {
  const props = workInProgress.pendingProps
  const value = renderWithHooks(
    current,
    workInProgress,
    Component,
    props,
    null,
    renderLanes
  )

  workInProgress.tag = FunctionComponent
  reconcileChildren(null, workInProgress, value, renderLanes)

  return workInProgress.child
}

const updateHostComponent = (
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
) => {
  const type = workInProgress.type
  const nextProps = workInProgress.pendingProps
  const prevProps = current !== null ? current.memoizedProps : null

  let nextChildren = nextProps.children
  //子节点是否可以直接设置成字符串而不用继续reconcile
  const isDirectTextChild = shouldSetTextContent(type, nextProps)

  if (isDirectTextChild) {
    nextChildren = null
  } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
    // workInProgress.flags |= ContentRest
  }

  reconcileChildren(current, workInProgress, nextChildren, renderLanes)
  return workInProgress.child
}

/**
 * 传入当前Fiber节点，创建子Fiber节点
 * @param current 当前节点
 * @param workInProgress workInProgress节点
 * @returns 下一个要进行beginWork的节点
 */
export const beginWork = (
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes
): Fiber | null => {
  const updateLanes = workInProgress.lanes

  //当页面第一次渲染时current fiber除了FiberRoot.current的HostRoot节点其他都还未创建,
  //workInPgress树中的HostRoot(FiberRoot.current.alternate)也在prepareFreshStack函数中被创建
  if (current !== null) {
    const oldProps = current.memoizedProps
    const newProps = workInProgress.pendingProps

    if (oldProps !== newProps) {
      didReceiveUpdate = true
    } else if (!includesSomeLane(renderLanes, updateLanes)) {
      didReceiveUpdate = false
      switch (workInProgress.tag) {
        case HostRoot:
          break
        case HostText:
          break
        case FunctionComponent:
          break
        default: {
          throw new Error('Not Implement')
        }
      }

      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes)
    }
  } else {
    didReceiveUpdate = false
  }

  //在进入begin流程前，先清除pending中的lanes，否则会导致HostRoot不能进入bailout逻辑，
  //导致后续的更新不会触发
  workInProgress.lanes = NoLanes

  switch (workInProgress.tag) {
    case IndeterminateComponent: {
      //在mount时FunctionComponent是按indeterminate处理的
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type,
        renderLanes
      )
    }
    case FunctionComponent: {
      const Component = workInProgress.type
      const unresolvedProps = workInProgress.pendingProps
      const resolvedProps = unresolvedProps
      return updateFunctionComponent(
        current!,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes
      )
    }
    case HostRoot: {
      //HostRoot类型current,workInProgress一定会同时存在
      return updateHostRoot(current!, workInProgress, renderLanes)
    }
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes)
    case HostText:
      return null
  }

  throw new Error('Not Implement')
}

export const markWorkInProgressReceivedUpdate = () => {
  didReceiveUpdate = true
}
