import { Container } from '../react-dom/ReactDomRoot'
import { ReactNodeList } from '../shared/ReactTypes'
import { createFiberRoot } from './ReactFiberRoot'
import {
  requestEventTime,
  requestUpdateLane,
  scheduleUpdateOnFiber,
} from './ReactFiberWorkLoop'
import { Fiber, FiberRoot } from './ReactInternalTypes'
import { RootTag } from './ReactRootTags'
import { createUpdate, enqueueUpdate } from './ReactUpdateQueue'
import { discreteUpdates, batchedEventUpdates } from './ReactFiberWorkLoop'

/**
 *
 * @param containerInfo 当前创建的React App所挂载在的dom节点，在concurrent模式下由createRoot方法传入
 * @param tag 决定fiber树是以什么模式创建的(concurrent,legacy)
 * @returns 返回FiberRoot（整个应用的根节点，其中current保存有当前页面所对应的fiber树）
 */
export const createContainer = (
  containerInfo: Container,
  tag: RootTag
): FiberRoot => {
  return createFiberRoot(containerInfo, tag)
}

/**
 *
 * @param element 由react.createElement创建的jsx对象在legacy模式下由ReactDom.render方法第一个参数传入
 * @param container 整个应用的根节点(类型为FiberRoot)，其current属性(类型为Fiber，是否为Fiber树根节点由tag是否为HostRoot决定)保存有当前页面所对应的fiber树
 */
export const updateContainer = (
  element: ReactNodeList,
  container: FiberRoot
) => {
  const current: Fiber = container.current
  const eventTime = requestEventTime()
  //获得该次更新的优先级如果不处于ConcurrentMode下的话优先级永远都为Sync
  const lane = requestUpdateLane(current)
  //创建一个更新，由于我们只实现了Function类型的组件
  //这种类型的update就只有HostRoot用到了
  const update = createUpdate()

  update.payload = { element }
  enqueueUpdate(current, update)

  /**
   * 调度该fiber节点上的更新
   */
  scheduleUpdateOnFiber(current, lane, eventTime)
}

export { discreteUpdates, batchedEventUpdates }
