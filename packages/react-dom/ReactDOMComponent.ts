import { track } from './inputValueTracking'
import { setTextContent } from './setTextContent'

const STYLE = 'style'
const CHILDREN = 'children'

const setInitialDOMProperties = (
  tag: string,
  domElement: Element,
  nextProps: Record<string | number, any>
) => {
  for (const propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) continue

    const nextProp = nextProps[propKey]

    if (propKey === STYLE) {
    } else if (propKey === CHILDREN) {
      if (typeof nextProp === 'string') {
        const canSetTextContent = tag !== 'textarea' || nextProp !== ''

        if (canSetTextContent) {
          setTextContent(domElement, nextProp)
        }
      } else if (typeof nextProp === 'number') {
        setTextContent(domElement, nextProp + '')
      }
    } else if (nextProp !== null) {
      //todo
    }
  }
}

/**
 * 初始化dom属性
 * @param domElement dom元素
 * @param tag dom的tag对应React.createElement的第一个参数
 * @param rawProps 对应了React.createElement的第二个参数（包含children）
 */
export const setInitialProperties = (
  domElement: Element,
  tag: string,
  rawProps: Object
) => {
  setInitialDOMProperties(tag, domElement, rawProps)

  switch (tag) {
    case 'input':
      track(domElement as HTMLInputElement)
      break
    case 'textarea':
    case 'option':
    case 'select':
      throw new Error('Not Implement')
    default:
      break
  }
}

const updateDOMProperties = (domElement: Element, updatePayload: any[]) => {
  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i]
    const propValue = updatePayload[i + 1]

    if (propKey === STYLE) {
      throw new Error('Not Implement')
    } else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue)
    } else {
      throw new Error('Not Implement')
    }
  }
}

export const updateProperties = (
  domElement: Element,
  updatePayload: any[],
  tag: string,
  lastRawProps: Record<string, any> & Object,
  nextRawProps: Record<string, any> & Object
): void => {
  if (
    tag === 'input' &&
    nextRawProps.type === 'radio' &&
    nextRawProps.name != null
  ) {
    throw new Error('Not Implement')
  }

  updateDOMProperties(domElement, updatePayload)

  switch (tag) {
    case 'input':
    case 'textarea':
    case 'select':
      throw new Error('Not Implement')
  }
}
