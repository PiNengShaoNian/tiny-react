import {
  DiscreteEventPriority,
  getCurrentUpdatePriority,
  setCurrentUpdatePriority,
} from './ReactEventPriorities'
import { SchedulerCallback } from './Scheduler'

let syncQueue: Array<SchedulerCallback> | null = null
let includesLegacySyncCallbacks: boolean = false
let isFlushingSyncQueue: boolean = false

export const scheduleSyncCallback = (callback: SchedulerCallback) => {
  if (syncQueue === null) {
    syncQueue = [callback]
  } else {
    syncQueue.push(callback)
  }
}

export const scheduleLegacySyncCallback = (callback: SchedulerCallback) => {
  includesLegacySyncCallbacks = true
  scheduleSyncCallback(callback)
}

export const flushSyncCallbacks = () => {
  if (!isFlushingSyncQueue && syncQueue !== null) {
    //防止二次进入
    isFlushingSyncQueue = true
    let i = 0
    const previousUpdatePriority = getCurrentUpdatePriority()
    try {
      const isSync = true
      const queue = syncQueue
      setCurrentUpdatePriority(DiscreteEventPriority)

      for (; i < queue.length; ++i) {
        let callback: SchedulerCallback | null = queue[i]
        do {
          callback = callback(isSync)
        } while (callback !== null)
      }

      syncQueue = null
      includesLegacySyncCallbacks = false
    } catch (e) {
      console.log(e)
      throw new Error('Not Implement')
    } finally {
      setCurrentUpdatePriority(previousUpdatePriority)
      isFlushingSyncQueue = false
    }
  }
}
