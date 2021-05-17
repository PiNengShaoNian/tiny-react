import { DiscreteEventPriority } from '../../react-reconciler/ReactEventPriorities'
import { Lane } from '../../react-reconciler/ReactFiberLane'
import { DiscreteEvent } from '../../shared/ReactTypes'
import { Container } from '../ReactDomRoot'
import { DOMEventName } from './DOMEventNames'
import { getEventPriorityForPluginSystem } from './DOMEventProperties'
import { dispatchEventForPluginEventSystem } from './DOMPluginEventSystem'
import { EventSystemFlags } from './EventSystemFlags'
import { getEventTarget } from './getEventTarget'
import { AnyNativeEvent } from './PluginModuleType'
import { getClosestInstanceFromNode } from './ReactDOMComponentTree'
import { discreteUpdates } from './ReactDOMUpdateBatching'

const dispatchDiscreteEvent = (
  domEventName: DOMEventName,
  eventSymtemFlags: EventSystemFlags,
  container: EventTarget,
  nativeEvent: Event
) => {
  discreteUpdates(
    dispatchEvent,
    domEventName,
    eventSymtemFlags,
    container,
    nativeEvent
  )
}

const attemptToDispatchEvent = (
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  targetContainer: EventTarget,
  nativeEvent: AnyNativeEvent
): null | Container => {
  const nativeEventTarget = getEventTarget(nativeEvent)
  const targetInst = getClosestInstanceFromNode(nativeEventTarget!)

  dispatchEventForPluginEventSystem(
    domEventName,
    eventSystemFlags,
    nativeEvent,
    targetInst,
    targetContainer
  )

  return null
}

export const dispatchEvent = (
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  targetContainer: EventTarget,
  nativeEvent: AnyNativeEvent
): void => {
  attemptToDispatchEvent(
    domEventName,
    eventSystemFlags,
    targetContainer,
    nativeEvent
  )
}

export const createEventListenerWrapperWithPriority = (
  targetContainer: EventTarget,
  domEventName: DOMEventName,
  eventSymtemFlags: EventSystemFlags
): Function => {
  const eventPriority = getEventPriorityForPluginSystem(domEventName)

  let listenerWrapper

  switch (eventPriority) {
    case DiscreteEvent:
      listenerWrapper = dispatchDiscreteEvent
      break

    default:
      throw new Error('Not Implement')
  }

  return listenerWrapper.bind(
    null,
    domEventName,
    eventSymtemFlags,
    targetContainer
  )
}

export const getEventPriority = (domEventName: DOMEventName): Lane => {
  switch (domEventName) {
    case 'click':
      return DiscreteEventPriority

    default:
      throw new Error('Not Implement')
  }
}
