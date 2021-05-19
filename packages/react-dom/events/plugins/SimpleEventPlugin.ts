import { Fiber } from '../../../react-reconciler/ReactInternalTypes'
import { DOMEventName } from '../DOMEventNames'
import {
  registerSimpleEvents,
  topLevelEventsToReactNames,
} from '../DOMEventProperties'
import {
  accumulateSinglePhaseListeners,
  DispatchQueue,
} from '../DOMPluginEventSystem'
import { EventSystemFlags, IS_CAPTURE_PHASE } from '../EventSystemFlags'
import { AnyNativeEvent } from '../PluginModuleType'
import { SyntheticEvent, SyntheticKeyboardEvent, SyntheticMouseEvent } from '../SyntheticEvent'

const extractEvents = (
  dispatchQueue: DispatchQueue,
  domEventName: DOMEventName,
  targetInst: null | Fiber,
  nativeEvent: AnyNativeEvent,
  nativeEventTarget: null | EventTarget,
  eventSystemFlags: EventSystemFlags,
  targetContainer: EventTarget
): void => {
  let SyntheticEventCtor = SyntheticEvent
  switch (domEventName) {
    case 'keydown':
    case 'keyup':
      SyntheticEventCtor = SyntheticKeyboardEvent
      break
    case 'click':
      SyntheticEventCtor = SyntheticMouseEvent
    default:
      break
  }

  const reactName = topLevelEventsToReactNames.get(domEventName) ?? null

  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0
  const accumulateTargetOnly = !inCapturePhase && domEventName === 'scroll'

  const listeners = accumulateSinglePhaseListeners(
    targetInst,
    reactName,
    inCapturePhase,
    accumulateTargetOnly
  )

  if (listeners.length) {
    const event = new SyntheticEventCtor(
      reactName,
      '',
      null as any,
      nativeEvent as any,
      nativeEventTarget
    )
    dispatchQueue.push({ event, listeners })
  }
}

export { registerSimpleEvents as registerEvents, extractEvents }
