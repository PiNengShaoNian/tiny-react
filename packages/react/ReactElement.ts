import { REACT_ELEMENT_TYPE } from '../shared/ReactSymbols'
import { Key } from '../shared/ReactTypes'

class ReactElement<P = any, T = any> {
  $$typeof: symbol = REACT_ELEMENT_TYPE
  constructor(public type: T, public key: Key | null = null, public props: P) {}
}

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
  const key: Key | null = config?.key ?? null

  for (const propName in config) {
    if (
      config.hasOwnProperty(propName) &&
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

  if (children.length === 1) {
    props.children = children[0]
  } else if (children.length > 1) {
    props.children = children
  }

  return new ReactElement(type, key, props)
}
