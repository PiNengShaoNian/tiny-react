import { Fiber } from './ReactInternalTypes'
import { cloneUpdateQueue, processUpdateQueue } from './ReactUpdateQueue'
import { HostRoot } from './ReactWorkTags'

/**
 * 更新HostRoot节点
 * @param current
 * @param workInProgress
 * @returns
 */
const updateHostRoot = (current: Fiber, workInProgress: Fiber) => {
  cloneUpdateQueue(current, workInProgress)
  processUpdateQueue(workInProgress, nextProps, null)
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
    case HostRoot: {
      //HostRoot类型current,workInProgress一定会同时存在
      return updateHostRoot(current!, workInProgress)
    }
  }

  return null
}
