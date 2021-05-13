import {
  Lane,
  NoLane,
  SyncLane,
  DefaultLane,
  Lanes,
  getHighestPriorityLane,
  InputContinuousLane,
  includesNonIdleWork,
  IdleLane,
} from './ReactFiberLane'

export type EventPriority = Lane

export const DiscreteEventPriority: EventPriority = SyncLane
export const DefaultEventPriority: EventPriority = DefaultLane
export const ContinuousEventPriority: EventPriority = InputContinuousLane
export const IdleEventPriority: EventPriority = IdleLane

let currentUpdatePriority: EventPriority = NoLane

export const getCurrentUpdatePriority = (): EventPriority => {
  return currentUpdatePriority
}

export const setCurrentUpdatePriority = (newPriority: EventPriority): void => {
  currentUpdatePriority = newPriority
}

const isHigherEventPriority = (a: EventPriority, b: EventPriority): boolean => {
  return a !== 0 && a < b
}

export const lanesToEventPriority = (lanes: Lanes): EventPriority => {
  const lane = getHighestPriorityLane(lanes)
  if (!isHigherEventPriority(DiscreteEventPriority, lane))
    return DiscreteEventPriority

  if (!isHigherEventPriority(ContinuousEventPriority, lane)) {
    return ContinuousEventPriority
  }

  if (includesNonIdleWork(lane)) return DefaultEventPriority

  return IdleEventPriority
}
