import { DefaultEventPriority } from '../react-reconciler/ReactEventPriorities'
import { Lane } from '../react-reconciler/ReactFiberLane'
import { Fiber } from '../react-reconciler/ReactInternalTypes'
import { registrationNameDependencies } from './events/EventRegistry'
import {
  precacheFiberNode,
  updateFiberProps,
} from './events/ReactDOMComponentTree'
import { getEventPriority } from './events/ReactDOMEventListener'
import { setInitialProperties, updateProperties } from './ReactDOMComponent'
import { Container } from './ReactDomRoot'
import { getHostProps as ReactDOMInputGetHostProps } from './ReactDOMInput'
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

/**
 * 判断该节点是否可以直接将children当作直接文本节点处理
 * 比如节点的类型为textarea时，或者children的类型为string或者number
 * @param type 
 * @param props 
 * @returns 
 */
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

/**
 * 在首次mount时，为HostComponent初始化属性
 * @param domElement 要初始化的dom
 * @param type
 * @param props 新的props
 * @returns
 */
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
      lastProps = ReactDOMInputGetHostProps(domElement, lastRawProps)
      nextProps = ReactDOMInputGetHostProps(domElement, nextRawProps)
      updatePayload = []
      break
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
  let styleUpdates: Record<string, any> | null = null

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
    //该循环会处理增加和被修改的属性
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
      if (lastProp) {
        for (styleName in lastProp) {
          //处理删除的style
          if (
            lastProp.hasOwnProperty(styleName) &&
            (!nextProp || !nextProp.hasOwnProperty(styleName))
          ) {
            if (!styleUpdates) {
              styleUpdates = {}
            }
            styleUpdates[styleName] = ''
          }
        }

        //处理新增或者更新的style
        for (styleName in nextProp) {
          if (
            nextProp.hasOwnProperty(styleName) &&
            lastProp[styleName] !== nextProp[styleName]
          ) {
            if (!styleUpdates) {
              styleUpdates = {}
            }
            styleUpdates[styleName] = nextProp[styleName]
          }
        }
      } else {
        if (!styleUpdates) {
          if (!updatePayload) {
            updatePayload = []
          }
          updatePayload.push(propKey, styleUpdates)
        }
        styleUpdates = nextProp
      }
    } else if (registrationNameDependencies.hasOwnProperty(propKey)) {
      if (!updatePayload) updatePayload = []
    } else if (propKey === CHILDREN) {
      //这里是直接文本节点能正常更新的关键，因为他们没有对应的fiber节点
      //所以不能靠打上Update标签这种形式去更新他自身的文本，他只能在
      //父节点的updateQueue(也就是这的updatePayload)中加上 children属性
      //待会该节点会更具updateQueue中children的新内容重新设置文本
      if (typeof nextProp === 'string' || typeof nextProp === 'number') {
        ;(updatePayload = updatePayload || []).push(propKey, '' + nextProp)
      }
    } else {
      ;(updatePayload = updatePayload || []).push(propKey, nextProp)
    }
  }

  if (styleUpdates) {
    ;(updatePayload = updatePayload || []).push(STYLE, styleUpdates)
  }

  return updatePayload
}


/**
 * 会返回类似这样的一个数组 ['style', {background: 'red'}, 'children', 'newText']
 * 2n存储属性名，2n+1存储新的属性值
 * 该数组里面的属性都是dom真正拥有的属性，
 * 如果是类似于onClick这种react事件不会在数组中添加相关的属性，只会返回一个空数组
 * 待会更新的时候会判断到updateQueue不为null所以会进行该节点的更新流程
 * onClick的handler会通过updateFiberProps得到更新
 * @param domElement 
 * @param type 
 * @param oldProps 
 * @param newProps 
 * @returns 
 */
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
  /**
   * 更新fiber属性，ReactDOM事件系统能正常工作的关键
   * 比如如下代码
   * const Foo = () => {
   *   const [count, setCount] = useState(0)
   *
   *   return <div onClick={() => {
   *              setCount(count + 1)
   *           }}>{count}</div>
   * }
   * 如果不更新props的话，ReactDOM中事件机制执行时
   * 从dom对应fiber提取到的onClick事件的handler将永远是首次mount时
   * 的handler，这意味着他闭包中捕获到的count值永远都是0,所以不管你点击多少次div
   * 他都等价于setCount(0 + 1),所以会导致不能正常更新
   * 而调用了下面的updateFiberProps就不一样了，每次更新后handler里面闭包捕获到的count
   * 都是最新值所以能正常更新
   */
  updateFiberProps(domElement, newProps)
  updateProperties(domElement, updatePayload, type, oldProps, newProps)
}

/**
 * 更具当前的事件返回对应的优先级
 * @returns
 */
export const getCurrentEventPriority = (): Lane => {
  const currentEvent = window.event
  if (currentEvent === undefined) {
    return DefaultEventPriority
  }

  return getEventPriority(currentEvent.type as any)
}

export const removeChild = (
  parentInstance: HTMLElement,
  child: HTMLElement | Text
) => {
  parentInstance.removeChild(child)
}

export const resetTextContent = (domElement: Element): void => {
  setTextContent(domElement, '')
}
