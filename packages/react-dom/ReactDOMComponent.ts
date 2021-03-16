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
}
