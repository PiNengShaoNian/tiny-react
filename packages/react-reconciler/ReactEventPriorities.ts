import { KeyExportOptions } from 'crypto'
import { Lane, NoLane, SyncLane } from './ReactFiberLane'

export type EventPriority = Lane

export const DiscreteEventPriority: EventPriority = SyncLane

let currentUpdatePriority: EventPriority = NoLane

export const getCurrentUpdatePriority = (): EventPriority => {
  return currentUpdatePriority
}
