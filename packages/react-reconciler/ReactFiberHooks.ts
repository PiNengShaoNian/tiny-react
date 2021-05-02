import { Dispatcher, Fiber } from './ReactInternalTypes'
import { ReactSharedInternals } from '../shared/ReactSharedInternals'
import {
  requestEventTime,
  requestUpdateLane,
  scheduleUpdateOnFiber,
} from './ReactFiberWorkLoop'
import { Lanes, NoLanes } from './ReactFiberLane'

const { ReactCurrentDispatcher } = ReactSharedInternals
type BasicStateAction<S> = ((a: S) => S) | S

type Dispatch<A> = (a: A) => void

export type Hook = {
  next: Hook | null
  memoizedState: any
  baseState: any
  queue: UpdateQueue<any, any> | null
}

let workInProgressHook: Hook | null = null
let currentlyRenderingFiber: Fiber
let currentHook: Hook | null = null

const mountWorkInProgressHook = (): Hook => {
  const hook: Hook = {
    next: null,
    memoizedState: null,
    baseState: null,
    queue: null,
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
}

export type UpdateQueue<S, A> = {
  pending: Update<S, A> | null
  lastRenderedReducer: ((s: S, a: A) => S) | null
  lastRenderedState: S | null
}

const dispatchAction = <S, A>(
  fiber: Fiber,
  queue: UpdateQueue<S, A>,
  action: A
) => {
  const update: Update<S, A> = {
    action,
    next: null as any,
  }

  const alternate = fiber.alternate
  const lane = requestUpdateLane(fiber)
  const eventTime = requestEventTime()

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
  })

  const dispatch: Dispatch<BasicStateAction<S>> = dispatchAction.bind(
    null,
    currentlyRenderingFiber,
    queue
  )

  return [hook.memoizedState, dispatch]
}

const updateWorkInProgressHook = (): Hook => {
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
) => {
  const hook = updateWorkInProgressHook
}

const updateState = <S>(
  initialState: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] => {
  return updateReducer()
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
  currentlyRenderingFiber = workInProgress
  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount
      : null
  //调用函数组件，获取JSX对象
  let children = Component(props, secondArg)

  currentlyRenderingFiber = null as any

  return children
}
