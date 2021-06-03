import { Dispatcher, Fiber } from './ReactInternalTypes'
import { ReactSharedInternals } from '../shared/ReactSharedInternals'
import {
  isInterleavedUpdate,
  requestEventTime,
  requestUpdateLane,
  scheduleUpdateOnFiber,
} from './ReactFiberWorkLoop'
import {
  isSubsetOfLanes,
  Lane,
  Lanes,
  mergeLanes,
  NoLane,
  NoLanes,
  removeLanes,
} from './ReactFiberLane'
import { markWorkInProgressReceivedUpdate } from './ReactFiberBeginWork'
import {
  Flags as FiberFlags,
  Flags,
  Passive as PassiveEffect,
  Update as UpdateEffect,
} from './ReactFiberFlags'
import {
  HookFlags,
  Passive as HookPassive,
  HasEffect as HookHasEffect,
  Layout as HookLayout,
} from './ReactHookEffectTags'
import { pushInterleavedQueue } from './ReactFiberInterleavedUpdates'

const { ReactCurrentDispatcher } = ReactSharedInternals
type BasicStateAction<S> = ((a: S) => S) | S

type Dispatch<A> = (a: A) => void

export type Hook = {
  next: Hook | null
  memoizedState: any
  baseState: any
  queue: UpdateQueue<any, any> | null
  baseQueue: Update<any, any> | null
}

export type FunctionComponentUpdateQueue = {
  lastEffect: Effect | null
}

/**
 * Function组件中的所有Effect都会存在他fiber节点的updateQueue中
 */
export type Effect = {
  /**
   * 该Effect的标签，比如useEffect的就为HookPassive,
   * useLayoutEffect的就为HookLayout
   * commitHookEffectListUnmount
   * 函数用它来筛选不同类型的effect详细信息可以查看
   * react-reconciler\ReactFiberCommitWork.ts下的commitHookEffectListUnmount函数
   */
  tag: HookFlags
  /**
   * create函数，也就是useEffect,useLayoutEffect的第一个函数
   */
  create: () => (() => void) | void
  /**
   * destroy函数，有create函数的返回值决定，可以返回一个函数或者
   * 选择什么都不返回
   */
  destroy: (() => void) | void
  /**
   * 依赖数组，只有依赖数组里面的所有值都和前一轮严格相等
   * Function组件的fiber才不会被打上PassiveEffect,或者UpdateEffect
   * 标签，进而该Effect才不用去执行
   */
  deps: unknown[] | null
  /**
   * 下一个Effect
   */
  next: Effect
}

let workInProgressHook: Hook | null = null
let currentlyRenderingFiber: Fiber
let currentHook: Hook | null = null
let renderLanes: Lanes = NoLanes

/**
 * 所有Hook函数(useState, useEffect, useLayoutEffect)在Mount时都会调用的函数，用来创建一个Hook，并且把他
 * 和前面的Hook连接起来
 * @returns 返回当前创建的新Hook
 */
const mountWorkInProgressHook = (): Hook => {
  const hook: Hook = {
    next: null,
    memoizedState: null,
    baseState: null,
    queue: null,
    baseQueue: null,
  }

  if (workInProgressHook === null) {
    /**
     * 这是第一个被创建的Hook把他放到Function组件fiber的memoizedState中
     */
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook
  } else {
    /**
     * 不是第一个Hook，把他放到前面Hook的next中
     */
    workInProgressHook = workInProgressHook.next = hook
  }

  return workInProgressHook
}

type Update<S, A> = {
  action: A
  next: Update<S, A>
  lane: Lane
}

export type UpdateQueue<S, A> = {
  /**
   * 要进行的更新的队列，其中在同一轮事件循环内产生的更新
   * 都会被连接到在这个循环链表中，其中只有第一个产生的更新会被调度，
   * 其他的都只是直接被挂在在上面，等到render阶段时一起被render
   */
  pending: Update<S, A> | null
  lastRenderedReducer: ((s: S, a: A) => S) | null
  lastRenderedState: S | null
  dispatch: null | ((a: A) => any)
  interleaved: Update<S, A> | null
}

