import {
  getCurrentEventPriority,
  scheduleMicrotask,
} from './ReactFiberHostConfig'
import {
  DefaultEventPriority,
  DiscreteEventPriority,
  getCurrentUpdatePriority,
  lanesToEventPriority,
  setCurrentUpdatePriority,
} from './ReactEventPriorities'
import { createWorkInProgress } from './ReactFiber'
import { beginWork } from './ReactFiberBeginWork'
import {
  commitBeforeMutationEffects,
  commitLayoutEffects,
  commitMutationEffects,
  commitPassiveMountEffects,
  commitPassiveUnmountEffects,
} from './ReactFiberCommitWork'
import { completeWork } from './ReactFiberCompleteWork'
import { MutationMask, NoFlags, PassiveMask } from './ReactFiberFlags'
import {
  getHighestPriorityLane,
  getNextLanes,
  includesSomeLane,
  Lane,
  Lanes,
  markRootFinished,
  markRootUpdated,
  markStarvedLanesAsExpired,
  mergeLanes,
  NoLane,
  NoLanes,
  NoTimestamp,
  shouldTimeSlice,
  SyncLane,
} from './ReactFiberLane'
import {
  flushSyncCallbacks,
  scheduleLegacySyncCallback,
  scheduleSyncCallback,
} from './ReactFiberSyncTaskQueue'
import { Fiber, FiberRoot } from './ReactInternalTypes'
import { LegacyRoot } from './ReactRootTags'
import { ConcurrentMode, NoMode } from './ReactTypeOfMode'
import { HostRoot } from './ReactWorkTags'
import { cancelCallback, now, shouldYield } from './Scheduler'
import {
  scheduleCallback,
  NormalPriority as NormalSchedulerPriority,
} from './Scheduler'
import { enqueueInterleavedUpdates } from './ReactFiberInterleavedUpdates'

type ExecutionContext = number
export const NoContext = /*             */ 0b000000
const BatchedContext = /*               */ 0b000001
const EventContext = /*                 */ 0b000010
const LegacyUnbatchedContext = /*       */ 0b000100
const RenderContext = /*                */ 0b001000
const CommitContext = /*                */ 0b010000

type RootExitStatus = 5 | 0
const RootIncomplete = 0
const RootCompleted = 5

let executionContext: ExecutionContext = NoContext

/**
 * 当前在构建应用的root
 */
let workInProgressRoot: FiberRoot | null = null

/**
 * 当前正在进行工作的fiber节点
 */
let workInProgress: Fiber | null = null

/**
 * 当前渲染中的Lanes
 */
let workInProgressRootRenderLanes: Lanes = NoLanes

let currentEventTime: number = NoTimestamp

let rootDoesHavePassiveEffects: boolean = false
/**
 * 当前包含PassiveEffect(useEffect产生的effect)的FiberRoot
 */
let rootWithPendingPassiveEffects: FiberRoot | null = null

export let subtreeRenderLanes: Lanes = NoLanes

const completeUnitOfWork = (unitOfWork: Fiber): void => {
  let completedWork: Fiber | null = unitOfWork

  do {
    const current = completedWork.alternate

    const returnFiber: Fiber | null = completedWork.return

    let next = completeWork(current, completedWork)

    // if (next !== null) {
    //   //// Something suspended. Re-render with the fallback children.
    //   workInProgress = next
    //   return
    // }

    const siblingFiber = completedWork.sibling

    //由于是深度优先遍历，当一个节点的"归阶段"完成后立马进入其下一个兄弟节点的递阶段
    if (siblingFiber !== null) {
      workInProgress = siblingFiber
      return
    }

    //returnFiber的所有子节点都完成递和归阶段，接下来到returnFiber的归阶段了
    completedWork = returnFiber
    workInProgress = completedWork
  } while (completedWork !== null)
}

/**
 * 以fiber节点为工作单位开始他们的begin阶段和complete阶段
 * @param unitOfWork 当前要进行工作的fiber节点
 */
