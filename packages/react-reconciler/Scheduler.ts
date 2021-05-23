import * as Scheduler from '../scheduler'
import { PriorityLevel } from '../scheduler/SchedulerPriorities'

export const now = Scheduler.unstable_now

export type SchedulerCallback = (isSync: boolean) => SchedulerCallback | null
export const scheduleCallback = Scheduler.unstable_scheduleCallback
export const NormalPriority: PriorityLevel = Scheduler.unstable_NormalPriority
export const shouldYield = Scheduler.unstable_shouldYield
export const cancelCallback = Scheduler.unstable_cancelCallback
