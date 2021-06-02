/**
 * 已经通过验证过的属性的缓存
 */
const validatedAttributeNameCache: Record<string, boolean> = {}
/**
 * 没有通过验证的属性的缓存
 */
const illegalAttributeNameCache: Record<string, boolean> = {}

const hasOwnProperty = Object.prototype.hasOwnProperty

export const ATTRIBUTE_NAME_START_CHAR =
  ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD'
/* eslint-enable max-len */
export const ATTRIBUTE_NAME_CHAR =
  ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040'

export const ROOT_ATTRIBUTE_NAME = 'data-reactroot'
export const VALID_ATTRIBUTE_NAME_REGEX = new RegExp(
  '^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$'
)

const isAttributeNameSafe = (attributeName: string): boolean => {
  if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) {
    return true
  }

  if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) {
    return false
  }

  if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
    validatedAttributeNameCache[attributeName] = true
    return true
  }

  illegalAttributeNameCache[attributeName] = true
  return false
}

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

  if (isAttributeNameSafe(name)) {
    const attributeName = name
    if (value === null) {
      node.removeAttribute(attributeName)
    } else {
      node.setAttribute(attributeName, value + '')
    }
  }
}
