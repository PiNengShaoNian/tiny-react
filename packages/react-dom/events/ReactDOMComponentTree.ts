import { Fiber } from '../../react-reconciler/ReactInternalTypes'
import { Props } from '../ReactDOMHostConfig'

const randomKey = Math.random().toString(36).slice(2)

const internalPropsKey = '__reactProps$' + randomKey
const internalInstanceKey = '__reactFiber$' + randomKey

export const getFiberCurrentPropsFromNode = (node: Element): Props => {
  return (node as any)[internalPropsKey]
}

export const getClosestInstanceFromNode = (targetNode: Node): Fiber | null => {
  const targetInst = (targetNode as any)[internalInstanceKey]
  return targetInst ?? null
}

export const precacheFiberNode = (hostInst: Fiber, node: Element) => {
  ;(node as any)[internalInstanceKey] = hostInst
}

export const updateFiberProps = (node: Element, props: Props): void => {
  ;(node as any)[internalPropsKey] = props
}
