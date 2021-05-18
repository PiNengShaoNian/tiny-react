import {
  ContinuousEvent,
  DiscreteEvent,
  EventPriority,
} from '../../shared/ReactTypes'
import { DOMEventName } from './DOMEventNames'
import { registerTwoPhaseEvent } from './EventRegistry'

const eventPriorities: Map<string, EventPriority> = new Map()
// prettier-ignore
const discreteEventPairsForSimpleEventPlugin = [
    ('cancel' as DOMEventName), 'cancel',
    ('click' as DOMEventName), 'click',
    ('close' as DOMEventName), 'close',
    ('contextmenu' as DOMEventName), 'contextMenu',
    ('copy' as DOMEventName), 'copy',
    ('cut' as DOMEventName), 'cut',
    ('auxclick' as DOMEventName), 'auxClick',
    ('dblclick' as DOMEventName), 'doubleClick', // Careful!
    ('dragend' as DOMEventName), 'dragEnd',
    ('dragstart' as DOMEventName), 'dragStart',
    ('drop' as DOMEventName), 'drop',
    ('focusin' as DOMEventName), 'focus', // Careful!
    ('focusout' as DOMEventName), 'blur', // Careful!
    ('input' as DOMEventName), 'input',
    ('invalid' as DOMEventName), 'invalid',
    ('keydown' as DOMEventName), 'keyDown',
    ('keypress' as DOMEventName), 'keyPress',
    ('keyup' as DOMEventName), 'keyUp',
    ('mousedown' as DOMEventName), 'mouseDown',
    ('mouseup' as DOMEventName), 'mouseUp',
    ('paste' as DOMEventName), 'paste',
    ('pause' as DOMEventName), 'pause',
    ('play' as DOMEventName), 'play',
    ('pointercancel' as DOMEventName), 'pointerCancel',
    ('pointerdown' as DOMEventName), 'pointerDown',
    ('pointerup' as DOMEventName), 'pointerUp',
    ('ratechange' as DOMEventName), 'rateChange',
    ('reset' as DOMEventName), 'reset',
    ('seeked' as DOMEventName), 'seeked',
    ('submit' as DOMEventName), 'submit',
    ('touchcancel' as DOMEventName), 'touchCancel',
    ('touchend' as DOMEventName), 'touchEnd',
    ('touchstart' as DOMEventName), 'touchStart',
    ('volumechange' as DOMEventName), 'volumeChange',
  ];

export const topLevelEventsToReactNames: Map<DOMEventName, string> = new Map()

const registerSimplePluginEventsAndSetTheirPriorities = (
  eventTypes: (DOMEventName | string)[],
  priority: EventPriority
): void => {
  for (let i = 0; i < eventTypes.length; i += 2) {
    const topEvent = eventTypes[i] as DOMEventName
    const event = eventTypes[i + 1]
    const capitalizedEvent = event[0].toUpperCase() + event.slice(1)
    const reactName = 'on' + capitalizedEvent
    eventPriorities.set(topEvent, priority)
    topLevelEventsToReactNames.set(topEvent, reactName)
    registerTwoPhaseEvent(reactName, [topEvent])
  }
}

// export const getEventPriorityForPluginSystem = (
//   domEventName: DOMEventName
// ): EventPriority => {
//   const priority = eventPriorities.get(domEventName)

//   return priority === undefined ? ContinuousEvent : priority
// }

export const registerSimpleEvents = () => {
  registerSimplePluginEventsAndSetTheirPriorities(
    discreteEventPairsForSimpleEventPlugin,
    DiscreteEvent
  )
}
