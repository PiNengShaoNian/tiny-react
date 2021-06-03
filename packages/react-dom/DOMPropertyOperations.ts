const reservedProps = new Set([
  'children',
  'dangerouslySetInnerHTML',
  // TODO: This prevents the assignment of defaultValue to regular
  // elements (not just inputs). Now that ReactDOMInput assigns to the
  // defaultValue property -- do we need this?
  'defaultValue',
  'defaultChecked',
  'innerHTML',
  'suppressContentEditableWarning',
  'suppressHydrationWarning',
  'style',
])

const attributeNameMap = new Map([
  ['acceptCharset', 'accept-charset'],
  ['className', 'class'],
  ['htmlFor', 'for'],
  ['httpEquiv', 'http-equiv'],
])

const shouldIgnoreAttribute = (name: string) => {
  if (reservedProps.has(name)) return true

  if (
    name.length > 2 &&
    (name[0] === 'o' || name[0] === 'O') &&
    (name[1] === 'n' || name[1] === 'N')
  ) {
    return true
  }

  return false
}

/**
 * 为dom元素设置属性，比如将className，data-*设置为dom属性
 * @param node 要设置属性的dom
 * @param name 属性的名称
 * @param value 属性的值
 */
export const setValueForProperty = (
  node: Element,
  name: string,
  value: unknown
) => {
  if (shouldIgnoreAttribute(name)) return

  const attributeName = attributeNameMap.get(name) ?? name
  if (value === null) {
    node.removeAttribute(attributeName)
  } else {
    node.setAttribute(attributeName, value + '')
  }
}
