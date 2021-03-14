import { Container } from './ReactDomRoot'

export type Props = {
  autoFocus?: boolean
  children?: unknown
  disabled?: boolean
  hidden?: boolean
  suppressHydrationWarning?: boolean
  dangerouslySetInnerHTML?: unknown
  style?: object & { display?: string }
  bottom?: null | number
  left?: null | number
  right?: null | number
  top?: null | number
}

export const shouldSetTextContent = (type: string, props: Props): boolean => {
  return (
    type === 'textarea' ||
    type === 'option' ||
    type === 'noscript' ||
    typeof props.children === 'string' ||
    typeof props.children === 'number' ||
    (typeof props.dangerouslySetInnerHTML === 'object' &&
      props.dangerouslySetInnerHTML !== null &&
      (props.dangerouslySetInnerHTML as any).__html !== null)
  )
}

export const createInstance = (type: string, props: Props) => {
  const domElement: Element = document.createElement(type)
  //todo
  //updateFiberProps(domElement, props)

  return domElement
}

export const appendInitialChild = (
  parentInstance: Element,
  child: Element | Text
) => {
  parentInstance.appendChild(child)
}
