import { PriorityLevel } from '../packages/scheduler/SchedulerPriorities'
let Scheduler: any
let runtime: {
  advanceTime: Function
  fireMessageEvent: Function
  log: Function
  isLogEmpty: Function
  assertLog: Function
}
let performance: {
  now: Function
}
let cancelCallback: Function
let scheduleCallback: Function
let NormalPriority: PriorityLevel

// The Scheduler implementation uses browser APIs like `MessageChannel` and
// `setTimeout` to schedule work on the main thread. Most of our tests treat
// these as implementation details; however, the sequence and timing of these
// APIs are not precisely specified, and can vary across browsers.
//
// To prevent regressions, we need the ability to simulate specific edge cases
// that we may encounter in various browsers.
//
// This test suite mocks all browser methods used in our implementation. It
// assumes as little as possible about the order and timing of events.
describe('SchedulerBrowser', () => {
  beforeEach(() => {
    jest.resetModules()
    runtime = installMockBrowserRuntime()
    // jest.unmock('scheduler')

    Scheduler = require('../packages/scheduler')
    performance = global.performance as any
    cancelCallback = Scheduler.unstable_cancelCallback
    scheduleCallback = Scheduler.unstable_scheduleCallback
    NormalPriority = Scheduler.unstable_NormalPriority
  })

  afterEach(() => {
    delete (global as any).performance

    if (!runtime.isLogEmpty()) {
      throw Error('Test exited without clearing log.')
    }
  })

  function installMockBrowserRuntime() {
    let hasPendingMessageEvent = false

    let timerIDCounter = 0
    // let timerIDs = new Map();

    let eventLog: string[] = []

    let currentTime = 0

    ;(global as any).performance = {
      now() {
        return currentTime
      },
    }

    // Delete node provide setImmediate so we fall through to MessageChannel.
    delete (global as any).setImmediate

    global.setTimeout = ((cb: Function, delay: number) => {
      const id = timerIDCounter++
      log(`Set Timer`)
      // TODO
      return id
    }) as any
    global.clearTimeout = ((id: number) => {
      // TODO
    }) as any

    const port1: { onmessage: Function } = {} as any
    const port2 = {
      postMessage() {
        if (hasPendingMessageEvent) {
          throw Error('Message event already scheduled')
        }
        log('Post Message')
        hasPendingMessageEvent = true
      },
    }
    global.MessageChannel = function MessageChannel(this: any) {
      this.port1 = port1
      this.port2 = port2
    } as any

    function ensureLogIsEmpty() {
      if (eventLog.length !== 0) {
        throw Error('Log is not empty. Call assertLog before continuing.')
      }
    }
    function advanceTime(ms: number) {
      currentTime += ms
    }
    function fireMessageEvent() {
      ensureLogIsEmpty()
      if (!hasPendingMessageEvent) {
        throw Error('No message event was scheduled')
      }
      hasPendingMessageEvent = false
      const onMessage = port1.onmessage
      log('Message Event')
      onMessage()
    }
    function log(val: string) {
      eventLog.push(val)
    }
    function isLogEmpty() {
      return eventLog.length === 0
    }
    function assertLog(expected: string[]) {
      const actual = eventLog
      eventLog = []
      expect(actual).toEqual(expected)
    }
    return {
      advanceTime,
      fireMessageEvent,
      log,
      isLogEmpty,
      assertLog,
    }
  }

  it('task that finishes before deadline', () => {
    scheduleCallback(NormalPriority, () => {
      runtime.log('Task')
    })
    runtime.assertLog(['Post Message'])
    runtime.fireMessageEvent()
    runtime.assertLog(['Message Event', 'Task'])
  })

  it('task with continuation', () => {
    scheduleCallback(NormalPriority, () => {
      runtime.log('Task')
      while (!Scheduler.unstable_shouldYield()) {
        runtime.advanceTime(1)
      }
      runtime.log(`Yield at ${performance.now()}ms`)
      return () => {
        runtime.log('Continuation')
      }
    })
    runtime.assertLog(['Post Message'])

    runtime.fireMessageEvent()
    runtime.assertLog(['Message Event', 'Task', 'Yield at 5ms', 'Post Message'])

    runtime.fireMessageEvent()
    runtime.assertLog(['Message Event', 'Continuation'])
  })

  it('multiple tasks', () => {
    scheduleCallback(NormalPriority, () => {
      runtime.log('A')
    })
    scheduleCallback(NormalPriority, () => {
      runtime.log('B')
    })
    runtime.assertLog(['Post Message'])
    runtime.fireMessageEvent()
    runtime.assertLog(['Message Event', 'A', 'B'])
  })

  it('multiple tasks with a yield in between', () => {
    scheduleCallback(NormalPriority, () => {
      runtime.log('A')
      runtime.advanceTime(4999)
    })
    scheduleCallback(NormalPriority, () => {
      runtime.log('B')
    })
    runtime.assertLog(['Post Message'])
    runtime.fireMessageEvent()
    runtime.assertLog([
      'Message Event',
      'A',
      // Ran out of time. Post a continuation event.
      'Post Message',
    ])
    runtime.fireMessageEvent()
    runtime.assertLog(['Message Event', 'B'])
  })

  it('cancels tasks', () => {
    const task = scheduleCallback(NormalPriority, () => {
      runtime.log('Task')
    })
    runtime.assertLog(['Post Message'])
    cancelCallback(task)
    runtime.assertLog([])
  })

  it('throws when a task errors then continues in a new event', () => {
    scheduleCallback(NormalPriority, () => {
      runtime.log('Oops!')
      throw Error('Oops!')
    })
    scheduleCallback(NormalPriority, () => {
      runtime.log('Yay')
    })
    runtime.assertLog(['Post Message'])

    expect(() => runtime.fireMessageEvent()).toThrow('Oops!')
    runtime.assertLog(['Message Event', 'Oops!', 'Post Message'])

    runtime.fireMessageEvent()
    runtime.assertLog(['Message Event', 'Yay'])
  })

  it('schedule new task after queue has emptied', () => {
    scheduleCallback(NormalPriority, () => {
      runtime.log('A')
    })

    runtime.assertLog(['Post Message'])
    runtime.fireMessageEvent()
    runtime.assertLog(['Message Event', 'A'])

    scheduleCallback(NormalPriority, () => {
      runtime.log('B')
    })
    runtime.assertLog(['Post Message'])
    runtime.fireMessageEvent()
    runtime.assertLog(['Message Event', 'B'])
  })

  it('schedule new task after a cancellation', () => {
    const handle = scheduleCallback(NormalPriority, () => {
      runtime.log('A')
    })

    runtime.assertLog(['Post Message'])
    cancelCallback(handle)

    runtime.fireMessageEvent()
    runtime.assertLog(['Message Event'])

    scheduleCallback(NormalPriority, () => {
      runtime.log('B')
    })
    runtime.assertLog(['Post Message'])
    runtime.fireMessageEvent()
    runtime.assertLog(['Message Event', 'B'])
  })
})
