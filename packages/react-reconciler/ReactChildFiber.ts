import { REACT_ELEMENT_TYPE } from '../shared/ReactSymbols'
import { ReactElement } from '../shared/ReactTypes'
import { createFiberFromElement } from './ReactFiber'
import { Fiber } from './ReactInternalTypes'

const ChildReconciler = (shouldTrackSideEffects: boolean) => {
  const placeSingleChild = (newFiber: Fiber): Fiber => {
    if (shouldTrackSideEffects && newFiber.alternate === null) {
    }

    return newFiber
  }

  const reconcileSingleElement = (
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    element: ReactElement
  ): Fiber => {
    const key = element.key
    let child = currentFirstChild

    while (child !== null) {
      //todo current存在子节点
    }

    const created = createFiberFromElement(element, returnFiber.mode)
    created.return = returnFiber
    return created
  }

  const deleteRemainingChildren = (
    returnFiber: Fiber,
    currentFirstChild: Fiber | null
  ): null => {
    //当初次mount的时候shouldTrackSideEffects为false
    if (!shouldTrackSideEffects) {
      return null
    }

    return null
  }

  const reconcileChildFibers = (
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChild: any
  ): Fiber | null => {
    const isObject = typeof newChild === 'object' && newChild !== null

    if (isObject) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChild)
          )
        }
      }
    }

    //当一个returnFiber节点的children为空，则删除returnFiber的所有子节点
    if (typeof newChild === 'undefined') {
      return deleteRemainingChildren(returnFiber, currentFirstChild)
    }

    throw new Error('Not Implment')
  }

  return reconcileChildFibers
}

export const mountChildFibers = ChildReconciler(false)
