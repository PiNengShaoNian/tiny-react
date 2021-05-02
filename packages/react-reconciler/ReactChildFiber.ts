import { REACT_ELEMENT_TYPE } from '../shared/ReactSymbols'
import { ReactElement } from '../shared/ReactTypes'
import {
  createFiberFromElement,
  createFiberFromText,
  createWorkInProgress,
} from './ReactFiber'
import { Placement } from './ReactFiberFlags'
import { Lanes } from './ReactFiberLane'
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
    element: ReactElement,
    lanes: Lanes
  ): Fiber => {
    const key = element.key
    let child = currentFirstChild

    while (child !== null) {
      //todo current存在子节点
    }

    const created = createFiberFromElement(element, returnFiber.mode, lanes)
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

  const updateElement = (
    returnFiber: Fiber,
    current: Fiber | null,
    element: ReactElement,
    lanes: Lanes
  ): Fiber => {
    if (current !== null) {
      //todo
      throw new Error('Not Implement')
    }

    const created = createFiberFromElement(element, returnFiber.mode, lanes)
    created.return = returnFiber

    return created
  }

  const updateSlot = (
    returnFiber: Fiber,
    oldFiber: Fiber | null,
    newChild: any,
    lanes: Lanes
  ): Fiber | null => {
    const key = oldFiber ? oldFiber.key : null

    if (typeof newChild === 'number' || typeof newChild === 'string') {
      return null
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          if (newChild.key === key) {
            return updateElement(returnFiber, oldFiber, newChild, lanes)
          } else return null
        }
      }
    }

    throw new Error('Invalid Object type')
  }

  const placeChild = (
    newFiber: Fiber,
    lastPlacedIndex: number,
    newIndex: number
  ): number => {
    newFiber.index = newIndex

    if (!shouldTrackSideEffects) return lastPlacedIndex

    throw new Error('Not Implement')
  }

  const createChild = (
    returnFiber: Fiber,
    newChild: any,
    lanes: Lanes
  ): Fiber | null => {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      const created = createFiberFromText('' + newChild, returnFiber.mode)

      created.return = returnFiber

      return created
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const created = createFiberFromElement(
            newChild,
            returnFiber.mode,
            lanes
          )

          created.return = returnFiber
          return created
        }
      }
    }

    throw new Error('Not Implement')
  }

  const reconcileChildrenArray = (
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChildren: any[],
    lanes: Lanes
  ): Fiber | null => {
    let resultingFirstChild: Fiber | null = null
    let previousNewFiber: Fiber | null = null

    let oldFiber: Fiber | null = currentFirstChild
    let lastPlacedIndex = 0
    let newIdx = 0
    let nextOldFiber = null

    // for (; oldFiber !== null && newIdx < newChildren.length; ++newIdx) {
    //   nextOldFiber = oldFiber.sibling
    //   const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx])

    //   if (newFiber === null) {
    //     break
    //   }

    //   if (shouldTrackSideEffects) {
    //   }

    //   lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)

    //   if (previousNewFiber === null) {
    //     resultingFirstChild = newFiber
    //   } else {
    //     previousNewFiber.sibling = newFiber
    //   }

    //   previousNewFiber = newFiber
    //   oldFiber = nextOldFiber
    // }
    // if (newIdx === newChildren.length) {
    //   deleteRemainingChildren(returnFiber, oldFiber)
    //   return resultingFirstChild
    // }

    if (oldFiber === null) {
      for (; newIdx < newChildren.length; ++newIdx) {
        const newFiber = createChild(returnFiber, newChildren[newIdx], lanes)
        if (newFiber === null) continue

        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)
        if (previousNewFiber === null) {
          resultingFirstChild = newFiber
        } else {
          previousNewFiber.sibling = newFiber
        }

        previousNewFiber = newFiber
      }

      return resultingFirstChild
    }

    throw new Error('Not Implement')
  }

  const reconcileChildFibers = (
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChild: any,
    lanes: Lanes
  ): Fiber | null => {
    const isObject = typeof newChild === 'object' && newChild !== null

    if (isObject) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          return placeSingleChild(
            reconcileSingleElement(
              returnFiber,
              currentFirstChild,
              newChild,
              lanes
            )
          )
        }
      }
    }

    if (typeof newChild === 'string') {
    }

    if (isArray(newChild)) {
      return reconcileChildrenArray(
        returnFiber,
        currentFirstChild,
        newChild,
        lanes
      )
    }

    //newChild为空删除现有fiber节点
    return deleteRemainingChildren(returnFiber, currentFirstChild)
  }

  return reconcileChildFibers
}

export const cloneChildFibers = (
  current: Fiber | null,
  workInProgress: Fiber
): void => {
  if (workInProgress.child === null) return

  let currentChild = workInProgress.child
  let newChild = createWorkInProgress(currentChild, currentChild.pendingProps)
  workInProgress.child = newChild

  newChild.return = workInProgress

  while (currentChild.sibling !== null) {
    currentChild = currentChild.sibling
    newChild = newChild.sibling = createWorkInProgress(
      currentChild,
      currentChild.pendingProps
    )
    newChild.return = workInProgress
  }

  newChild.sibling = null
}

export const mountChildFibers = ChildReconciler(false)
export const reconcileChildFibers = ChildReconciler(true)