const performUnitOfWork = (unitOfWork: Fiber): void => {
  const current = unitOfWork.alternate

  let next: Fiber | null = null

  //创建或者reconcile(也就是diff)unitOfWork的子节点(注意是子节点,是和unitOfWork仅有一层之隔的节点，不是孙子节点，更不是重孙节点)
  //根据current fiber树和新创建的JSX对象的区别，
  //为对应的fiber节点打上相应的标记比如Update,Placement,ChildDeletion等
  //然后将第一个子节点返回也就是unitOfWork.child
  //因为同级节点直接使用sibling链接所以只用返回第一个就行
  next = beginWork(current, unitOfWork, subtreeRenderLanes)

  unitOfWork.memoizedProps = unitOfWork.pendingProps
  //进行的是深度优先遍历，next为null说明该节点没有子节点了，对其进行归过程
  if (next === null) {
    completeUnitOfWork(unitOfWork)
  } else {
    //将workInProgress赋值为unitOfWork的第一个子节点
    workInProgress = next
  }
}

/**
 * 为新一轮的更新初始化新的参数,当从头开始渲染一次更新或者之前的任务被打断，需要重置参数
 * 时都会调用该函数
 * @param root 新一轮更新的FiberRoot
 */
const prepareFreshStack = (root: FiberRoot, lanes: Lanes) => {
  root.finishedWork = null

  workInProgressRoot = root
  //创建workInProgress的HostRoot其props为null
  workInProgress = createWorkInProgress(root.current, null)
  workInProgressRootRenderLanes = subtreeRenderLanes = lanes
  enqueueInterleavedUpdates()
}

/**
 * 同步执行PassiveEffects的destory和create函数
 * @returns
 */
const flushPassiveEffectsImpl = () => {
  if (rootWithPendingPassiveEffects === null) return false

  const root = rootWithPendingPassiveEffects
  rootWithPendingPassiveEffects = null

  const prevExecutionContext = executionContext
  executionContext |= CommitContext
  commitPassiveUnmountEffects(root.current)
  commitPassiveMountEffects(root, root.current)

  executionContext = prevExecutionContext

  flushSyncCallbacks()

  return true
}

/**
 * 如果存在PassiveEffects的话，就把他同步执行了
 * @returns 返回是否执行了PassiveEffects，如果本来就不存在PassiveEffects那就返回false
 */
export const flushPassiveEffects = (): boolean => {
  if (rootWithPendingPassiveEffects !== null) {
    try {
      return flushPassiveEffectsImpl()
    } finally {
    }
  }

  return false
}

const renderRootSync = (root: FiberRoot, lanes: Lanes) => {
  //如果根节点改变调用prepareFreshStack重置参数

  const prevExecutionContext = executionContext
  executionContext |= RenderContext

  if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) {
    prepareFreshStack(root, lanes)
  }

  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }

  executionContext = prevExecutionContext

  /**
   * 把它设置为null表示当前没有进行中的render
   */
  workInProgressRoot = null
  workInProgressRootRenderLanes = NoLanes
}

