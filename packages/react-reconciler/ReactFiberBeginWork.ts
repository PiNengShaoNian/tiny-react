import { shouldSetTextContent } from './ReactFiberHostConfig'
import { mountChildFibers, reconcileChildFibers } from './ReactChildFiber'
import { renderWithHooks } from './ReactFiberHooks'
import { Fiber } from './ReactInternalTypes'
import { cloneUpdateQueue, processUpdateQueue } from './ReactUpdateQueue'
import {
  FunctionComponent,
  HostComponent,
  HostRoot,
  IndeterminateComponent,
} from './ReactWorkTags'

/**
 * 更新HostRoot节点
 * @param current
 * @param workInProgress
 * @returns
 */
const updateHostRoot = (current: Fiber, workInProgress: Fiber) => {
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

  reconcileChildren(current, workInProgress, nextChildren)

  return workInProgress.child
}

const reconcileChildren = (
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any
) => {
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)
  } else {
    //todo update
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren
    )
  }
}

const mountIndeterminateComponent = (
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any
): Fiber | null => {
  const props = workInProgress.pendingProps
  const value = renderWithHooks(current, workInProgress, Component, props, null)

  workInProgress.tag = FunctionComponent
  reconcileChildren(null, workInProgress, value)

  return workInProgress.child
}

const updateHostComponent = (current: Fiber | null, workInProgress: Fiber) => {
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

  reconcileChildren(current, workInProgress, nextChildren)
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
  workInProgress: Fiber
): Fiber | null => {
  //当页面第一次渲染时current fiber除了FiberRoot.current的HostRoot节点其他都还未创建,
  //workInPgress树中的HostRoot(FiberRoot.current.alternate)也在prepareFreshStack函数中被创建
  if (current !== null) {
  }

  switch (workInProgress.tag) {
    case IndeterminateComponent: {
      //在mount时FunctionComponent是按indeterminate处理的
      return mountIndeterminateComponent(
        current,
        workInProgress,
        workInProgress.type
      )
    }
    case HostRoot: {
      //HostRoot类型current,workInProgress一定会同时存在
      return updateHostRoot(current!, workInProgress)
    }
    case HostComponent:
      return updateHostComponent(current, workInProgress)
  }

  throw new Error('Not Implement')
}