const dispatchAction = <S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A
) => {
  const alternate = fiber.alternate
  //获取此次更新的优先级
  const lane = requestUpdateLane(fiber)
  //此次更新触发的事件
  const eventTime = requestEventTime()

  const update: Update<S, A> = {
    action,
    next: null as any,
    lane,
  }
  if (
    fiber === currentlyRenderingFiber ||
    (alternate !== null && alternate === currentlyRenderingFiber)
  ) {
    /**
     * render阶段产生的更新(也就是在调用Function组件的过程中产生的更新)，暂未实现
     * 比如以下组件在调用时就会产生这样的更新,这样的更新如果一直产生react就会一直重复调用
     * 该组件，直到他不在产生这种更新为止，所以setCount如果不写在任何逻辑语句里会导致无限循环
     * function Foo() {
     *   const [count, setCount] = useState(0)
     *
     *   setCount(1)
     *
     *   return null
     * }
     * 注意在effect中的产生的更新不属于这种更新，等到effect的create函数执行时，render阶段早结束了
     */

    //todo
    throw new Error('Not Implement')
  } else {
    //在Concurrent Mode中，如果在一个时间切片后，有更新中途加入，会被加入到
    //interleaved queue中，等到下一次进行新一轮render阶段时
    //注意是新一轮render，不是下一个时间切片
    //会调用prepareFreshStack方法清除之前产生的副作用，在此方法中会将interleaved queue加入到
    //pending queue中，目前这两个分支的逻辑是等价的删除isInterleavedUpdate分支并不
    //影响代码运行
    if (isInterleavedUpdate(fiber, lane)) {
      const interleaved = queue.interleaved
      if (interleaved === null) {
        update.next = update
        pushInterleavedQueue(queue)
      } else {
        update.next = interleaved.next
      }
      queue.interleaved = update
    } else {
      const pending = queue.pending
      if (pending === null) {
        update.next = update
      } else {
        update.next = pending.next
        pending.next = update
      }
      queue.pending = update
    }

    if (
      fiber.lanes === NoLanes &&
      (alternate === null || alternate.lanes === NoLanes)
    ) {
      const lastRenderedReducer = queue.lastRenderedReducer

      if (lastRenderedReducer !== null) {
        try {
          const currentState: S = queue.lastRenderedState as any
          const eagerState = lastRenderedReducer(currentState, action)
          if (Object.is(eagerState, currentState)) {
            return
          }
        } catch (error) {
          // 捕获改异常，他待会还会再render阶段抛出
        }
      }
    }

    scheduleUpdateOnFiber(fiber, lane, eventTime)
  }
}

const basicStateReducer = <S>(state: S, action: BasicStateAction<S>): S => {
  return typeof action === 'function' ? (action as (s: S) => S)(state) : action
}

const mountState = <S>(
  initialState: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] => {
  const hook = mountWorkInProgressHook()

  if (typeof initialState === 'function') {
    initialState = (initialState as () => S)()
  }

  hook.memoizedState = hook.baseState = initialState

  const queue = (hook.queue = {
    pending: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState,
    dispatch: null,
    interleaved: null,
  })

  const dispatch: Dispatch<BasicStateAction<S>> = (queue.dispatch =
    dispatchAction.bind(null, currentlyRenderingFiber, queue) as any)

  return [hook.memoizedState, dispatch]
}

/**
 * 从current hook中复制获得workInProgressHook
 * 每复制一个就将current hook向前移动至下一个hook
 * @returns
 */
const updateWorkInProgressHook = (): Hook => {
  let nextCurrentHook: null | Hook

  if (currentHook === null) {
    //第一次调用该函数currentHook还为空，从current的memoizedState中
    //得到第一个hook
    const current = currentlyRenderingFiber.alternate
    if (current !== null) {
      nextCurrentHook = current.memoizedState
    } else {
      throw new Error('Not Implement')
    }
  } else {
    //不是第一个hook
    nextCurrentHook = currentHook.next
  }

  let nextWorkInProgressHook: Hook | null = null

  //下面的if else是未使用到的代码nextWorkInProgressHook会一直保持null
  //保留他的原因是为了能在触发special case的时候能获得报错时的调用栈
  //信息，不仅在这里，整个代码里的所有手动抛出的Not Implement错误都是因为
  //这个原因,这样使问题调试，和新功能的添加都变得非常容易
  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState
  } else {
    nextWorkInProgressHook = workInProgressHook.next
  }

  if (nextWorkInProgressHook !== null) {
    throw new Error('Not Implement')
  } else {
    currentHook = nextCurrentHook!
    const newHook: Hook = {
      memoizedState: currentHook.memoizedState,
      baseState: currentHook.baseState,
      queue: currentHook.queue,
      next: null,
      baseQueue: currentHook.baseQueue,
    }

    if (workInProgressHook === null) {
      currentlyRenderingFiber.memoizedState = workInProgressHook = newHook
    } else {
      workInProgressHook = workInProgressHook.next = newHook
    }
  }

  return workInProgressHook
}

