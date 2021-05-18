import { DiscreteEventPriority } from '../../react-reconciler/ReactEventPriorities'
import { Lane } from '../../react-reconciler/ReactFiberLane'
import { Container } from '../ReactDomRoot'
import { DOMEventName } from './DOMEventNames'
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
  const eventPriority = getEventPriority(domEventName)

  let listenerWrapper

  switch (eventPriority) {
    case DiscreteEventPriority:
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
    case 'cancel':
    case 'click':
    case 'close':
    case 'contextmenu':
    case 'copy':
    case 'cut':
    case 'auxclick':
    case 'dblclick':
    case 'dragend':
    case 'dragstart':
    case 'drop':
    case 'focusin':
    case 'focusout':
    case 'input':
    case 'invalid':
    case 'keydown':
    case 'keypress':
    case 'keyup':
    case 'mousedown':
    case 'mouseup':
    case 'paste':
    case 'pause':
    case 'play':
    case 'pointercancel':
    case 'pointerdown':
    case 'pointerup':
    case 'ratechange':
    case 'reset':
    case 'seeked':
    case 'submit':
    case 'touchcancel':
    case 'touchend':
    case 'touchstart':
    case 'volumechange':
    // Used by polyfills:
    // eslint-disable-next-line no-fallthrough
    case 'change':
    case 'selectionchange':
    case 'textInput':
    case 'compositionstart':
    case 'compositionend':
    case 'compositionupdate':
    // Only enableCreateEventHandleAPI:
    // eslint-disable-next-line no-fallthrough
    case 'beforeblur':
    case 'afterblur':
    // Not used by React but could be by user code:
    // eslint-disable-next-line no-fallthrough
    case 'beforeinput':
    case 'blur':
    case 'fullscreenchange':
    case 'focus':
    case 'hashchange':
    case 'popstate':
    case 'select':
    case 'selectstart':
      return DiscreteEventPriority
    default:
      throw new Error('Not Implement')
  }
}
