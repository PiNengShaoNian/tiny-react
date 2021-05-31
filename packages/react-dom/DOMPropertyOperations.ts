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
  if (name === 'className') {
    /**
     * 将className设置为dom的class属性
     */
    node.setAttribute('class', value + '')
  } else if (name.startsWith('on')) {
    /**
     * 以on开头假设他是一个事件属性
     * 忽略掉ReactDOM中使用的事件属性
     */
  } else {
    throw new Error('Not Implement')
  }
}
