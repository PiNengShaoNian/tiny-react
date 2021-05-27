import { REACT_ELEMENT_TYPE } from '../shared/ReactSymbols'
import { Key } from '../shared/ReactTypes'

type ReactElement = {
  $$typeof: Symbol
  type: any
  key: Key | null
  props: any
}

const hasOwnProperty = Object.prototype.hasOwnProperty

const RESERVED_PROPS = {
  key: true,
  ref: true,
}

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
