import { NormalPriority, PriorityLevel } from './SchedulerPriorities'
import { push, Node, peek, pop } from './SchedulerMinHeap'

type Task = {
  id: number
  /**
   * 该任务的要执行的操作，最常见的就是performConcurrentWorkOnRoot
   * 时间分片就靠此实现
   */
  callback: Function | null
  /**
   * 该任务的优先级
   */
  priorityLevel: PriorityLevel
  /**
   * 该任务的开始时间
   */
  startTime: number
  /**
   * 该任务的过期时间
   */
  expirationTime: number
  /**
   * 最小优先队列中会按照该字段将一个节点放到队列合适的位置和expirationTime是同一个值
   */
  sortIndex: number
}

const getCurrentTime = () => performance.now()
/**
 * NORMAL级别任务过期时间的计算标准，比如现在时间为0，
 * 有一个Normal级别的任务被调度了，那么他的过期时间就为
 * `当前时间 +NORMAL_PRIORITY_TIMEOUT`
 * 等于5000
 */
const NORMAL_PRIORITY_TIMEOUT = 5000
let taskIdCounter = 1
/**
 * 延时任务队列，我们的代码中没有用到
 */
const timerQueue: Node[] = []
/**
 * 存放任务的最小有限队列
 */
const taskQueue: Node[] = []
let isHostCallbackScheduled = false
let isHostTimeoutScheduled = false

let currentPriorityLevel = NormalPriority
let currentTask: null | Task = null

let scheduledHostCallback: null | Function = null

//当在执行工作的时候设置为true，防止二次进入
let isPerformingWork = false

let isMessageLoopRunning = false

let dealine = 0
let yieldInterval = 5

let needsPaint = false

let taskTimeoutID = -1

const performWorkUntilDeadline = () => {
  if (scheduledHostCallback !== null) {
    const currentTime = getCurrentTime()
    dealine = currentTime + yieldInterval
    const hasTimeRemaining = true

    let hasMoreWork = true

    try {
      /**
       * 在我们的代码中scheduledHostCallback一直都是flushWork
       * 下面这行代码执行了flushWork
       */
      hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime)
    } finally {
      if (hasMoreWork) {
        /**
         * 如果任务队列还不为空，就注册一个宏任务待会回来继续执行任务
         * 时间分片实现的关键
         */
        schedulePerformWorkUntilDeadline()
      } else {
        isMessageLoopRunning = false
        scheduledHostCallback = null
      }
    }
  } else {
    isMessageLoopRunning = false
  }

  //在将控制权交给浏览器后他将有机会去渲染，所以我们可以重置这个变量
  needsPaint = false
}

/**
 * 使用postMessage注册一个宏任务
 * @param callback
 */
const requestHostCallback = (callback: Function): void => {
  scheduledHostCallback = callback

  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true
    schedulePerformWorkUntilDeadline()
  }
}

let schedulePerformWorkUntilDeadline: () => void

{
  const channel = new MessageChannel()
  const port = channel.port2
  channel.port1.onmessage = performWorkUntilDeadline
  schedulePerformWorkUntilDeadline = () => {
    port.postMessage(null)
  }
}

/**
 * 将那些延期到时的任务从timerQueue移动到taskQueue
 * @param currentTime 当前的时间
 */
const advanceTimers = (currentTime: number) => {
  let timer = peek(timerQueue) as Task
  while (timer !== null) {
    if (timer.callback === null) {
      //该任务被取消
      pop(timerQueue)
    } else if (timer.startTime <= currentTime) {
      pop(timerQueue)
      timer.sortIndex = timer.expirationTime
      push(taskQueue, timer)
    } else {
      // 剩余的任务都还没有到时
      return
    }
    timer = peek(timerQueue) as any
  }
}

/**
 * 是否将控制权交还给浏览器
 * 为了更好的知道归还时机
 * facebook甚至还和Chrome团队联合实现了一个
 * isInputPending[https://web.dev/isinputpending/]
 * 这个api默认是关闭的所以在这里我没有添加进来
 * 更详细的实现可以去看官方仓库
 * 现在的逻辑是一个切片的时间是5ms超过这个时间就把render工作
 * 暂停，然后在下一个切片中继续工作
 * @returns 
 */
const shouldYieldToHost = (): boolean => {
  return getCurrentTime() >= dealine
}

const requestHostTimeout = (callback: Function, ms: number): void => {
  taskTimeoutID = setTimeout(() => {
    callback(getCurrentTime())
  }, ms) as unknown as number
}

