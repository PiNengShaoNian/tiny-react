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

/**
 * diff函数的创建函数
 * @param shouldTrackSideEffects 返回的diff函数是在何时使用的
 * false时为mount时使用true时为update时使用
 * @returns
 */
const ChildReconciler = (shouldTrackSideEffects: boolean) => {
  const placeSingleChild = (newFiber: Fiber): Fiber => {
    //mount时，为其打上Placement标签待会会把它插入到dom树中
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
      if (current.type === element.type) {
        const existing = useFiber(current, element.props)
        existing.return = returnFiber
        return existing
      }
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

  /**
   * 判断该对应位置的fiber是否可以复用
   * 只有type相同且key也相同的情况下才会复用
   * @param returnFiber
   * @param oldFiber 对应位置的fiber节点
   * @param newChild 对应位置的jsx对象
   * @param lanes
   * @returns
   */
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

  /**
   *
   * @param newFiber 当前要摆放的节点
   * @param lastPlacedIndex 当前节点的前一个节点，在更新前所处的index
   * 如果是首次mount则 lastPlacedIndex没有意义，该值主要用来判断该节点在这次更新后
   * 是不是原来在他后面的节点，现在跑到他前面了如果是他就是需要重新插入dom树的
   * 那么怎么判断他后面的节点是不是跑到他前面了呢，考虑以下情况
   * 更新前: 1 -> 2 -> 3 -> 4
   * 更新后: 1 -> 3 -> 2 -> 4
   * 在处理该次更新时，当遍历到2时，此时lastPlacedIndex为2，而2的oldIndex为1
   * 所以可以判断到newFiber.oldIndex小于lastPlacedIndex，也就意味着他前面的元素之前是在他后面的
   * 但是现在跑到他前面了，所以newFiber也就是2是需要重新插入dom树的
   * 在commit阶段时，对2相应的dom进行重新插入时，
   * 会寻找他后面第一个不需要进行插入操作的dom元素作为insertBefore
   * 的第二个参数，所以2对应的dom会被插入到4前面
   * @param newIndex 当前要摆放的节点,在此次更新中的index
   * @returns lastPlacedIndex的新值，结合上面的逻辑自行理解
   */
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

      //更新前有以下数组元素1->2
      //更新后他们的位置交换变为2 -> 1
      //这时1元素的oldIndex(0)会小于lastPlacedIndex(和前一轮2元素的index相同也就是1)
      //这是意味着1元素的位置需要改变了，所以将他打上Placement标签，待会会将它重新插入dom树
      if (oldIndex < lastPlacedIndex) {
        newFiber.flags |= Placement
        return lastPlacedIndex
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

  /**
   * 要删除一个节点时，会将它加入到在父节点的deletions数组中
   * 并且将其父节点打上ChildDeletion标签
   * @param returnFiber 要删除节点的父节点
   * @param childToDelete 要删除的节点
   * @returns
   */
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

/**
 * 在一个节点没有更新，但子组件有工作的情况下
 * 会调用该函数克隆该节点的子节点，注意该函数在调用
 * createWorkInProgress传入的第二个参数props是current props,
 * 所以当进行子节点的beginWork阶段时他的oldProps，newProps是相等的
 * 如果在发现子节点不存在lanes的话子节点也会进入bailoutOnAlreadyFinishedWork逻辑
 * 不过还是不能全部靠这种优化来减少render的工作量，这种优化有雪崩效应，一旦一个fiber节点有更新
 * 那他所在的子树全都得走一遍render流程，所以必要时还是得用上memo这种手动优化手段，对每个props的
 * 属性进行浅比较,再决定是否真的收到更新
 * @param current
 * @param workInProgress
 * @returns
 */
export const cloneChildFibers = (
  current: Fiber | null,
  workInProgress: Fiber
): void => {
  if (workInProgress.child === null) return

  let currentChild = workInProgress.child
  let newChild = createWorkInProgress(currentChild, currentChild.pendingProps)
  workInProgress.child = newChild

  newChild.return = workInProgress

  /**
   * 只复制一层，也就是只复制子节点，其他的不管
   */
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
