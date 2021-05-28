import { REACT_ELEMENT_TYPE } from '../shared/ReactSymbols'
import { Key } from '../shared/ReactTypes'

/**
 * JSX对象类型
 */
type ReactElement = {
  /**
   * 该属性的意义[https://overreacted.io/zh-hans/why-do-react-elements-have-typeof-property/]
   */
  $$typeof: Symbol
  /**
   * createElement的第一个参数如果是浏览器标签比如div那么就为一个字符串如果时Function组件那么就为一个函数
   * 如果为React的内置组件类型，比如Fragment,StrictMode，那么就为一个Symbol
   */
  type: any
  /**
   * 该节点的key用来提高dom的复用的正确率
   */
  key: Key | null
  /**
   * 该jsx上的属性比如onClick,value等等
   */
  props: any
}

const hasOwnProperty = Object.prototype.hasOwnProperty

/**
 *  保留属性，以下属性不会加入到props中,比如<div key="1" ref={null} foo={1}></div>
 *  构建出来的jsx对象就是这样的 {key: "1", ref: null, props: {foo: 1}}
 */
const RESERVED_PROPS = {
  key: true,
  ref: true,
}

/**
 * jsx转换为javascript时调用的函数比如`<div><div>`就会被转换为React.createElement('div', null)
 * @param type 该组件的类型，如果时div,p这种浏览器标签就为字符串，如果时Function组件那么就为一个函数
 * @param config 初始props,包含key和ref经过该函数后会将key和ref抽出
 * @param children 该组件的children
 * @returns 返回一个JSX对象
 */
export function createElement(
  type: any,
  config?: Record<string, any>,
  ...children: any[]
): ReactElement {
  const props: Record<string, any> = {}
  let key: Key | null = null

  for (const propName in config) {
    if (
      hasOwnProperty.call(config, propName) &&
      !RESERVED_PROPS.hasOwnProperty(propName)
    ) {
      props[propName] = config[propName]
    }
  }

  if (type?.defaultProps) {
    const defaultProps = type.defaultProps
    for (const propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName]
      }
    }
  }

  if (config?.key !== undefined) {
    key = '' + config?.key
  }

  if (children.length === 1) {
    props.children = children[0]
  } else if (children.length > 1) {
    props.children = children
  }

  const element: ReactElement = {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    props,
  }

  return element
}
