import { REACT_ELEMENT_TYPE } from '../shared/ReactSymbols'
import { ReactElement } from '../shared/ReactTypes'
import {
  createFiberFromElement,
  createFiberFromText,
  createWorkInProgress,
} from './ReactFiber'
import { ChildDeletion, Placement } from './ReactFiberFlags'
import { Lanes } from './ReactFiberLane'
import { Fiber } from './ReactInternalTypes'
import { HostText } from './ReactWorkTags'

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
      if (child.key === key) {
        deleteRemainingChildren(returnFiber, child.sibling)
        const existing = useFiber(child, element.props)
        existing.return = returnFiber
        return existing
      } else {
        deleteChild(returnFiber, child)
      }

      child = child.sibling
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

    let childToDelete = currentFirstChild

    while (childToDelete !== null) {
      deleteChild(returnFiber, childToDelete)
      childToDelete = childToDelete.sibling
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
      const existing = useFiber(current, element.props)
      existing.return = returnFiber
      return existing
    }

    const created = createFiberFromElement(element, returnFiber.mode, lanes)
    created.return = returnFiber

    return created
  }

  const useFiber = (fiber: Fiber, pendingProps: unknown): Fiber => {
    const clone = createWorkInProgress(fiber, pendingProps)
    clone.index = 0
    clone.sibling = null
    return clone
  }

  const updateTextNode = (
    returnFiber: Fiber,
    current: Fiber | null,
    textContent: string,
    lanes: Lanes
  ) => {
    if (current === null || current.tag !== HostText) {
      const created = createFiberFromText(textContent, returnFiber.mode, lanes)
      created.return = returnFiber
      return created
    } else {
      const existing = useFiber(current, textContent)
      existing.return = returnFiber
      return existing
    }
  }

  const updateSlot = (
    returnFiber: Fiber,
    oldFiber: Fiber | null,
    newChild: any,
    lanes: Lanes
  ): Fiber | null => {
    const key = oldFiber ? oldFiber.key : null

    if (typeof newChild === 'number' || typeof newChild === 'string') {
      if (key !== null) {
        throw new Error('Not Implement')
      }

      return updateTextNode(returnFiber, oldFiber, '' + newChild, lanes)
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          if (newChild.key === key) {
            return updateElement(returnFiber, oldFiber, newChild, lanes)
          } else return null
        }
      }
      throw new Error('Not Implement')
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

    const current = newFiber.alternate

    if (current !== null) {
      const oldIndex = current.index
      if (oldIndex < lastPlacedIndex) {
        throw new Error('Not Implement')
      } else {
        return oldIndex
      }
    } else {
      newFiber.flags |= Placement
      return lastPlacedIndex
    }
  }

  const createChild = (
    returnFiber: Fiber,
    newChild: any,
    lanes: Lanes
  ): Fiber | null => {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      const created = createFiberFromText(
        '' + newChild,
        returnFiber.mode,
        lanes
      )

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

  const deleteChild = (returnFiber: Fiber, childToDelete: Fiber): void => {
    if (!shouldTrackSideEffects) {
      return
    }

    const deletions = returnFiber.deletions
    if (deletions === null) {
      returnFiber.deletions = [childToDelete]
      returnFiber.flags |= ChildDeletion
    } else {
      deletions.push(childToDelete)
    }
  }

  const mapRemainingChildren = (
    returnFiber: Fiber,
    currentFirstChild: Fiber
  ): Map<string | number, Fiber> => {
    const existingChildren: Map<string | number, Fiber> = new Map()

    let existingChild: Fiber | null = currentFirstChild

    while (existingChild !== null) {
      if (existingChild.key !== null) {
        existingChildren.set(existingChild.key, existingChild)
      } else {
        existingChildren.set(existingChild.index, existingChild)
      }

      existingChild = existingChild.sibling
    }

    return existingChildren
  }

  const updateFromMap = (
    existingChildren: Map<string | number, Fiber>,
    returnFiber: Fiber,
    newIdx: number,
    newChild: any,
    lanes: Lanes
  ): Fiber | null => {
    if (typeof newChild === 'string' || typeof newChild === 'number') {
      const matchedFiber = existingChildren.get(newIdx) || null

      return updateTextNode(returnFiber, matchedFiber, '' + newChild, lanes)
    }

    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE: {
          const matchedFiber =
            existingChildren.get(
              newChild.key === null ? newIdx : newChild.key
            ) ?? null

          return updateElement(returnFiber, matchedFiber, newChild, lanes)
        }
      }

      throw new Error('Not Implement')
    }

    return null
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

    for (; oldFiber !== null && newIdx < newChildren.length; ++newIdx) {
      if (oldFiber.index > newIdx) {
        throw new Error('Not Implement')
      } else {
        nextOldFiber = oldFiber.sibling
      }

      const newFiber = updateSlot(
        returnFiber,
        oldFiber,
        newChildren[newIdx],
        lanes
      )

      if (newFiber === null) {
        //没有复用该节点，比如下面的情况，前后的key不一致
        /**
         * {type: 'li', key: 1 }                   {type: 'li', key: 2 }
         *                           删除第一个后
         * {type: 'li', key: 2 }
         */
        if (oldFiber === null) {
          oldFiber = nextOldFiber
        }
        break
      }

      if (shouldTrackSideEffects) {
        if (oldFiber && newFiber.alternate === null) {
          /**
           * 两个位置的元素是匹配的，但是并没有复用现存的fiber,
           * 所以我们需要把现存的child删掉
           */
          deleteChild(returnFiber, oldFiber)
        }
      }

      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)

      if (!previousNewFiber) {
        resultingFirstChild = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }

      previousNewFiber = newFiber
      oldFiber = nextOldFiber
    }

    if (newIdx === newChildren.length) {
      //已近到达了new children的末尾，我们可以删除剩余的现存节点
      deleteRemainingChildren(returnFiber, oldFiber)

      return resultingFirstChild
    }

    if (oldFiber === null) {
      /**
       * 如果没有现存的节点了，我们可以一种更快的方法，因为剩下的节点都是待插入的
       */
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

    const existingChildren = mapRemainingChildren(returnFiber, oldFiber)

    for (; newIdx < newChildren.length; ++newIdx) {
      const newFiber = updateFromMap(
        existingChildren,
        returnFiber,
        newIdx,
        newChildren[newIdx],
        lanes
      )

      if (newFiber !== null) {
        if (shouldTrackSideEffects) {
          if (newFiber.alternate !== null) {
            //该节点是可以复用的,我们可以把它从existingChildren删除
            //待会剩下的就是那些要删除的不可复用节点
            existingChildren.delete(
              newFiber.key === null ? newIdx : newFiber.key
            )
          }
        }

        lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)

        if (previousNewFiber === null) {
          resultingFirstChild = newFiber
        } else {
          previousNewFiber.sibling = newFiber
        }
        previousNewFiber = newFiber
      }
    }

    if (shouldTrackSideEffects) {
      existingChildren.forEach((child) => deleteChild(returnFiber, child))
    }

    return resultingFirstChild
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

    if (isArray(newChild)) {
      return reconcileChildrenArray(
        returnFiber,
        currentFirstChild,
        newChild,
        lanes
      )
    }

    if (typeof newChild === 'string' || typeof newChild === 'number') {
      throw new Error('Not Implement')
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