const updateReducer = <S, I, A>(
  reducer: (s: S, a: A) => S,
  initialArg: I,
  init?: (i: I) => S
): [S, Dispatch<A>] => {
  const hook = updateWorkInProgressHook()
  const queue = hook.queue!

  queue.lastRenderedReducer = reducer
  const current: Hook = currentHook as any

  let baseQueue = current.baseQueue

  const pendingQueue = queue.pending

  if (pendingQueue !== null) {
    if (baseQueue !== null) {
      /** 假设此时的baseQueue为下面的链表,则baseFirst为1
       *  ————
       * |    |
       * |    ↓
       * 2 <- 1
       */
      const baseFirst = baseQueue.next

      /** 假设此时的pendingQueue为下面的链表,则pendingFirst为3
       *  ————
       * |    |
       * |    ↓
       * 4 <- 3
       */
      const pendingFirst = pendingQueue.next

      //2.next = 3
      baseQueue.next = pendingFirst
      //4.next = 1
      pendingQueue.next = baseFirst

      /** baseQueue结果
       *  ——————————————
       * |              |
       * |              ↓
       * 2 <- 1 <- 4 <- 3
       */
    }

    current.baseQueue = baseQueue = pendingQueue
    /** 此时的baseQueue结果
     *  ——————————————
     * |              |
     * |              ↓
     * 4 <- 3 <- 2 <- 1
     */
    queue.pending = null
  }

  if (baseQueue !== null) {
    const first = baseQueue.next
    let newState = current.baseState

    let newBaseState = null
    let newBaseQueueFirst: Update<S, A> | null = null
    let newBaseQueueLast: Update<S, A> | null = null

    let update = first

    do {
      const updateLane = update.lane

      if (!isSubsetOfLanes(renderLanes, updateLane)) {
        /**
         * 没有足够的优先级，跳过这个update,如果这个是第一个跳过的更新，那么
         * 为了保证打乱更新顺序后，状态更新的正确性
         * 会从第一个跳过的update开始把他们全部接在baseQueue上
         * 比如以下例子，在pendingQueue中有三个更新，且假设此时的state为0
         * {                  {                                {
         *   lane: 16, ---->      lane: 1,               ---->    lane: 16,
         *   action: 1            action: (v) => v + 2            action: (v) => v + 1
         * }                  }                                }
         *
         *  如果按照正常的逻辑 state的变化为 0 --`set(1)`--> 1 --`incr(2)`--> 3 --`incr(1)`--> 4
         *  所以state的最终值应该是4
         *  如果我们尝试把他们更具优先级分成两波更新，lane为1的先更新，lane为16的后更新
         *  那么state的变化应该是
         *     第一波更新 0 --`incr(2)`--> 2
         *     第二波更新 2 --`set(1)`--> 1 --`incr(1)`--> 2
         *  可以看到根据优先级分批更新倒是实现了，但是最终的状态和期待的对不上了
         *  但是如果我们在跳过某个更新时从他这里开始把他接到到baseQueue上，然后第二轮
         *  低优先级的更新开始更新时再从baseQueue开始就能保证分批更新时状态的正确性
         *  比如上面的pendingQueue在以renderLanes为1渲染时就会形成以下baseQueue
         * {                  {                                {
         *   lane: 16, ---->      lane: 1               ---->     lane: 16
         *   action: 1            action: (v) => v + 2            action: (v) => v + 1
         * }                  }                                }
         *
         * 此时baseState为第一个跳过update时的state也就是0
         * 所以第二轮以renderLanes为16渲染低优先级update时获得的state最终结果就会是正确的
         */
        const clone: Update<S, A> = {
          lane: updateLane,
          action: update.action,
          next: null as any,
        }

        if (newBaseQueueFirst === null) {
          newBaseQueueFirst = newBaseQueueLast = clone
          newBaseState = newState
        } else {
          newBaseQueueLast = newBaseQueueLast!.next = clone
        }

        /**
         * 在beginWork开始时currentlyRenderingFiber.lanes会被置为lanes
         *该更新被跳过，在fiber上留下他的Lane待会completeWork的时候会将它冒泡到HostRoot,
         * 以能在下一轮更新时重新被执行
         */
        currentlyRenderingFiber.lanes = mergeLanes(
          currentlyRenderingFiber.lanes,
          updateLane
        )
      } else {
        //改更新拥有足够的优先级
        if (newBaseQueueLast !== null) {
          /**
           * 前面已经有被跳过的更新，则将他也接到baseQueue上
           */
          const clone: Update<S, A> = {
            lane: NoLane,
            action: update.action,
            next: null as any,
          }

          newBaseQueueLast.next = clone
          newBaseQueueLast = clone
        }

        const action = update.action
        newState = reducer(newState, action)
      }

      update = update.next
    } while (update !== null && update !== first)

    if (newBaseQueueLast === null) {
      newBaseState = newState
    } else {
      newBaseQueueLast.next = newBaseQueueFirst!
    }

    if (!Object.is(newState, hook.memoizedState)) {
      /**
       * 非常重要的逻辑判断，他决定了是否能执行bailoutHooks逻辑
       * 如果执行了bailoutHooks逻辑就会将这个hook造成的副作用(flags,lanes)从fiber树
       * 清除，最终到commit阶段如果发现没有副作用，就什么都不用干
       */
      markWorkInProgressReceivedUpdate()
    }
    hook.memoizedState = newState
    hook.baseState = newBaseState
    hook.baseQueue = newBaseQueueLast

    queue.lastRenderedState = newState
  }

  const lastInterleaved = queue.interleaved

  if (lastInterleaved !== null) {
    throw new Error('Not Implement')
  }

  const dispatch: Dispatch<A> = queue.dispatch!
  return [hook.memoizedState, dispatch]
}