const commitRootImpl = (root: FiberRoot): null => {
  do {
    flushPassiveEffects()
  } while (rootWithPendingPassiveEffects !== null)

  console.log('commitRoot')
  const finishedWork = root.finishedWork

  if (finishedWork === null) return null

  root.finishedWork = null

  /**
   * CommitRoot不会返回连续的操作,他总是同步的完成,所以我们可以清除他们
   * 以允许新的callback能被规划
   */
  root.callbackNode = null
  root.callbackPriority = NoLane

  /**
   * 剩余需要工作的lanes为HostRoot的lanes和他子树lanes的并集,finishedWork为HostRoot一般不会拥有剩余lanes
   * 但是他的childLanes有剩余还是挺常见的，比如一个子树高优先级任务打断了一个低优先级的任务
   * 那个低优先级任务的lanes就会保存到现在，就可以从HostRoot的childLanes获取到
   * 具体可以看completeWork中的bubbleProperties，他将子树中跳过更新的lanes冒泡到上级节点
   * 的childLanes中
   */
  let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes)
  //进行lanes的收尾工作
  markRootFinished(root, remainingLanes)

  workInProgressRoot = null
  workInProgress = null

  //如果存在PassiveEffects就是用Scheduler模块调度一下flushPassiveEffects
  if (
    (finishedWork.subtreeFlags & PassiveMask) !== NoFlags ||
    (finishedWork.flags & PassiveMask) !== NoFlags
  ) {
    if (!rootDoesHavePassiveEffects) {
      rootDoesHavePassiveEffects = true
      scheduleCallback(
        NormalSchedulerPriority,
        () => {
          flushPassiveEffects()
          return null
        },
        null
      )
    }
  }

  /**
   * 判断是否需要进行工作，大概率是需要进行dom操作，不过也不一定
   * 比如使用了useLayoutEffect的函数组件会被打上Update的标签
   * 但他不一定会进行dom操作
   */
  const subtreeHasEffects =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags

  //如果需要root或者他的子树进行操作
  if (rootHasEffect || subtreeHasEffects) {
    //BeforeMutation阶段，Class组件会在其中执行getSnapshotBeforeUpdate
    //我们只实现了Function Commponent,以我们的实现无关,可以忽略
    commitBeforeMutationEffects(root, finishedWork)

    //Mutation阶段，需要进行操作的HostComponent组件，会在这个阶段进行dom操作
    commitMutationEffects(root, finishedWork)

    //此时的workInProgress树被赋值为current Fiber树
    root.current = finishedWork

    //LayoutEffects阶段，在其中执行useLayoutEffect的create函数
    //这就是他和useEffect最大的区别，useLayoutEffect执行的时间是在dom操作完成后
    //此时下一帧还没有开始渲染，此时如果做一些动画就非常适合，而如果把执行动画的
    //操作放到useEffect中，因为他是被Scheduler模块调度，被postMessage注册到宏任务里面的
    //等到他执行时下一帧已经渲染出来，dom操作后的效果已经体现在了页面上了，
    //如果此时动画的起点还是前一帧的话页面就会出现闪烁的情况
    //详细信息可以查看examples下的LayoutEffect例子，试试分别使用
    //useLayoutEffect和useEffect分别是什么效果
    commitLayoutEffects(finishedWork, root)
  } else {
    root.current = finishedWork
  }

  const rootDidHavePassiveEffects = rootDoesHavePassiveEffects

  //PassiveEffect已经被调度，将这些变量设为有值
  //表示存在PassiveEffect
  if (rootDidHavePassiveEffects) {
    rootDoesHavePassiveEffects = false
    rootWithPendingPassiveEffects = root
  }

  //root上可能还有剩余的工作，在调度一次
  ensureRootIsScheduled(root, now())

  return null
}

const commitRoot = (root: FiberRoot): null => {
  commitRootImpl(root)
  return null
}

/**
 * 这个是不通过Scheduler调度的同步任务的入口
 * @param root
 */
export const performSyncWorkOnRoot = (root: FiberRoot) => {
  const lanes = getNextLanes(root, NoLanes)

  if (!includesSomeLane(lanes, SyncLane)) return null

  const exitStatus = renderRootSync(root, lanes)

  const finishedWork: Fiber | null = root.current.alternate

  root.finishedWork = finishedWork

  commitRoot(root)

  return null
}

/**
 * 用这个函数去调度一个任务，对于一个Root同时只能存在一个task,如果在调度一个任务时
 * 发现已经存在了一个任务我们会检查他的优先级，确保他的优先级是小于等于当前调度的任务的
 * @param root FiberRoot
 * @param currentTime 当前任务创建时的时间
 * @returns
 */
