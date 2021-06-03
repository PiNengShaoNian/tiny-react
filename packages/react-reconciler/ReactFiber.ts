import { ReactElement } from '../shared/ReactTypes'
import { Fiber } from './ReactInternalTypes'
import { ConcurrentRoot, RootTag } from './ReactRootTags'
import {
  WorkTag,
  HostRoot,
  IndeterminateComponent,
  HostComponent,
  HostText,
} from './ReactWorkTags'
import {
  BlockingMode,
  ConcurrentMode,
  NoMode,
  TypeOfMode,
} from './ReactTypeOfMode'
import { Flags, NoFlags } from './ReactFiberFlags'
import { Lanes, NoLanes } from './ReactFiberLane'

/**
 * 属性含义可查看react-reconciler\ReactInternalTypes.ts
 * 下的Fiber Type
 */
class FiberNode {
  stateNode: any = null
  updateQueue: unknown = null
  return: Fiber | null = null
  alternate: Fiber | null = null
  memoizedState: any = null
  child: Fiber | null = null
  sibling: Fiber | null = null
  type: any = null
  memoizedProps: any = null
  flags: Flags = 0
  subtreeFlags: Flags = 0
  deletions: Fiber[] | null = null
  index: number = 0
  lanes = NoLanes
  childLanes = NoLanes

  constructor(
    public tag: WorkTag,
    public pendingProps: unknown,
    public key: null | string,
    public mode: TypeOfMode
  ) {}
}

/**
 *
 * @param tag 标志着该fiber树是以什么模式创建的
 * @returns 返回一个以HostRoot为tag的fiber节点(表示一颗fiber树的根节点)
 */
export const createHostRootFiber = (tag: RootTag): Fiber => {
  let mode

  if (tag === ConcurrentRoot) {
    mode = ConcurrentMode | BlockingMode
  } else {
    mode = NoMode
  }

  return new FiberNode(HostRoot, null, null, mode)
}

/**
 * 创建一个fiber节点
 * @param tag
 * @param pendingProps
 * @param key
 * @param mode
 * @returns
 */
export const createFiber = (
  tag: WorkTag,
  pendingProps: unknown,
  key: string | null,
  mode: TypeOfMode
) => {
  return new FiberNode(tag, pendingProps, key, mode)
}

/**
 *
 * @param current 更具当前界面上的current fiber节点创建一个新的fiber节点去进行工作
 * @param pendingProps 该fiber节点新的props
 */
export const createWorkInProgress = (
  current: Fiber,
  pendingProps: any
): Fiber => {
  let workInProgress = current.alternate

  if (workInProgress === null) {
    //我们在这里使用了双缓存技巧，因为知道只需要两个版本的树
    //我们可以把当前树中没有用到的节点拿出来复用，并且这些节点是只有需要时才创建的
    //去避免去为那些永远不会更新的节点创建额外的对象,
    //如果需要的话这也让我们可以再利用内存
    /**
     * 考虑下面的App组件，帮你理解上面的话
     * const TriggerUpdate = () => {
     *   const [count, setCount] = useState(0)
     * 
     *   return (
     *     <div>
     *       {count}
     *       <button
     *         onClick={() => {
     *           setCount(count + 1)
     *         }}
     *       >
     *         increment
     *       </button>
     *     </div>
     *   )
     * }
     *
     * const App = () => {
     *  return (
     *    <div id="container">
     *      <div style={{
     *         background: 'red',
     *        }}
     *        id="static"
     *      >
     *        Static Node
     *        <div>Static Node</div>
     *      </div>
     *      <TriggerUpdate />
     *    </div>
     *  )
     *}
     * 下面会使用jquery选择器的方式指明我们说的时哪个fiber节点
     * 比如$('#container')就表示哪个id为container的div所对应的fiber
     * 虽然App中的TriggerUpdate会触发更新但是他冒泡的lanes
     * 并不会影响到并不在他冒泡路径上和他同级的
     * $('#static')节点所以他的lanes和childLanes一直都是NoLanes，
     * 因为也知道他的父级节点$('#container') div也没有更新，
     * 所以在创建$('#static') div节点时复用前一次的props，
     * 当接下来进行$('#static')的beginWork时，由于前后props没变且不包含lanes
     * 会执行他的bailoutOnAlreadyFinishedWork逻辑
     * 即使此次更新中$('#static')对应的jsx对象的style属性是全新的对象，
     * 在执行bailout逻辑中发现他的childLanes为NoLanes所以直接返回，不在复制他的child
     * 进行render工作了，所以$('#static')节点的子节点只有在首次mount时会被创建一次，
     * 对于这些静态节点，在整个过程中，两颗fiber树始终指向相同的对象
     */
    
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode
    )

    workInProgress.type = current.type
    workInProgress.stateNode = current.stateNode

    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
    workInProgress.pendingProps = pendingProps
    workInProgress.type = current.type
    workInProgress.flags = NoFlags
    workInProgress.subtreeFlags = NoFlags
    workInProgress.deletions = null
  }

  workInProgress.lanes = current.lanes
  workInProgress.updateQueue = current.updateQueue
  workInProgress.childLanes = current.childLanes
  workInProgress.flags = current.flags
  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState

  return workInProgress
}

/**
 * 根据JSX对象的type和props创建一个fiber节点
 * @param type 可以为string比如div,p可以为函数，比如函数组件
 * 可以为类比如类组件可以为Symbol比如React.Fragment
 * @param key
 * @param pendingProps
 * @param mode fiber树的模式比如Concurrent,Legacy
 * @param lanes
 * @returns
 */
export const createFiberFromTypeAndProps = (
  type: any,
  key: null | string,
  pendingProps: any,
  mode: TypeOfMode,
  lanes: Lanes
) => {
  let fiberTag: WorkTag = IndeterminateComponent

  if (typeof type === 'function') {
  } else if (typeof type === 'string') {
    fiberTag = HostComponent
  }

  const fiber = createFiber(fiberTag, pendingProps, key, mode)
  fiber.type = type
  fiber.lanes = lanes
  return fiber
}

export const createFiberFromElement = (
  element: ReactElement,
  mode: TypeOfMode,
  lanes: Lanes
): Fiber => {
  const type = element.type
  const key = element.key as any
  const pendingProps = element.props

  const fiber = createFiberFromTypeAndProps(
    type,
    key,
    pendingProps,
    mode,
    lanes
  )

  return fiber
}

/**
 * 创建一个HostText类型的Fiber节点
 * @param content 会作为pendingProps
 * @param mode
 * @returns
 */
export const createFiberFromText = (
  content: string,
  mode: TypeOfMode,
  lanes: Lanes
): Fiber => {
  const fiber = createFiber(HostText, content, null, mode)
  fiber.lanes = lanes
  return fiber
}
