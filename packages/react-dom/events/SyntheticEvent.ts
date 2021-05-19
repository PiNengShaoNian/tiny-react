import { Fiber } from '../../react-reconciler/ReactInternalTypes'

export const createSyntheticEvent = () => {
  class SyntheticBaseEvent {
    _reactName: string | null = null
    _targetInst: Fiber
    type: string
    nativeEvent: { [key: string]: unknown }
    target: null | EventTarget

    constructor(
      reactName: string | null,
      reactEventType: string,
      targetInst: Fiber,
      nativeEvent: { [key: string]: unknown },
      nativeEventTarget: null | EventTarget
    ) {
      this._reactName = reactName
      this._targetInst = targetInst
      this.type = reactEventType
      this.nativeEvent = nativeEvent
      this.target = nativeEventTarget
    }
  }

  return SyntheticBaseEvent
}

export const SyntheticEvent = createSyntheticEvent()

export const SyntheticMouseEvent = createSyntheticEvent()

export const SyntheticKeyboardEvent = createSyntheticEvent()