const ensureRootIsScheduled = (root: FiberRoot, currentTime: number) => {
  //是否已有任务节点存在，该节点为上次调度时Scheduler返回的任务节点,如果没有则为null
  const existingCallbackNode = root.callbackNode

  /**
   * 检查是否某些lane上的任务已经过期了如果过期了把他们标记为过期，
   * 然后接下来就能进行他们的工作
   */
  markStarvedLanesAsExpired(root, currentTime)

  //获得该次任务的优先级
  const nextLanes = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes
  )

  if (nextLanes === NoLanes) {
    if (existingCallbackNode !== null) {
      throw new Error('Not Implement')
    }
    root.callbackNode = null
    root.callbackPriority = NoLane
    return
  }

  /**
   * 我们取最高的lane去代表该callback的优先级
   */
  const newCallbackPriority = getHighestPriorityLane(nextLanes)

  const existingCallbackPriority = root.callbackPriority
  /**
   * 检查是是否已经存在任务，如果存在且优先级相同就可以复用他
   * 这就是一个click事件内的多次setState
   * 导致多次scheduleUpdateOnFiber但也只会渲染一次的原因
   * 同一优先级的update只会被调度一次，后续的update会直接返回
   * 只需要把他们挂在pending queue上的就行，待会beginWork阶段中拥有相同优先级的
   * update会被一同reduce了
   */
  if (existingCallbackPriority === newCallbackPriority) {
    return
  }

  //能走到着说明该次更新的的优先级一定大于现存任务的优先级
  //如果有现存任务就可以直接取消他，让他待会在被重新调度执行
  if (existingCallbackNode !== null) {
    //取消现存的callback,然后调度一个新的
    cancelCallback(existingCallbackNode as any)
  }

  //调度一个新回调
  let newCallbackNode
  if (newCallbackPriority === SyncLane) {
    //将同步任务全都放到一个队列中，然后注册一个微任务待会把他们全部一同执行了
    if (root.tag === LegacyRoot) {
      scheduleLegacySyncCallback(performSyncWorkOnRoot.bind(null, root))
    } else {
      scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root))
    }

    //注册一个微任务
    scheduleMicrotask(flushSyncCallbacks)
    //同步任务不经过Scheduler模块，所以callbackNode一直都不存在东西
    //但是callbackPriority会被设置为SyncLane
    newCallbackNode = null
  } else {
    //不是同步任务，通过scheduler模块调度他
    let schedulerPriorityLevel
    //将lanes的优先级转换为Scheduler模块内使用的优先级
    //以方便调用
    switch (lanesToEventPriority(nextLanes)) {
      case DefaultEventPriority:
        schedulerPriorityLevel = NormalSchedulerPriority
        break
      default:
        throw new Error('Not implement')
    }

    //调度performConcurrentWorkOnRoot
    newCallbackNode = scheduleCallback(
      schedulerPriorityLevel,
      performConcurrentWorkOnRoot.bind(null, root),
      null
    )
  }

  root.callbackNode = newCallbackNode
  root.callbackPriority = newCallbackPriority
}

const performConcurrentWorkOnRoot = (
  root: FiberRoot,
  didTimeout: boolean
): null | Function => {
  //react又要开始新的工作了,在此次工作完成后重新把控制权交给浏览器又算一个全新的开始，
  //可以把当前的eventTime清除了，下一次更新的时候会计算一个新的
  currentEventTime = NoTimestamp

  const originalCallbackNode = root.callbackNode
  //要开始下一轮render了，如果上一轮留下的PassiveEffects还在没有被执行
  //冲冲冲，不等他了，直接在这里同步执行了
  //什么时候会有PassiveEffect呢?在某些组件中使用useEffect,且经过了commit阶段
  //Scheduler模块调度了flushPassiveEffects后，会将rootDoesHavePassiveEffects
  //设置为true，表示该root含有PassiveEffect,等到flushPassiveEffects执行后，rootDoesHavePassiveEffects又会被
  //设置为flase,表示不存在PassiveEffect
  const didFlushPassiveEffects = flushPassiveEffects()

  if (didFlushPassiveEffects) {
    throw new Error('Not Implement')
  }

  const lanes = getNextLanes(
    root,
    root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes
  )

  if (lanes === NoLanes) {
    return null
  }

  const exitStatus =
    shouldTimeSlice(root, lanes) && !didTimeout
      ? renderRootConcurrent(root, lanes)
      : renderRootSync(root, lanes)

  /**
   * 在时间切片的过程中，如果还有任务剩余，就会返回RootIncomplete
   */
  if (exitStatus !== RootIncomplete) {
    const finishedWork: Fiber = root.current.alternate as any
    root.finishedWork = finishedWork
    finishConcurrentRender(root, 5, lanes)
  }

  ensureRootIsScheduled(root, now())
  if (root.callbackNode === originalCallbackNode) {
    //这个被规划的task node和当前执行的一样，需要返回一个continuation
    return performConcurrentWorkOnRoot.bind(null, root)
  }
  return null
}

/**
 * 工作完成，根据返回的退出码执行对应的操作
 * @param root FiberRoot
 * @param exitStatus 退出码如果一切正常会返回RootCompleted
 * @param lanes
 */