const updateState = <S>(
  initialState: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] => {
  return updateReducer(basicStateReducer, initialState)
}

export const renderWithHooks = <Props, SecondArg>(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: (p: Props, arg: SecondArg) => any,
  props: Props,
  secondArg: SecondArg,
  nextRenderLanes: Lanes
) => {
  renderLanes = nextRenderLanes
  currentlyRenderingFiber = workInProgress

  //Function组件每次update是都会将新的effect挂载在上面，如果
  //不清除那么老的effect会一直存在并被调用
  workInProgress.updateQueue = null
  workInProgress.memoizedState = null
  workInProgress.lanes = NoLanes

  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount
      : HooksDispatcherOnUpdate
  //调用函数组件，获取JSX对象
  let children = Component(props, secondArg)

  renderLanes = NoLanes
  currentlyRenderingFiber = null as any

  /**
   * 完成该Function组建后将currentHook,workInProgressHook置为null,否则会导致下次更新
   * 时的workInProgress的memoizedState为null导致后续的更新异常
   */
  currentHook = null
  workInProgressHook = null

  return children
}

const areHookInputsEqual = (
  nextDeps: unknown[],
  prevDeps: unknown[] | null
) => {
  if (prevDeps === null) {
    throw new Error('Not Implement')
  }

  for (let i = 0; i < prevDeps.length && i < nextDeps.length; ++i) {
    if (Object.is(nextDeps[i], prevDeps[i])) continue

    return false
  }

  return true
}

const updateEffectImpl = (
  fiberFlags: FiberFlags,
  hookFlags: HookFlags,
  create: () => (() => void) | void,
  deps: unknown[] | void | null
): void => {
  const hook = updateWorkInProgressHook()
  const nextDeps = deps === undefined ? null : deps

  let destroy = undefined

  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState
    destroy = prevEffect.destroy
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        /**
         * 判断该effect的依赖数组是否发生了变化，如果没有变化
         * 就直接用复制之前effect的参数然后返回
         */
        hook.memoizedState = pushEffect(hookFlags, create, destroy, nextDeps)
        return
      }
    }
  }

  //依赖数组发生变化，为fiber节点打上标记
  currentlyRenderingFiber.flags |= fiberFlags
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    destroy,
    nextDeps
  )
}

