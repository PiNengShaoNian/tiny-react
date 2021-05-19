type InputWithWrapperState = HTMLInputElement & {
  _wrapperState: {
    initialValue: unknown
    initialChecked?: boolean
    controlled?: boolean
  }
}

export const getHostProps = (element: Element, props: Object) => {
  const node = element as InputWithWrapperState
  const checked = (props as any).checked
  const hostProps = Object.assign({}, props, {
    defaultChecked: undefined,
    defaultValue: undefined,
    value: undefined,
    checked: checked != null ? checked : node._wrapperState.initialChecked,
  })

  return hostProps
}

type ToStringValue = boolean | number | Object | string | null | void

export function getToStringValue(value: unknown): ToStringValue {
  switch (typeof value) {
    case 'boolean':
    case 'number':
    case 'object':
    case 'string':
    case 'undefined':
      return value
    default:
      // function, symbol are assigned as empty strings
      return ''
  }
}

function isControlled(props: Record<string, any>) {
  const usesChecked = props.type === 'checkbox' || props.type === 'radio'
  return usesChecked ? props.checked != null : props.value != null
}

export const initWrapperState = (
  element: Element,
  props: Record<string, any>
) => {
  let node: InputWithWrapperState = element as any
  const defaultValue =
    (props as any).defaultValue == null ? '' : (props as any).defaultValue
  node._wrapperState = {
    initialChecked:
      props.checked != null ? props.checked : props.defaultChecked,
    initialValue: getToStringValue(
      props.value != null ? props.value : defaultValue
    ),
    controlled: isControlled(props),
  }
}

export const postMountWrapper = (
  element: Element,
  props: Record<string, any>
) => {
  const node: InputWithWrapperState = element as any

  if (props.hasOwnProperty('value') || props.hasOwnProperty('defaultValue')) {
    const initialValue = node._wrapperState.initialValue + ''

    if (initialValue !== node.value) {
      node.value = initialValue
    }

    node.defaultValue = initialValue
    node.defaultChecked = !!node._wrapperState.initialChecked
  }
}

export const updateChecked = (element: Element, props: Record<string, any>) => {
  const node: InputWithWrapperState = element as any
  const checked = props.checked
  if (checked != null) {
    node.setAttribute('checked', checked + '')
  }
}

export const updateWrapper = (element: Element, props: Record<string, any>) => {
  const node: InputWithWrapperState = element as any

  updateChecked(element, props)

  const value = getToStringValue(props.value)

  if (value != null) {
    node.value = value + ''
  }

  if (props.hasOwnProperty('value')) {
    node.defaultValue = value + ''
  } else if (props.hasOwnProperty('defaultValue')) {
    node.defaultValue = props.defaultValue + ''
  }
}