const finishConcurrentRender = (
  root: FiberRoot,
  exitStatus: RootExitStatus,
  lanes: Lanes
): void => {
  switch (exitStatus) {
    case RootCompleted:
      commitRoot(root)
      break
    default:
      throw new Error('Not Implement')
  }
}

/**
 * 在这个切片中一fiber为最小工作单位进行render工作，
 * 这个切片到期就把控制权交还给浏览器
 */
const workLoopConcurrent = () => {
  //和Sync模式的区别就是，是否加了shouldYield，能在一定
  //时机暂停render过程
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress)
  }
}

/**
 * 开始时间切片下的render过程，如果必须要把控制权交给浏览器了
 * 那么render过程就会在workInProgress这暂停
 * 如果workInProgress不为空，那么就返回状态码RootIncomplete
 * 方便让Scheduler模块在调度一次 performConcurrentWorkOnRoot
 * 待会让他回来在接着进行render工作，如果workInProgress为空表示
 * 表示render工作已经全部完成了，可以返回RootCompleted退出码
 * 然后直接进入commit阶段
 * @param root FiberRoot
 * @param lanes 当前被占用的lanes
 * @returns 退出码可以为RootIncomplete,RootCompleted等
 */
const renderRootConcurrent = (root: FiberRoot, lanes: Lanes) => {
  const prevExecutionContext = executionContext
  executionContext |= RenderContext

  //如果root或者lanes变了，我们就抛弃现有的stack然后创建一个新的
  //否则就从继续从我们离开的地方开始
  if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) {
    prepareFreshStack(root, lanes)
  }

  do {
    workLoopConcurrent()
    break
  } while (true)

  executionContext = prevExecutionContext

  if (workInProgress !== null) {
    //还有剩余的工作
    return RootIncomplete
  } else {
    workInProgressRoot = null
    workInProgressRootRenderLanes = NoLanes

    return RootCompleted
  }
}

/**
 * 将该节点上的更新的优先级冒泡到HostRoot
在冒泡的过程中不断更新路径上fiber节点的lanes和childLanes
 * @param sourceFiber 产生更新的节点 
 * @param lane 该更新的优先级
 * @returns 
 */
const markUpdateLaneFromFiberToRoot = (
  sourceFiber: Fiber,
  lane: Lane
): FiberRoot | null => {
  sourceFiber.lanes = mergeLanes(sourceFiber.lanes, lane)
  let alternate = sourceFiber.alternate

  if (alternate !== null) {
    alternate.lanes = mergeLanes(alternate.lanes, lane)
  }

  let node = sourceFiber
  let parent = sourceFiber.return

  while (parent !== null) {
    parent.childLanes = mergeLanes(parent.childLanes, lane)
    alternate = parent.alternate

    if (alternate !== null) {
      alternate.childLanes = mergeLanes(alternate.childLanes, lane)
    }

    node = parent
    parent = node.return
  }

  if (node.tag === HostRoot) {
    const root: FiberRoot = node.stateNode
    return root
  } else {
    return null
  }
}

/**
 * 获得该次事件的开始时间
 * @returns 该次事件的开始时间
 */
export const requestEventTime = () => {
  if ((executionContext & (RenderContext | CommitContext)) !== NoContext) {
    //我们正处于React的工作流程中
    //可以返回一个真实的时间,我们的实现没有用到该分支
    throw new Error('Not Implement')
  }

  //我们处于一个浏览器事件中，所有在同一个事件的handler中请求的开始时间
  //都应该是相同的,比如在onClick的handler多次setState就会调用dispatchAction
  //多次请求时间
  if (currentEventTime !== NoTimestamp) {
    return currentEventTime
  }

  //这是react将控制权交还给浏览器后，产生的第一次更新
  //计算一个新的开始时间
  currentEventTime = now()
  return currentEventTime
}

/**
 * 调度fiber节点上的更新
 *
 * @param fiber 当前产生更新的fiber节点
 * @returns 产生更新fiber树的FiberRoot(注意不是rootFiber)
 */
