export const setValueForProperty = (
  node: Element,
  name: string,
  value: unknown
) => {
  if (name === 'className') {
    node.setAttribute('class', value + '')
  } else if (name.startsWith('on')) {
  } else {
    throw new Error('Not Implement')
  }
}
