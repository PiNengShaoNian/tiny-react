import { Flags } from './ReactFiberFlags'
import { Lane, LaneMap, Lanes } from './ReactFiberLane'
import { RootTag } from './ReactRootTags'
import { TypeOfMode } from './ReactTypeOfMode'
import { WorkTag } from './ReactWorkTags'

/**
 * 应用根节点
 */
export type FiberRoot = {
  /**
   * 当前完成render阶段构建完成的workInProgress树根节点
   */
  finishedWork: Fiber | null
  /**
   * 当前页面所对应的fiber树，其alternate属性指向workInProgress fiber树
   */
  current: Fiber

  /**
   * 当前应用所挂载在的dom节点,在legacy模式中为ReactDom.render方法的第二个参数
   * 在concurrent模式中为createRoot的参数
   */
  containerInfo: any

  /**
   * Scheduler.scheduleCallback的返回值，代表了下次执行render的task
   */
  callbackNode: unknown
  callbackPriority: Lane

  pendingLanes: Lanes
  expiredLanes: Lanes
  expirationTimes: LaneMap<number>
  eventTimes: LaneMap<number>

  /**
   * root的类型(legacy, batched,concurrent等)
   */
  tag: RootTag
}

export type Fiber = {
  /**
   * 该fiber节点处于同级兄弟节点的第几位
   */
  index: number
  /**
   * 此次commit中需要删除的fiber节点
   */
  deletions: Fiber[] | null
  /**
   * 子树带有的更新操作，用于减少查找fiber树上更新的时间复杂度
   */
  subtreeFlags: Flags
  /**
   *一个Bitset代表该fiber节点上带有的更新操作,比如第二位为1就代表该节点需要插入
   */
  flags: Flags
  /**
   * 新创建jsx对象的第二个参数,像HostRoot这种内部自己创建的Fiber节点为null
   */
  pendingProps: any
  /**
   * 上一轮更新完成后的props
   */
  memoizedProps: any
  /**
   *其子节点为单链表结构child指向了他的第一个子节点后续子节点可通过child.sibling获得
   */
  child: Fiber | null

  /**
   * 该fiber节点的兄弟节点，他们都有着同一个父fiber节点
   */
  sibling: Fiber | null
  /**
   * 在我们的实现中只有Function组件对应的fiber节点使用到了该属性
   * function组件会用他来存储hook组成的链表,在react中很多数据结构
   * 都有该属性，注意不要弄混了
   */
  memoizedState: any
  /**
   * 该fiber节点对于的相关节点(类组件为为类实例，dom组件为dom节点)
   */
  stateNode: any

  /**
   * 存放了该fiber节点上的更新信息,其中HostRoot,FunctionComponent, HostComponent
   * 的updateQueue各不相同，函数的组件的updateQueue是一个存储effect的链表
   * 比如一个函数组件内有若干个useEffect，和useLayoutEffect，那每个effect
   * 就会对应这样的一个数据结构
   * {
   *  tag: HookFlags //如果是useEffect就是Passive如果是useLayoutEffect就是Layout
   *  create: () => (() => void) | void //useEffect的第一个参数
   *  destroy: (() => void) | void //useEffect的返回值
   *  deps: unknown[] | null //useEffect的第二个参数
   *  next: Effect
   * }
   * 各个effect会通过next连接起来
   * HostComponent的updateQueue表示了该节点所要进行的更新，
   * 比如他可能长这样
   * ['children', 'new text', 'style', {background: 'red'}]
   * 代表了他对应的dom需要更新textContent和style属性
   */
  updateQueue: unknown

  /**
   * 表示了该节点的类型，比如HostComponent,FunctionComponent,HostRoot
   * 详细信息可以查看react-reconciler\ReactWorkTags.ts
   */
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
   * 用于多节点children进行diff时提高节点复用的正确率
   */
  key: string | null

  /**
   * 如果是自定义组件则该属性就是和该fiber节点关联的function或class
   * 如果是div,span则就是一个字符串
   */
  type: any

  /**
   * 表示了元素的类型，fiber的type属性会在reconcile的过程中改变，但是
   * elementType是一直不变的，比如Memo组件的type在jsx对象中为
   * {
   *  $$typeof: REACT_MEMO_TYPE,
   *  type,
   *  compare: compare === undefined ? null : compare,
   * }
   * 在经过render阶段后会变为他包裹的函数，所以在render前后是不一致的
   * 而我们在diff是需要判断一个元素的type有没有改变，
   * 以判断能不能复用该节点，这时候elementType就派上用场
   * 了，因为他是一直不变的
   */
  elementType: any

  /**
   * 描述fiber节点及其子树属性BitSet
   * 当一个fiber被创建时他的该属性和父节点一致
   * 当以ReactDom.render创建应用时mode为LegacyMode，
   * 当以createRoot创建时mode为ConcurrentMode
   */
  mode: TypeOfMode

  /**
   * 用来判断该Fiber节点是否存在更新，以及改更新的优先级
   */
  lanes: Lanes
  /**
   * 用来判断该节点的子节点是否存在更新
   */
  childLanes: Lanes
}

type Dispatch<A> = (a: A) => void
type BasicStateAction<S> = ((a: S) => S) | S

export type Dispatcher = {
  useState<S>(initialState: (() => S) | S): [S, Dispatch<BasicStateAction<S>>]
  useEffect(
    create: () => (() => void) | void,
    deps: unknown[] | void | null
  ): void
  useLayoutEffect(
    create: () => (() => void) | void,
    deps: unknown[] | void | null
  ): void
}