export const scheduleUpdateOnFiber = (
  fiber: Fiber,
  lane: Lane,
  eventTime: number
): FiberRoot | null => {
  //将该节点上的更新的优先级冒泡到HostRoot
  //在冒泡的过程中不断更新路径上fiber节点的lanes和childLanes
  const root = markUpdateLaneFromFiberToRoot(fiber, lane)

  if (root === null) {
    return null
  }

  markRootUpdated(root, lane, eventTime)

  if (root === workInProgressRoot) {
    throw new Error('Not Implement')
  }

  if (lane === SyncLane) {
    if (
      //检查是是否该调用是否处于unbatchedUpdates中，调用ReactDOM.render是会打上该标记
      (executionContext & LegacyUnbatchedContext) !== NoContext &&
      //检查是否以及处于渲染中
      (executionContext & (RenderContext | CommitContext)) === NoContext
    ) {
      // 这个是一个遗留模式的情况，
      //首次调用ReactDOM.render时处于batchedUpdates中的逻辑因该是同步执行的
      //但是layout updates应该推迟到改batch的结尾
      performSyncWorkOnRoot(root)
    } else {
      ensureRootIsScheduled(root, eventTime)

      if (
        executionContext === NoContext &&
        (fiber.mode & ConcurrentMode) === NoMode
      ) {
        throw new Error('Not Implement')
      }
    }
  } else {
    ensureRootIsScheduled(root, eventTime)
  }

  return root
}

/**
 * ReactDOM中点击事件的外层包装函数在这个函数内被调用的函数
 * 在调用requestUpdateLane获取优先级是，会得到DiscreteEventPriority优先级
 * @param fn 要被包装的函数
 * @param a
 * @param b
 * @param c
 * @param d
 * @returns
 */
export const discreteUpdates = <A, B, C, D, R>(
  fn: (a: A, b: B, c: C, d: D) => R,
  a: A,
  b: B,
  c: C,
  d: D
): R => {
  const previousPriority = getCurrentUpdatePriority()

  try {
    setCurrentUpdatePriority(DiscreteEventPriority)
    return fn(a, b, c, d)
  } finally {
    setCurrentUpdatePriority(previousPriority)
  }
}

/**
 * 将要执行的函数放入BatchedContext上下文下，此后在函数内创建的所有的更新指挥出发一次reconcil
 * @param fn 要执行的函数
 * @param a
 * @returns
 */
export const batchedEventUpdates = <A, R>(fn: (a: A) => R, a: A): R => {
  const prevExecutionContext = executionContext
  executionContext |= EventContext
  try {
    return fn(a)
  } finally {
    executionContext = prevExecutionContext
  }
}

/**
 * 给执行上下文加上LegacyUnbatchedContext,等到scheduleUpdateOnFilber执行时
 * 就会跳转到performSyncWorkOnRoot逻辑，目前只有ReactDOM.render方法中用到了
 * 该函数
 * @param fn 要在该上下文中执行的操作要执行的操作
 * @param a
 * @returns
 */
export const unbatchedUpdates = <A, R>(fn: (a: A) => R, a: A): R => {
  const prevExecutionContext = executionContext
  executionContext &= ~BatchedContext
  executionContext |= LegacyUnbatchedContext

  try {
    return fn(a)
  } finally {
    executionContext = prevExecutionContext
  }
}

/**
 * 更具fiber所处的mode获得该次更新的优先级
 * @param fiber
 * @returns 返回该次更新的优先级
 */
export const requestUpdateLane = (fiber: Fiber): Lane => {
  const mode = fiber.mode

  //如果不处于ConcurrentMode，不管三七二十一直接返回SyncLane
  if ((mode & ConcurrentMode) === NoMode) return SyncLane
  else if ((executionContext & RenderContext) !== NoContext) {
    throw new Error('Not Implement')
  }

  /**
   * 不同模块产生的优先级能互动的桥梁比如ReactDom中产生的一个click事件就会先将
   * CurrentUpdatePriority设置为DiscreteEventPriority然后像reconciler这种模块就能在这里获取到
   * 当前的UpdatePriority
   */
  const updateLane: Lane = getCurrentUpdatePriority()

  if (updateLane !== NoLane) {
    return updateLane
  }

  //大部分事件产生的更新，可以通过getCurrentEventPriority单独获取优先级，比如click
  //就会获取到DiscreteEventPriority
  const eventLane: Lane = getCurrentEventPriority()

  return eventLane
}

export const isInterleavedUpdate = (fiber: Fiber, lane: Lane): boolean => {
  return workInProgressRoot !== null && (fiber.mode & ConcurrentMode) !== NoMode
}
