import { TypeOfMode } from './ReactTypeOfMode'
import { WorkTag } from './ReactWorkTags'

/**
 * 应用根节点
 */
export type FiberRoot = {
  /**
   * 当前页面所对应的fiber树，其alternate属性指向workInProgress fiber树
   */
  current: Fiber

  /**
   * 当前应用所挂载在的dom节点,在legacy模式中为ReactDom.render方法的第二个参数
   * 在concurrent模式中为createRoot的参数
   */
  containerInfo: any
}

export type Fiber = {
  memoizedState: any
  /**
   * 该fiber节点对于的相关节点(类组件为为类实例，dom组件为dom节点)
   */
  stateNode: any

  /**
   * 存放了该fiber节点上的更新信息
   */
  updateQueue: unknown

  tag: WorkTag

  /**
   * 该fiber节点父节点（以HostRoot为tag的fiber节点return属性为null）
   */
  return: Fiber | null

  /**
   * 该节点链接了workInPrgress树和current fiber树之间的节点
   */
  alternate: Fiber | null

  /**
   * 用来标识该fiber节点,用于多节点children进行diff时优化时间复杂度
   */
  key: string | null

  /**
   * 描述fiber节点及其子树属性BitSet
   * 当一个fiber被创建时他的该属性和父节点一致
   * 当以ReactDom.render创建应用时mode为LegacyMode，
   * 当以createRoot创建时mode为ConcurrentMode
   */
  mode: TypeOfMode
}
