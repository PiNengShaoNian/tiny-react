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

/**
 * 当前更新的优先级比如一个click事件产生的更新就为DiscreteEventPriority
 * @returns 当前更新的优先级
 */
export const getCurrentUpdatePriority = (): EventPriority => {
  return currentUpdatePriority
}

/**
 * 设置当前更新的优先级，比如点击事件产生后，就会调用该方法将其设置为DiscreteEventPriority
 * @param newPriority 当前更新的优先级
 */
export const setCurrentUpdatePriority = (newPriority: EventPriority): void => {
  currentUpdatePriority = newPriority
}

/**
 * 判断a的优先级是否比b大
 * @param a a优先级
 * @param b b优先级
 * @returns
 */
const isHigherEventPriority = (a: EventPriority, b: EventPriority): boolean => {
  return a !== 0 && a < b
}

/**
 * 将lanes转换为与其优先级相符的事件优先级
 * @param lanes 要转换的lanes
 * @returns 对应的事件优先级
 */
export const lanesToEventPriority = (lanes: Lanes): EventPriority => {
  const lane = getHighestPriorityLane(lanes)
  //lane的优先级不小于DiscreteEventPriority，直接返回DiscreteEventPriority
  if (!isHigherEventPriority(DiscreteEventPriority, lane))
    return DiscreteEventPriority

  //和上面同理
  if (!isHigherEventPriority(ContinuousEventPriority, lane)) {
    return ContinuousEventPriority
  }

  //有lane被占用，返回DefaultEventPriority
  if (includesNonIdleWork(lane)) return DefaultEventPriority

  return IdleEventPriority
}
