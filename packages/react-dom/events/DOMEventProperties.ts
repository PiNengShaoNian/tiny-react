import { DOMEventName } from './DOMEventNames'
import { registerTwoPhaseEvent } from './EventRegistry'

const simpleEventPluginEvents = [
  'abort',
  'auxClick',
  'cancel',
  'canPlay',
  'canPlayThrough',
  'click',
  'close',
  'contextMenu',
  'copy',
  'cut',
  'drag',
  'dragEnd',
  'dragEnter',
  'dragExit',
  'dragLeave',
  'dragOver',
  'dragStart',
  'drop',
  'durationChange',
  'emptied',
  'encrypted',
  'ended',
  'error',
  'gotPointerCapture',
  'input',
  'invalid',
  'keyDown',
  'keyPress',
  'keyUp',
  'load',
  'loadedData',
  'loadedMetadata',
  'loadStart',
  'lostPointerCapture',
  'mouseDown',
  'mouseMove',
  'mouseOut',
  'mouseOver',
  'mouseUp',
  'paste',
  'pause',
  'play',
  'playing',
  'pointerCancel',
  'pointerDown',
  'pointerMove',
  'pointerOut',
  'pointerOver',
  'pointerUp',
  'progress',
  'rateChange',
  'reset',
  'seeked',
  'seeking',
  'stalled',
  'submit',
  'suspend',
  'timeUpdate',
  'touchCancel',
  'touchEnd',
  'touchStart',
  'volumeChange',
  'scroll',
  'toggle',
  'touchMove',
  'waiting',
  'wheel',
]

export const topLevelEventsToReactNames: Map<DOMEventName, string> = new Map()

const registerSimpleEvent = (
  domEventName: DOMEventName,
  reactName: string
): void => {
  topLevelEventsToReactNames.set(domEventName, reactName)
  registerTwoPhaseEvent(reactName, [domEventName])
}

export const registerSimpleEvents = () => {
  for (let i = 0; i < simpleEventPluginEvents.length; ++i) {
    const eventName = simpleEventPluginEvents[i]
    const domEventName = eventName.toLowerCase() as DOMEventName
    const capitalizedEvent = eventName[0].toUpperCase() + eventName.slice(1)

    registerSimpleEvent(domEventName, 'on' + capitalizedEvent)
  }

  registerSimpleEvent('focusin', 'onFocus')
  registerSimpleEvent('focusout', 'onBlur')
}
