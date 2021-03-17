import { Fiber } from '../../react-reconciler/ReactInternalTypes'
import { HostComponent } from '../../react-reconciler/ReactWorkTags'
import { DOMEventName } from './DOMEventNames'
import {
  addEventBubbleListener,
  addEventBubbleListenerWithPassiveFlag,
  addEventCaptureListener,
  addEventCaptureListenerWithPassiveFlag,
} from './EventListener'
import { allNativeEvents } from './EventRegistry'
import { EventSystemFlags, IS_CAPTURE_PHASE } from './EventSystemFlags'
import { getEventTarget } from './getEventTarget'
import { getListener } from './getListener'
import { AnyNativeEvent } from './PluginModuleType'
import * as SimpleEventPlugin from './plugins/SimpleEventPlugin'
import { createEventListenerWrapperWithPriority } from './ReactDOMEventListener'
import { batchedEventUpdates } from './ReactDOMUpdateBatching'
import { ReactSyntheticEvent } from './ReactSyntheticEventType'

const listeningMarker = '_reactListening' + Math.random().toString(36).slice(2)

type DispatchListener = {
  instance: Fiber | null
  listener: Function
  currentTarget: EventTarget
}
type DispatchEntry = {
  event: ReactSyntheticEvent
  listeners: DispatchListener[]
}

export type DispatchQueue = DispatchEntry[]

SimpleEventPlugin.registerEvents()

/**
 * 我们不因该在container代理这些事件，而是因该把他们添加到真正的目标dom上
 * 主要是因为这些事件的冒泡不具有一致性
 */
export const nonDelegatedEvents: Set<DOMEventName> = new Set([
  'cancel' as DOMEventName,
  'close' as DOMEventName,
  'invalid' as DOMEventName,
  'load' as DOMEventName,
  'scroll' as DOMEventName,
  'toggle' as DOMEventName,
])

const addTrappedEventListener = (
  targetContainer: EventTarget,
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  isCapturePhaseListener: boolean
) => {
  const listener = createEventListenerWrapperWithPriority(
    targetContainer,
    domEventName,
    eventSystemFlags
  )

  let isPassiveListener: undefined | boolean = undefined

  if (
    domEventName === 'wheel' ||
    domEventName === 'touchmove' ||
    domEventName === 'touchstart'
  ) {
    isPassiveListener = true
  }

  let unsubscribeListener

  if (isCapturePhaseListener) {
    if (isPassiveListener !== undefined) {
      unsubscribeListener = addEventCaptureListenerWithPassiveFlag(
        targetContainer,
        domEventName,
        listener,
        isPassiveListener
      )
    } else {
      unsubscribeListener = addEventCaptureListener(
        targetContainer,
        domEventName,
        listener
      )
    }
  } else {
    if (isPassiveListener !== undefined) {
      unsubscribeListener = addEventBubbleListenerWithPassiveFlag(
        targetContainer,
        domEventName,
        listener,
        isPassiveListener
      )
    } else {
      unsubscribeListener = addEventBubbleListener(
        targetContainer,
        domEventName,
        listener
      )
    }
  }
}

const listenToNativeEvent = (
  domEventName: DOMEventName,
  isCapturePhaseListener: boolean,
  target: EventTarget
) => {
  let eventSystemFlags = 0

  if (isCapturePhaseListener) {
    eventSystemFlags |= IS_CAPTURE_PHASE
  }

  addTrappedEventListener(
    target,
    domEventName,
    eventSystemFlags,
    isCapturePhaseListener
  )
}

export const listenToAllSupportedEvents = (
  rootContainerElement: EventTarget
) => {
  if (!(rootContainerElement as any)[listeningMarker]) {
    allNativeEvents.forEach((domEventName) => {
      /**
       * 单独处理selectionchange因为他不会冒泡，而且需要设置在document上
       */
      if (domEventName !== 'selectionchange') {
        if (!nonDelegatedEvents.has(domEventName)) {
          listenToNativeEvent(domEventName, false, rootContainerElement)
        }

        listenToNativeEvent(domEventName, true, rootContainerElement)
      }
    })
  }
}

const extractEvents = (
  dispatchQueue: DispatchQueue,
  domEventName: DOMEventName,
  targetInst: null | Fiber,
  nativeEvent: AnyNativeEvent,
  nativeEventTarget: null | EventTarget,
  eventSystemFlags: EventSystemFlags,
  targetContainer: EventTarget
) => {
  SimpleEventPlugin.extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  )
}

const createDispatchListener = (
  instance: Fiber | null,
  listener: Function,
  currentTarget: EventTarget
): DispatchListener => {
  return {
    instance,
    listener,
    currentTarget,
  }
}

export const accumulateSinglePhaseListeners = (
  targetFiber: Fiber | null,
  reactName: string | null,
  inCapturePhase: boolean,
  accumulateTargetOnly: boolean
) => {
  const captureName = reactName !== null ? reactName + 'Capture' : null
  const reactEventName = inCapturePhase ? captureName : reactName
  let listeners: DispatchListener[] = []

  let instance = targetFiber
  let lastHostComponent = null

  while (instance !== null) {
    const { tag, stateNode } = instance

    if (tag === HostComponent && stateNode !== null) {
      lastHostComponent = stateNode
      if (reactEventName !== null) {
        const listener = getListener(instance, reactEventName)

        if (listener !== null) {
          listeners.push(
            createDispatchListener(instance, listener, lastHostComponent)
          )
        }
      }
    }

    if (accumulateTargetOnly) break

    instance = instance.return
  }

  return listeners
}

const executeDispatch = (
  event: ReactSyntheticEvent,
  listener: Function,
  currentTarget: EventTarget
): void => {
  listener(event)
}

const processDispatchQueueItemsInOrder = (
  event: ReactSyntheticEvent,
  dispatchListeners: DispatchListener[],
  inCapturePhase: boolean
): void => {
  if (inCapturePhase) {
    for (let i = dispatchListeners.length - 1; i >= 0; --i) {
      const { instance, currentTarget, listener } = dispatchListeners[i]
      //todo isPropagationStopped
      executeDispatch(event, listener, currentTarget)
    }
  } else {
    for (let i = 0; i < dispatchListeners.length; ++i) {
      const { instance, currentTarget, listener } = dispatchListeners[i]
      //todo isPropagationStopped
      executeDispatch(event, listener, currentTarget)
    }
  }
}

export const processDispatchQueue = (
  dispatchQueue: DispatchQueue,
  eventSystemFlags: EventSystemFlags
): void => {
  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0
  for (let i = 0; i < dispatchQueue.length; ++i) {
    const { event, listeners } = dispatchQueue[i]

    processDispatchQueueItemsInOrder(event, listeners, inCapturePhase)
  }
}

const dispatchEventsForPlugins = (
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  nativeEvent: AnyNativeEvent,
  targetInst: null | Fiber,
  targetContainer: EventTarget
) => {
  const nativeEventTarget = getEventTarget(nativeEvent)

  const dispatchQueue: DispatchQueue = []

  extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  )
  processDispatchQueue(dispatchQueue, eventSystemFlags)
}

export const dispatchEventForPluginEventSystem = (
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  nativeEvent: AnyNativeEvent,
  targetInst: null | Fiber,
  targetContainer: EventTarget
) => {
  const ancestorInst = targetInst
  batchedEventUpdates(
    () =>
      dispatchEventsForPlugins(
        domEventName,
        eventSystemFlags,
        nativeEvent,
        ancestorInst,
        targetContainer
      ),
    null,
    null
  )
}
