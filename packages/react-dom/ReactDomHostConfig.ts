import { DefaultEventPriority } from '../react-reconciler/ReactEventPriorities'
import { Lane } from '../react-reconciler/ReactFiberLane'
import { Fiber } from '../react-reconciler/ReactInternalTypes'
import { registrationNameDependencies } from './events/EventRegistry'
import {
  precacheFiberNode,
  updateFiberProps,
} from './events/ReactDOMComponentTree'
import { setInitialProperties, updateProperties } from './ReactDOMComponent'
import { Container } from './ReactDomRoot'
import { setTextContent } from './setTextContent'

const STYLE = 'style'
const CHILDREN = 'children'

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

export type UpdatePayload = unknown[]

export type Type = string

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

export const createInstance = (
  type: string,
  props: Props,
  internalInstanceHandle: Fiber
) => {
  const domElement: Element = document.createElement(type)
  //todo
  //updateFiberProps(domElement, props)

  precacheFiberNode(internalInstanceHandle, domElement)
  updateFiberProps(domElement, props)

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

export const scheduleMicrotask = queueMicrotask

const diffProperties = (
  domElement: Element,
  tag: string,
  lastRawProps: Record<string, any>,
  nextRawProps: Record<string, any>
): null | Array<unknown> => {
  let updatePayload: null | any[] = []

  let lastProps: Record<string, any>
  let nextProps: Record<string, any>

  switch (tag) {
    case 'input':
    case 'option':
    case 'select':
    case 'textarea':
      throw new Error('Not Implement')
    default: {
      lastProps = lastRawProps
      nextProps = nextRawProps
    }
  }

  let propKey
  let styleName
  let styleUpdates = null

  for (propKey in lastProps) {
    //该循环只处理被删除的prop
    if (
      nextProps.hasOwnProperty(propKey) ||
      (!lastProps.hasOwnProperty(propKey) && lastProps[propKey] == null)
    ) {
      continue
    }

    const nextProp = nextProps[propKey]
    if (propKey === STYLE) {
      throw new Error('Not Implement')
    } else if (propKey === CHILDREN) {
    } else {
      ;(updatePayload = updatePayload || []).push(propKey, null)
    }
  }

  for (propKey in nextProps) {
    const nextProp = nextProps[propKey]
    const lastProp = lastProps !== null ? lastProps[propKey] : undefined

    if (
      !nextProps.hasOwnProperty(propKey) ||
      nextProp === lastProp ||
      (nextProp === null && lastProp === null)
    ) {
      continue
    }

    if (propKey === STYLE) {
      throw new Error('Not Implement')
    } else if (registrationNameDependencies.hasOwnProperty(propKey)) {
      if (!updatePayload) updatePayload = []
    } else if (propKey === CHILDREN) {
      if (typeof nextProp === 'string' || typeof nextProp === 'number') {
        ;(updatePayload = updatePayload || []).push(propKey, '' + nextProp)
      }
    } else {
      ;(updatePayload = updatePayload || []).push(propKey, nextProp)
    }
  }

  return updatePayload
}

export const prepareUpdate = (
  domElement: Element,
  type: string,
  oldProps: Props,
  newProps: Props
): null | unknown[] => {
  return diffProperties(domElement, type, oldProps, newProps)
}

export const commitTextUpdate = (
  textInstance: Text,
  oldText: string,
  newText: string
): void => {
  textInstance.nodeValue = newText
}

export const commitUpdate = (
  domElement: Element,
  updatePayload: unknown[],
  type: string,
  oldProps: Props,
  newProps: Props,
  internalInstanceHandle: Object
): void => {
  updateFiberProps(domElement, newProps)
  updateProperties(domElement, updatePayload, type, oldProps, newProps)
}

export const getCurrentEventPriority = (): Lane => {
  const currentEvent = window.event
  if (currentEvent === undefined) {
    return DefaultEventPriority
  }
  throw new Error('Not Implement')
}