const updateEffect = (
  create: () => (() => void) | void,
  deps: unknown[] | void | null
): void => {
  return updateEffectImpl(PassiveEffect, HookPassive, create, deps)
}

/**
 * 将一个effect接到该fiber组件的updateQueue中
 * @param tag 该effect的类型，commitHookEffectListUnmount
 * 函数用它来筛选不同类型的effect详细信息可以查看
 * react-reconciler\ReactFiberCommitWork.ts下的commitHookEffectListUnmount函数
 * @param create useEffect的第一个参数
 * @param destroy 
 * @param deps useEffect的第二个参数
 * @returns
 */
const pushEffect = (
  tag: HookFlags,
  create: Effect['create'],
  destroy: Effect['destroy'],
  deps: Effect['deps']
) => {
  const effect: Effect = {
    tag,
    create,
    destroy,
    deps,
    next: null as any,
  }

  let componentUpdateQueue: null | FunctionComponentUpdateQueue =
    currentlyRenderingFiber.updateQueue as any

  if (componentUpdateQueue === null) {
    //如果函数组件的updateQueue为空，就先初始化他
    componentUpdateQueue = {
      lastEffect: null,
    }
    currentlyRenderingFiber.updateQueue = componentUpdateQueue
    componentUpdateQueue.lastEffect = effect.next = effect
  } else {
    const lastEffect = componentUpdateQueue.lastEffect
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect
    } else {
      const firstEffect = lastEffect.next
      lastEffect.next = effect
      effect.next = firstEffect
      componentUpdateQueue.lastEffect = effect
    }
  }

  return effect
}

const mountEffectImpl = (
  fiberFlags: FiberFlags,
  hookFlags: HookFlags,
  create: () => (() => void) | void,
  deps: unknown[] | void | null
): void => {
  const hook = mountWorkInProgressHook()
  const nextDeps = deps === undefined ? null : deps
  currentlyRenderingFiber.flags |= fiberFlags
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    undefined,
    nextDeps
  )
}

const mountEffect = (
  create: () => (() => void) | void,
  deps: unknown[] | void | null
) => {
  return mountEffectImpl(PassiveEffect, HookPassive, create, deps)
}

const mountLayoutEffect = (
  create: () => (() => void) | void,
  deps: unknown[] | void | null
) => {
  let fiberFlags: Flags = UpdateEffect
  return mountEffectImpl(fiberFlags, HookLayout, create, deps)
}

const updateLayoutEffect = (
  create: () => (() => void) | void,
  deps: unknown[] | void | null
) => {
  return updateEffectImpl(UpdateEffect, HookLayout, create, deps)
}

/**
 * Mount流程中使用的Dispatcher
 */
const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
  useEffect: mountEffect,
  useLayoutEffect: mountLayoutEffect,
}

/**
 * Update流程中使用的Dispatcher
 */
const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState,
  useEffect: updateEffect,
  useLayoutEffect: updateLayoutEffect,
}

/**
 * 用来清除一个fiber节点上的副作用标记，只有在一个
 * 节点出现在render流程中，并且lanes不为空，但该节点的确没有
 * 存在的工作，会调用该函数清除他的副作用，以结束更新流程
 * 考虑下面的代码
 * function Foo() {
 *   const [state, setState] = useState(0)
 *
 *   setTimeout(() => {
 *     setState(1)
 *   })
 *
 *   return state
 * }
 * 这样无限dispatchAction的代码最后能终止,就多亏了
 * 了这个函数,那么什么情况下会调用这个函数呢,只有该组件
 * 所有state都没有都没有变更，且他的父组件也没有什么更新的情况下
 * 才回调用这个函数，详细逻辑可以查看didReceiveUpdate这个变量的
 * 相关逻辑
 * @param current
 * @param workInProgress
 * @param lanes
 */
export const bailoutHooks = (
  current: Fiber,
  workInProgress: Fiber,
  lanes: Lanes
) => {
  workInProgress.updateQueue = current.updateQueue
  workInProgress.flags &= ~(PassiveEffect | UpdateEffect)

  current.lanes = removeLanes(current.lanes, lanes)
}
