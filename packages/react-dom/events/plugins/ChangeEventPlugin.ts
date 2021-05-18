import { Fiber } from '../../../react-reconciler/ReactInternalTypes'
import { updateValueIfChanged } from '../../inputValueTracking'
import { DOMEventName } from '../DOMEventNames'
import {
  accumulateTwoPhaseListeners,
  DispatchQueue,
} from '../DOMPluginEventSystem'
import { registerTwoPhaseEvent } from '../EventRegistry'
import { EventSystemFlags } from '../EventSystemFlags'
import { AnyNativeEvent } from '../PluginModuleType'
import { SyntheticEvent } from '../SyntheticEvent'

const registerEvents = () => {
  registerTwoPhaseEvent('onChange', [
    'change',
    'click',
    'focusin',
    'focusout',
    'input',
    'keydown',
    'keyup',
    'selectionchange',
  ])
}

const shouldUseChangeEvent = (elem: Element) => {
  const nodeName = elem.nodeName && elem.nodeName.toLowerCase()

  return (
    nodeName === 'select' ||
    (nodeName === 'input' && (elem as any).type === 'file')
  )
}

const isTextInputElement = (elem: HTMLElement) => {
  const nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase()

  if (nodeName === 'input' || nodeName === 'textarea') {
    return true
  }

  return false
}

const getInstIfValueChanged = (targetInst: Fiber) => {
  const targetNode = targetInst.stateNode

  if (updateValueIfChanged(targetNode)) {
    return targetInst
  }
}

const getTargetInstForInputOrChangeEvent = (
  domEventName: DOMEventName,
  targetInst: Fiber
) => {
  if (domEventName === 'input' || domEventName === 'change') {
    return getInstIfValueChanged(targetInst)
  }
}

const createAndAccumulateChangeEvent = (
  dispatchQueue: DispatchQueue,
  inst: Fiber,
  nativeEvent: AnyNativeEvent,
  target: EventTarget | null
) => {
  const listeners = accumulateTwoPhaseListeners(inst, 'onChange')
  if (listeners.length > 0) {
    const event = new SyntheticEvent(
      'onChange',
      'change',
      null as any,
      nativeEvent as any,
      target
    )

    dispatchQueue.push({ event, listeners })
  }
}

const shouldUseClickEvent = (elem: HTMLElement) => {
  const nodeName = elem.nodeName

  return (
    nodeName &&
    nodeName.toLowerCase() === 'input' &&
    ((elem as HTMLInputElement).type === 'checkbox' ||
      (elem as HTMLInputElement).type === 'radio')
  )
}

const extractEvents = (
  dispatchQueue: DispatchQueue,
  domEventName: DOMEventName,
  targetInst: null | Fiber,
  nativeEvent: AnyNativeEvent,
  nativeEventTarget: null | EventTarget,
  eventSystemFlags: EventSystemFlags,
  targetContainer: null | EventTarget
) => {
  const targetNode = targetInst ? targetInst.stateNode : window

  let getTargetInstFunc: undefined | Function, handleEventFunc

  if (shouldUseChangeEvent(targetNode)) {
    throw new Error('Not Implement')
  } else if (isTextInputElement(targetNode as any)) {
    getTargetInstFunc = getTargetInstForInputOrChangeEvent
  } else if (shouldUseClickEvent(targetNode)) {
    throw new Error('Not Implement')
  }

  if (getTargetInstFunc) {
    const inst: Fiber | null = getTargetInstFunc(domEventName, targetInst)
    if (inst) {
      createAndAccumulateChangeEvent(
        dispatchQueue,
        inst,
        nativeEvent,
        nativeEventTarget
      )

      return
    }
  }
}

export { extractEvents, registerEvents }
