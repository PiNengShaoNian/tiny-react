import { setInitialProperties } from './ReactDOMComponent'
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

export const insertBefore = (
  parentInstance: Element,
  child: Element,
  beforeChild: Element
): void => {
  parentInstance.insertBefore(child, beforeChild)
}

export const appendChild = (parentInstance: Element, child: Element): void => {
  parentInstance.appendChild(child)
}

const COMMENT_NODE = 8
/**
 * 和appendChild一样，只是多了个判断是否是注释节点
 * @param container React.render第二个参数
 * @param child 要添加的dom
 * @param beforeChild
 */
export const insertInContainerBefore = (
  container: Container,
  child: Element,
  beforeChild: Element
) => {
  if (container.nodeType === COMMENT_NODE) {
    container.parentNode?.insertBefore(child, beforeChild)
  } else {
    container.insertBefore(child, beforeChild)
  }
}

export const appendChildToContainer = (
  container: Container,
  child: Element
): void => {
  let parentNode

  if (container.nodeType === COMMENT_NODE) {
    parentNode = container.parentNode
    parentNode?.insertBefore(child, container)
  } else {
    parentNode = container
    parentNode.appendChild(child)
  }
}

export const finalizeInitialChildren = (
  domElement: Element,
  type: string,
  props: Props
): boolean => {
  setInitialProperties(domElement, type, props)

  //shouldAutoFocusHostComponent
  return false
}

export const createTextInstance = (text: string): Text => {
  const instance = document.createTextNode(text)

  return instance
}
