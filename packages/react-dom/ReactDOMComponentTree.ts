import { Fiber } from '../react-reconciler/ReactInternalTypes'
import { Container } from './ReactDomRoot'

const randomKey = Math.random().toString(36).slice(2)

const internalContainerInstanceKey = '__reactContainer$' + randomKey

/**
 * 将该dom节点标记为容器节点（整个React App挂载在的节点）
 * @param hostRoot 当前fiber树的根节点
 * @param node dom节点
 */
export const markContainerAsRoot = (hostRoot: Fiber, node: Container) => {
  ;(node as any)[internalContainerInstanceKey] = hostRoot
}
