import { REACT_ELEMENT_TYPE } from '../shared/ReactSymbols'
import { ReactElement } from '../shared/ReactTypes'
import { createFiberFromElement } from './ReactFiber'
import { Placement } from './ReactFiberFlags'
import { Fiber } from './ReactInternalTypes'

const isArray = Array.isArray

const ChildReconciler = (shouldTrackSideEffects: boolean) => {
  const placeSingleChild = (newFiber: Fiber): Fiber => {
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      newFiber.flags |= Placement
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

  const reconcileChildrenArray = (
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChildren: any[]
  ): Fiber | null => {
    let resultingFirstChild: Fiber | null = null
    let previousNewFiber: Fiber | null = null

    return null
  }

  const reconcileChildFibers = (
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChild: any
  ): Fiber | null => {
    const isObject = typeof newChild === 'object' && newChild !== null

    debugger
    if (isObject) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          return placeSingleChild(
            reconcileSingleElement(returnFiber, currentFirstChild, newChild)
          )
        }
      }
    }

    if (typeof newChild === 'string') {
    }

    if (isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstChild, newChildren)
    }

    //newChild为空删除现有fiber节点
    return deleteRemainingChildren(returnFiber, currentFirstChild)
  }

  return reconcileChildFibers
}

export const mountChildFibers = ChildReconciler(false)
export const reconcileChildFibers = ChildReconciler(true)