const handleTimeout = (currentTime: number) => {
  isHostTimeoutScheduled = false
  advanceTimers(currentTime)

  if (!isHostCallbackScheduled) {
    if (peek(taskQueue) !== null) {
      isHostCallbackScheduled = true
      requestHostCallback(flushWork)
    } else {
      const firstTimer = peek(timerQueue) as Task
      if (firstTimer !== null) {
        requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime)
      }
    }
  }
}

const workLoop = (hasTimeRemaining: boolean, initialTime: number) => {
  let currentTime = initialTime
  advanceTimers(currentTime)
  currentTask = peek(taskQueue) as any

  while (currentTask !== null) {
    if (
      currentTask.expirationTime > currentTime &&
      (!hasTimeRemaining || shouldYieldToHost())
    ) {
      //如果当前的任务还没有过期而且已经期限了直接break
      break
    }

    const callback = currentTask.callback

    if (typeof callback === 'function') {
      currentTask.callback = null
      currentPriorityLevel = currentTask.priorityLevel
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime

      const continuationCallback = callback(didUserCallbackTimeout)
      currentTime = getCurrentTime()
      if (typeof continuationCallback === 'function') {
        currentTask.callback = continuationCallback
      } else {
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue)
        }
      }

      advanceTimers(currentTime)
    } else {
      pop(taskQueue)
    }

    currentTask = peek(taskQueue) as any
  }

  if (currentTask !== null) {
    return true
  } else {
    const firstTimer = peek(timerQueue) as Task
    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime)
    }
    return false
  }
}

const flushWork = (hasTimeRemaining: boolean, initialTime: number) => {
  //将该变量设置为false,让以后的host callback能被规划
  isHostCallbackScheduled = false

  if (isHostTimeoutScheduled) {
    throw new Error('Not Implement')
  }

  isPerformingWork = true

  const previousPriorityLevel = currentPriorityLevel

  try {
    return workLoop(hasTimeRemaining, initialTime)
  } finally {
    currentTask = null
    currentPriorityLevel = previousPriorityLevel
    isPerformingWork = false
  }
}

/**
 * 调度一个任务，根据其优先级为其设置一个过期时间,
 * 然后将他放入一个以过期时间为排序标准的最小优先队列
 * 比如调度了一个Normal和一个Sync级别的任务，且当前时间为0
 * 所以Normal级别的任务的过期时间为5000，而Sync级别的为-1
 * 所以Sync级别的过期时间被Normal级别的小，会被先出队执行
 * @param priorityLevel 该任务的优先级,决定了该任务的过期时间
 * @param callback 要调度的任务最常见的就是performConcurrentWorkOnRoot
 * @param options
 * @returns 返回该任务节点，持有该任务节点的模块可在其执行前将其取消
 */
const unstable_scheduleCallback = (
  priorityLevel: PriorityLevel,
  callback: Function,
  options: {
    delay: number
  } | null
): Task => {
  const currentTime = getCurrentTime()
  let startTime

  if (typeof options === 'object' && options !== null) {
    const delay = options.delay
    if (typeof delay === 'number' && delay > 0) {
      startTime = currentTime + delay
    } else {
      startTime = currentTime
    }
  } else {
    startTime = currentTime
  }

  let timeout: number

  switch (priorityLevel) {
    case NormalPriority:
      timeout = NORMAL_PRIORITY_TIMEOUT
      break
    default:
      throw new Error('Not Implement')
  }

  const expirationTime = startTime + timeout
  const newTask: Task = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1,
  }

  if (startTime > currentTime) {
    //这是个延时任务
    // newTask.sortIndex = startTime
    // push(timerQueue, newTask)
    throw new Error('Not Implement')
  } else {
    newTask.sortIndex = expirationTime
    //入队
    push(taskQueue, newTask)

    //用postMessage注册一个宏任务，在该宏任务中执行任务队列中的任务
    //并设置相关变量防止二次注册
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true
      requestHostCallback(flushWork)
    }
  }

  return newTask
}

/**
 * 取消一个优先队列中的任务
 * @param task 要取消的任务
 */
const unstable_cancelCallback = (task: Task) => {
  /**
   * 要删除一个优先队列中的随机元素，需要O(N)的时间复杂度很不划算
   * 不如直接把他的callback直接赋值为null然后在pop出来的时候在判断一下
   * 是否因该忽略他就行
   */
  task.callback = null
}

export {
  getCurrentTime as unstable_now,
  unstable_scheduleCallback,
  NormalPriority as unstable_NormalPriority,
  shouldYieldToHost as unstable_shouldYield,
  unstable_cancelCallback,
}
