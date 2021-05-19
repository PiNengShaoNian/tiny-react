const isUnitlessNumber = {
  animationIterationCount: true,
  aspectRatio: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  columns: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridArea: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,

  // SVG-related properties
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true,
}

const dangerousStyleValue = (
  name: string,
  value: unknown,
  isCustomProperty: boolean
): string => {
  const isEmpty = value === null || typeof value === 'boolean' || value === ''

  if (isEmpty) return ''

  if (
    !isCustomProperty &&
    typeof value === 'number' &&
    value !== 0 &&
    !(isUnitlessNumber.hasOwnProperty(name) && (isUnitlessNumber as any)[name])
  ) {
    return value + 'px'
  }

  return ('' + value).trim()
}

export const setValueForStyles = (
  node: HTMLElement,
  styles: Record<string, any>
) => {
  const style = node.style
  for (let styleName in styles) {
    if (!styles.hasOwnProperty(styleName)) continue
    const isCustomProperty = styleName.indexOf('--') === 0

    const styleValue = dangerousStyleValue(
      styleName,
      styles[styleName],
      isCustomProperty
    )

    if (styleName === 'float') {
      styleName = 'cssFloat'
    }

    style[styleName as any] = styleValue
  }
}
