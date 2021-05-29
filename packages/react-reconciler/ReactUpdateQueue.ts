/**
 * 当首次mount时HostRoot会用到，Class Component也会用到该类型的updateQueue
 * Function Component使用的时另外的逻辑
 */

import { Fiber } from './ReactInternalTypes'

export type SharedQueue = {
  /**
   * 存储着本次更新的update队列，是实际的updateQueue。
   * shared的意思是current节点与workInProgress节点共享一条更新队列。
   */
  pending: Update | null
}

export type UpdateQueue<State> = {
  /**
   * 前一次更新计算得出的状态，它是第一个被跳过的update之前的那些update计算得出的state。会以它为基础计算本次的state
   */
  baseState: State
  shared: SharedQueue
  /**
   * 前一次更新时updateQueue中第一个被跳过的update对象
   */
  firstBaseUpdate: Update | null
  /**
   *lastBaseUpdate相当于，前一次更新中，updateQueue中以第一个被跳过的update为起点一直到的最后一个update的形成的链表，截取最后一个而获得的update
   */
  lastBaseUpdate: Update | null
}

export const UpdateState = 0

export type Update = {
  /**
   * 更新所携带的状态。
   * 类组件中：有两种可能，对象（{}），和函数（(prevState, nextProps):newState => {}）
   *根组件中：是React.createElement创建的JSX对象，即ReactDOM.render的第一个参数
   */
  payload: any

  /**
   * update之间通过next形成一条链表，后创建的update插在链表前端，
   * 其中最后一个update（最先创建的）的next指向第一个update形成一个环
   * 所以updateQueue.shared.pending为最后创建的update
   */
  next: null | Update

  tag: 0 | 1 | 2 | 3
}

/**
 *初始化fiber节点的updateQueue
 *
 * @param fiber 要初始化updateQueue的fiber
 */
export const initializeUpdateQueue = <State>(fiber: Fiber): void => {
  const queue: UpdateQueue<State> = {
    baseState: fiber.memoizedState,
    shared: {
      pending: null,
    },
    lastBaseUpdate: null,
    firstBaseUpdate: null,
  }

  fiber.updateQueue = queue
}

/**
 *
 * @returns 创建一个全新的update
 */
export const createUpdate = (): Update => {
  const update: Update = {
    payload: null,
    next: null,
    tag: UpdateState,
  }
  return update
}

/**
 * 将一个update添加fiber节点上
 *
 * @param fiber 要添加update的fiber节点
 * @param update 该update会被添加到fiber节点的updateQueue上
 */
export const enqueueUpdate = (fiber: Fiber, update: Update): void => {
  const updateQueue = fiber.updateQueue
  if (!updateQueue) return

  const sharedQueue: SharedQueue = (updateQueue as any).shared

  const pending: Update | null = sharedQueue.pending

  if (pending === null) {
    //第一个创建的update，创建一个循环链表
    update.next = update
  } else {
    //sharedQueue.pending 始终为最后一个创建的update
    //sharedQueue.pending.next指向第一个创建的update,遍历update都是从此开始
    //按顺序1,2,3插入update则构成的链表为
    //______________
    //|             ↓
    //3  <-  2  <-  1

    //update3的next指向最早创建的update1
    update.next = pending.next

    //update2的next指向当前创建的update3
    pending.next = update
  }

  sharedQueue.pending = update
}

/**
 * 从current fiber上克隆一个updateQueue
 * @param current
 * @param workInProgress
 */
export const cloneUpdateQueue = <State>(
  current: Fiber,
  workInProgress: Fiber
): void => {
  const queue: UpdateQueue<State> = workInProgress.updateQueue as any

  const currentQueue: UpdateQueue<State> = current.updateQueue as any

  if (queue === currentQueue) {
    const clone: UpdateQueue<State> = {
      shared: currentQueue.shared,
      firstBaseUpdate: currentQueue.firstBaseUpdate,
      lastBaseUpdate: currentQueue.lastBaseUpdate,
      baseState: currentQueue.baseState,
    }

    workInProgress.updateQueue = clone
  }
}

