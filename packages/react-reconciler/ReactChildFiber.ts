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
 * @param shouldTrackSideEffects 是否应该追踪副作用，在首次mount只需要对HostRoot的子节点执行一次Placement操作就行
 * 不需要其他的操做，所以在创建mount的diff函数时设置为false,在update时需要进行增删改所以需要追踪副作用，所以创建
 * 更新时的diff函数设置为true
 * @returns
 */
const ChildReconciler = (shouldTrackSideEffects: boolean) => {
  const placeSingleChild = (newFiber: Fiber): Fiber => {
    if (shouldTrackSideEffects && newFiber.alternate === null) {
      //该逻辑只有首次mount时HostRoot用到了，因为HostRoot的workInProgress，还是current都是始终存在的
      //所以会走在diff其子节点时，会走reconcileChildFibers路线，所以shouldTrackSideEffects会被设置为true
      //且因为是首次mount所以HostRoot的子节点的current节点为空，所以会进入到改逻辑
      //所以它会被打上Placement标签待会会被插入dom树中
      //注意首次mount时只有HostRoot的直接子节点才会进入这个逻辑，其他层级的节点会因为current为空直接进入mountChildFibers
      //逻辑
      newFiber.flags |= Placement
    }

    return newFiber
  }

  /**
   *
   * @param returnFiber diff单个节点，只有type和key都相同的情况下才会复用节点
   * 否则就重新创建
   * @param currentFirstChild
   * @param element
   * @param lanes
   * @returns
   */
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
        if (child.type === element.type) {
          deleteRemainingChildren(returnFiber, child.sibling)
          const existing = useFiber(child, element.props)
          existing.return = returnFiber
          return existing
        }
        //key相同但是type变了，直接停止遍历，把后面的节点都删了
        //直接新建一个
        deleteRemainingChildren(returnFiber, child)
        break
      } else {
        //key不相同把该节点删除
        deleteChild(returnFiber, child)
      }

      //该节点不能复用看看下个节点能不能复用
      child = child.sibling
    }

    //一个都不能复用，直接重新创建一个
    const created = createFiberFromElement(element, returnFiber.mode, lanes)
    created.return = returnFiber
    return created
  }

  /**
   * 删除currentFirstChild，以及他后面的所有节点
   * @param returnFiber
   * @param currentFirstChild 要删除的节点的起始节点
   * @returns
   */
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

  /**
   * 更新一个fiber，如果前后他们的type没有变的话会复用该节点
   * 如果type改变了会创建一个全新节点
   * @param returnFiber
   * @param current
   * @param element
   * @param lanes
   * @returns
   */
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

  /**
   * 更新文本节点
   * @param returnFiber
   * @param current
   * @param textContent
   * @param lanes
   * @returns
   */
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
   * diff函数会根据该函数的返回值进行相关的操做
   * 如果key不相同直接返回null代表可能节点的位置发生了变更，
   * 简单的循环是行不通的所以待会会进入updateFromMap逻辑，
   * 如果是key相同但是type变了就选择不复用，而是选择重新创建一个元素返回
   * 就会将以前同key的元素标记为删除
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

    if (newChild == null) return null

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

    if (newChild == null) return null

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

  /**
   * 创建一个map,将节点和key关联起来
   * 待会就能以O(1)的时间复杂度直接获得key对应的fiber节点
   * @param returnFiber
   * @param currentFirstChild
   * @returns
   */
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
        /**
         * 如果没有显示的设置key，就是用他的index当作key，当然大部分情况下
         * 这种做法并不能正确的复用他之前的节点，比如以下情况，假设更新前后都没有
         * 显式的设置key
         * 更新前: a -> b -> c
         * 更新后: a -> c
         * 在这次更新中将b节点删除，此时构建出来的map就为
         * {
         *   0 -> a,
         *   1 -> b,
         *   2 -> c
         * }
         * 而在处理c是实际获得的复用节点为map.get(1)等于b节点
         * 也就是说本来不用做任何更改的c节点还需要还需要将复用的b节点
         * 的属性更新至和c一致，这就是为什么说显示的设置唯一的key会
         * 提高复用节点正确率的原因，当然上述情况如果更新前后都没有
         * 设置key的话压根不会走进updateFromMap逻辑，在这里这是为了
         * 方便描述原因
         */
        existingChildren.set(existingChild.index, existingChild)
      }

      existingChild = existingChild.sibling
    }

    return existingChildren
  }

  /**
   * 尝试从map中找出新节点能复用的老节点
   * @param existingChildren Map<Key, Fiber>
   * @param returnFiber
   * @param newIdx 如果该新节点没有显式的设置key将会使用他此时的index
   * 在map中查找复用节点
   * @param newChild 新的JSX对象
   * @param lanes
   * @returns
   */
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
        //没有复用该节点，比如下面的情况，同一位置节点前后的key不一致
        //直接break,开始进行下面的updateFromMap流程
        /**
         * {type: 'li', key: 1 }   --->   {type: 'li', key: 2 }
         *                           删除第一个后
         * {type: 'li', key: 2 }
         */
        if (oldFiber === null) {
          oldFiber = nextOldFiber
        }
        break
      }

      if (shouldTrackSideEffects) {
        //只有在update的流程才需要进入该逻辑
        //因为mount时唯一需要进行的操做就是placeChild

        if (oldFiber && newFiber.alternate === null) {
          /**
           * 两个位置的元素是匹配的，但是并没有复用现存的fiber,
           * 所以我们需要把现存的child删掉,新创建的fiber,alternate指向null
           * 如果使用useFiber复用了节点，则newFiber的alternate会指向current
           * fiber节点，比如[<div></div>]
           */
          deleteChild(returnFiber, oldFiber)
        }
      }

      //根据新元素的位置判断他是否需要重新插入dom
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)

      if (!previousNewFiber) {
        //记录下第一个fiber待会将他返回作为接下来workInProgress
        resultingFirstChild = newFiber
      } else {
        //不是第一个fiber，将他接到前一个节点的后面
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
       * 如果没有现存的节点了，我们可以用这种更快的方法，因为剩下的节点都是待插入的
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

    //这些剩余节点都是不能通过简单循环就能获得复用节点的
    //开始updateFromMap逻辑
    const existingChildren = mapRemainingChildren(returnFiber, oldFiber)

    for (; newIdx < newChildren.length; ++newIdx) {
      //从map中尝试为newChildren[i]找到一个合适的复用节点
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
            //考虑以下情况
            /**
             * 更新前: [<div key="1">1<div>, <div key="2">2</div>, <div key="3">3</div>]
             * 更新后: [<div key="3">3</div>, <div key="1">1<div>]
             * 在这次更新中子元素的位置发生了变化，而且2还被删除了
             * 由于第一个newChild进行工作时就会发现，同一位置前后元素
             * 一个key是1一个是3，所以并没有成功复用节点就会直接break进入这里的updateFromMap逻辑
             * 所以会更具current fiber节点构建出以下map
             * {
             *   1 -> <div key="1">1</div>,
             *   2 -> <div key="2">2</div>,
             *   3 -> <div key="3">3</div>,
             * }
             * 由于3节点和1节点都成功被复用,所以都会被从map中删除
             * 所以此时map中还剩下一个2节点，此时就能知道这个2节点
             * 就是没有被复用的废弃节点待会需要将这些废弃节点标记删除
             * 这里也就是将2节点标记删除
             */
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
      //删除没有被复用的废弃节点，只有在update流程中才需要这样做
      existingChildren.forEach((child) => deleteChild(returnFiber, child))
    }

    return resultingFirstChild
  }

  /**
   * diff函数的入口，更具不同子元素类型，进入不同的分支
   * @param returnFiber
   * @param currentFirstChild
   * @param newChild
   * @param lanes
   * @returns
   */
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

  //能走到这里说明，此时此刻workInProgress和current的child时严格相等的
  //所以从workInProgress里读取的child也是currentChild
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
