import { Fiber } from '../../react-reconciler/ReactInternalTypes'
import { Props } from '../ReactDOMHostConfig'
import { getFiberCurrentPropsFromNode } from './ReactDOMComponentTree'

const isInteractive = (tag: string): boolean => {
  return (
    tag === 'button' ||
    tag === 'input' ||
    tag === 'select' ||
    tag === 'textarea'
  )
}

const shouldPreventMouseEvent = (
  name: string,
  type: string,
  props: Props
): boolean => {
  switch (name) {
    case 'onClick':
    case 'onClickCapture':
    case 'onDoubleClick':
    case 'onDoubleClickCapture':
    case 'onMouseDown':
    case 'onMouseDownCapture':
    case 'onMouseMove':
    case 'onMouseMoveCapture':
    case 'onMouseUp':
    case 'onMouseUpCapture':
    case 'onMouseEnter':
      return !!(props.disabled && isInteractive(type))
    default:
      return false
  }
}

export const getListener = (
  instance: Fiber,
  registrationName: string
): Function | null => {
  const stateNode = instance.stateNode

  if (stateNode === null) return null

  const props = getFiberCurrentPropsFromNode(stateNode)
  if (props === null) return null
  const listener = (props as any)[registrationName]
  if (shouldPreventMouseEvent(registrationName, instance.type, props))
    return null

  return listener ?? null
}
