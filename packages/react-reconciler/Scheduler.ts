import * as Scheduler from '../scheduler'

export const now = Scheduler.unstable_now

export type SchedulerCallback = (isSync: boolean) => SchedulerCallback | null
export const scheduleCallback = Scheduler.unstable_scheduleCallback
export const NormalPriority = Scheduler.unstable_NormalPriority