export const processUpdateQueue = <State>(
  workInProgress: Fiber,
  props: any,
  instance: any
) => {
  const queue: UpdateQueue<State> = workInProgress.updateQueue as any

  
  let firstBaseUpdate = queue.firstBaseUpdate
  let lastBaseUpdate = queue.lastBaseUpdate
  
  //检测shared.pending是否存在进行中的update将他们转移到baseQueue
  let pendingQueue = queue.shared.pending
  if (pendingQueue !== null) {
    queue.shared.pending = null

    const lastPendingUpdate = pendingQueue
    const firstPendingUpdate = lastPendingUpdate.next
    //断开最后一个update和第一个update之间的连接
    lastPendingUpdate.next = null

    //将shared.pending上的update接到baseUpdate链表上
    if (lastBaseUpdate === null) {
      firstBaseUpdate = firstPendingUpdate
    } else {
      lastBaseUpdate.next = firstPendingUpdate
    }

    lastBaseUpdate = lastPendingUpdate

    //如果current存在则进行相同的工作
    const current = workInProgress.alternate
    if (current !== null) {
      const currentQueue: UpdateQueue<State> = current.updateQueue as any
      const currentLastBaseUpdate = currentQueue.lastBaseUpdate

      if (currentLastBaseUpdate !== lastBaseUpdate) {
        if (currentLastBaseUpdate === null) {
          currentQueue.firstBaseUpdate = firstPendingUpdate
        } else {
          currentLastBaseUpdate.next = firstPendingUpdate
        }
        currentQueue.lastBaseUpdate = lastPendingUpdate
      }
    }
  }

  if (firstBaseUpdate !== null) {
    let newState = queue.baseState

    let newBaseState = null
    let newFirstBaseUpdate = null
    let newLastBaseUpdate = null

    let update: Update | null = firstBaseUpdate

    do {
      //暂时假设，所有更新都是一样的优先级，每次都从所有update计算状态
      newState = getStateFromUpdate(
        workInProgress,
        queue,
        update!,
        newState,
        props,
        instance
      )
      update = update!.next

      //当前更新以全部遍历完，但是有可能payload为函数在计算state的过程中又在
      //updateQueue.shared.pending上添加了新的更新，继续迭代直到没有新更新产生为止
      if (update === null) {
        pendingQueue = queue.shared.pending
        //没产生新的更新
        if (pendingQueue === null) break
        else {
          //产生了新的更新
          const lastPendingUpdate = pendingQueue
          const firstPendingUpdate = lastPendingUpdate.next
          lastPendingUpdate.next = null

          update = firstPendingUpdate
          queue.lastBaseUpdate = lastPendingUpdate
          queue.shared.pending = null
        }
      }
    } while (true)

    //暂时没有会被跳过的update始终不成立
    if (newLastBaseUpdate === null) {
      newBaseState = newState
    }

    queue.baseState = newBaseState as any

    queue.firstBaseUpdate = newFirstBaseUpdate
    queue.lastBaseUpdate = newLastBaseUpdate

    workInProgress.memoizedState = newState
  }
}

export const getStateFromUpdate = <State>(
  _workInProgress: Fiber,
  _queue: UpdateQueue<State>,
  update: Update,
  prevState: State,
  nextProps: any,
  instance: any
): any => {
  switch (update.tag) {
    case UpdateState: {
      const payload = update.payload
      let partialState
      if (typeof payload === 'function') {
        partialState = payload.call(instance, prevState, nextProps)
      } else {
        partialState = payload
      }

      if (partialState === null || partialState === undefined) {
        //如果是null或者undefined就说明什么都不用更新，什么也不干
        return prevState
      }

      return Object.assign({}, prevState, partialState)
    }
  }
}
