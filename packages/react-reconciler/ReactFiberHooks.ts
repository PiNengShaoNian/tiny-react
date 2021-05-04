import { Dispatcher, Fiber } from './ReactInternalTypes'
import { ReactSharedInternals } from '../shared/ReactSharedInternals'
import {
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
} from './ReactFiberLane'

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

let workInProgressHook: Hook | null = null
let currentlyRenderingFiber: Fiber
let currentHook: Hook | null = null
let renderLanes: Lanes = NoLanes

const mountWorkInProgressHook = (): Hook => {
  const hook: Hook = {
    next: null,
    memoizedState: null,
    baseState: null,
    queue: null,
    baseQueue: null,
  }

  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook
  } else {
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
  pending: Update<S, A> | null
  lastRenderedReducer: ((s: S, a: A) => S) | null
  lastRenderedState: S | null
  dispatch: null | ((a: A) => any)
}

const dispatchAction = <S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A
) => {
  const alternate = fiber.alternate
  const lane = requestUpdateLane(fiber)
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
    //todo
    throw new Error('Not Implement')
  } else {
    const pending = queue.pending

    if (pending === null) {
      update.next = update
    } else {
      update.next = pending.next
      pending.next = update
    }

    queue.pending = update

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
  })

  const dispatch: Dispatch<
    BasicStateAction<S>
  > = (queue.dispatch = dispatchAction.bind(
    null,
    currentlyRenderingFiber,
    queue
  ) as any)

  return [hook.memoizedState, dispatch]
}

const updateWorkInProgressHook = (): Hook => {
  /**
   * 这个函数同时处理了普通的updates和render阶段updates两种情况，
   * 所以我们可以假设，已经存在一个hook可clone,或者一个可以当作基础hook的，前一轮work-in-progress中的hook
   * 当我们到达list的结尾时，必须把dispatcher切换至处理mount的
   */
  let nextCurrentHook: null | Hook

  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate
    if (current !== null) {
      nextCurrentHook = current.memoizedState
    } else {
      nextCurrentHook = null
    }
  } else {
    nextCurrentHook = currentHook.next
  }

  let nextWorkInProgressHook: Hook | null

  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState
  } else {
    nextWorkInProgressHook = workInProgressHook.next
  }

  if (nextWorkInProgressHook !== null) {
    workInProgressHook = nextWorkInProgressHook
    nextWorkInProgressHook = workInProgressHook.next
    currentHook = nextCurrentHook
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
      /**
       *  ————
       * |    |
       * |    ↓
       * 2 <- 1
       */
      const baseFirst = baseQueue.next

      /**
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
    /** baseQueue结果
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
         * 之前的 update和state就是新的baseUpdate和baseState
         */

        throw new Error('Not Implement')

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

        currentlyRenderingFiber.lanes = mergeLanes(
          currentlyRenderingFiber.lanes,
          updateLane
        )
      } else {
        //改更新拥有足够的优先级
        if (newBaseQueueLast !== null) {
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

    hook.memoizedState = newState
    hook.baseState = newBaseState
    hook.baseQueue = newBaseQueueLast

    queue.lastRenderedState = newState
  }

  const dispatch: Dispatch<A> = queue.dispatch!
  return [hook.memoizedState, dispatch]
}

const updateState = <S>(
  initialState: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] => {
  return updateReducer(basicStateReducer, initialState)
}

const HooksDispatcherOnMount: Dispatcher = {
  useState: mountState,
}

const HooksDispatcherOnUpdate: Dispatcher = {
  useState: updateState,
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
  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount
      : HooksDispatcherOnUpdate
  //调用函数组件，获取JSX对象
  let children = Component(props, secondArg)

  renderLanes = NoLanes
  currentlyRenderingFiber = null as any

  return children
}
