type ValueTracker = {
  getValue(): string
  setValue(value: string): void
  stopTracking(): void
}
type WrapperState = { _valueTracker?: ValueTracker }
type ElementWithValueTracker = HTMLInputElement & WrapperState

const getTracker = (
  node: ElementWithValueTracker
): ValueTracker | undefined => {
  return node._valueTracker
}

const isCheckable = (elem: HTMLInputElement) => {
  const type = elem.type

  const nodeName = elem.nodeName

  return (
    nodeName &&
    nodeName.toLowerCase() === 'input' &&
    (type === 'checkbox' || type === 'radio')
  )
}

const detachTracker = (node: ElementWithValueTracker): void => {
  node._valueTracker = undefined
}

const trackValueOnNode = (node: any): ValueTracker | undefined => {
  const valueField = isCheckable(node) ? 'checked' : 'value'

  const descriptor = Object.getOwnPropertyDescriptor(
    node.constructor.prototype,
    valueField
  )

  let currentValue = '' + node[valueField]

  if (!descriptor) return

  const { get, set } = descriptor

  Object.defineProperty(node, valueField, {
    configurable: true,
    get() {
      return get?.call(this)
    },
    set(value) {
      currentValue = '' + value
      set?.call(this, value)
    },
  })

  const tracker: ValueTracker = {
    getValue() {
      return currentValue
    },
    setValue(value) {
      currentValue = '' + value
    },
    stopTracking() {
      detachTracker(node)
      delete node[valueField]
    },
  }

  return tracker
}

export const track = (node: ElementWithValueTracker) => {
  if (getTracker(node)) return

  node._valueTracker = trackValueOnNode(node)
}

const getValueFromNode = (node: HTMLInputElement): string => {
  let value = ''
  if (!node) {
    return value
  }

  if (isCheckable(node)) value = node.checked ? 'true' : 'false'
  else {
    value = node.value
  }

  return value
}

export const updateValueIfChanged = (
  node: ElementWithValueTracker
): boolean => {
  if (!node) return false

  const tracker = getTracker(node)

  //如果到这个时刻还没有tracker,如果此时不更新，那么以后也不太可能会正常更新了
  if (!tracker) return true

  const lastValue = tracker.getValue()
  const nextValue = getValueFromNode(node)
  if (nextValue !== lastValue) {
    tracker.setValue(nextValue)
    return true
  }

  return false
}
