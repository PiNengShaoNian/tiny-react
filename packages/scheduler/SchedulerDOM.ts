import { NormalPriority, PriorityLevel } from './SchedulerPriorities'
import { push, Node, peek, pop } from './SchedulerMinHeap'

type Task = {
  id: number
  callback: Function | null
  priorityLevel: PriorityLevel
  startTime: number
  expirationTime: number
  sortIndex: number
}

const getCurrentTime = () => performance.now()
const NORMAL_PRIORITY_TIMEOUT = 5000
let taskIdCounter = 1
const timerQueue: Node[] = []
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
      hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime)
    } finally {
      if (hasMoreWork) {
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

const shouldYieldToHost = (): boolean => {
  return getCurrentTime() >= dealine
}

const requestHostTimeout = (callback: Function, ms: number): void => {
  taskTimeoutID = (setTimeout(() => {
    callback(getCurrentTime())
  }, ms) as unknown) as number
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

const workLoop = (hasTimeRemaining: number, initialTime: number) => {
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

const flushWork = (hasTimeRemaining: number, initialTime: number) => {
  //我们需要下一个host callback能被规划
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

const unstable_scheduleCallback = (
  priorityLevel: PriorityLevel,
  callback: Function,
  options: {
    delay: number
  } | null
) => {
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
    push(taskQueue, newTask)

    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true
      requestHostCallback(flushWork)
    }
  }
}

export {
  getCurrentTime as unstable_now,
  unstable_scheduleCallback,
  NormalPriority as unstable_NormalPriority,
}
