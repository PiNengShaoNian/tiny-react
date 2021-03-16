import { createWorkInProgress } from './ReactFiber'
import { beginWork } from './ReactFiberBeginWork'
import {
  commitBeforeMutationEffects,
  commitLayoutEffects,
  commitMutationEffects,
} from './ReactFiberCommitWork'
import { completeWork } from './ReactFiberCompleteWork'
import { MutationMask, NoFlags } from './ReactFiberFlags'
import { Fiber, FiberRoot } from './ReactInternalTypes'
import { HostRoot } from './ReactWorkTags'

/**
 * 当前在构建应用的root
 */
let workInProgressRoot: FiberRoot | null = null

/**
 * 当前正在进行工作的fiber节点
 */
let workInProgress: Fiber | null = null

const completeUnitOfWork = (unitOfWork: Fiber): void => {
  let completedWork: Fiber | null = unitOfWork

  do {
    const current = completedWork.alternate

    const returnFiber: Fiber | null = completedWork.return

    let next = completeWork(current, completedWork)

    // if (next !== null) {
    //   //// Something suspended. Re-render with the fallback children.
    //   workInProgress = next
    //   return
    // }

    const siblingFiber = completedWork.sibling

    //由于是前序遍历，当一个节点的"归阶段"完成后立马进入其下一个兄弟节点的递阶段
    if (siblingFiber !== null) {
      workInProgress = siblingFiber
      return
    }

    //returnFiber的所有子节点都完成递和归阶段，接下来到returnFiber的归阶段了
    completedWork = returnFiber
    workInProgress = completedWork
  } while (completedWork !== null)
}

const performUnitOfWork = (unitOfWork: Fiber): void => {
  const current = unitOfWork.alternate

  let next: Fiber | null = null

  //创建或者reconcile unitOfWork.child并将其返回
  next = beginWork(current, unitOfWork)

  //进行的时前序遍历，next为null说明该节点没有子节点了，对其进行归过程
  if (next === null) {
    //todo completeUnitofWork
    completeUnitOfWork(unitOfWork)
  } else {
    //将workInProgress赋值为unitOfWork的第一个子节点
    workInProgress = next
  }
}

/**
 *
 * @param root 新一轮更新的FiberRoot
 */
const prepareFreshStack = (root: FiberRoot) => {
  workInProgressRoot = root
  //创建workInProgress的HostRoot其props为null
  workInProgress = createWorkInProgress(root.current, null)
}

const renderRootSync = (root: FiberRoot) => {
  //如果根节点改变调用prepareFreshStack重置参数

  if (workInProgressRoot !== root) {
    prepareFreshStack(root)
  }

  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}

const commitRootImpl = (root: FiberRoot): null => {
  const finishedWork = root.finishedWork

  if (finishedWork === null) return null

  root.finishedWork = null

  workInProgressRoot = null
  workInProgress = null

  const subtreeHasEffects =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags

  if (rootHasEffect || subtreeHasEffects) {
    commitBeforeMutationEffects(root, finishedWork)

    commitMutationEffects(root, finishedWork)

    root.current = finishedWork

    commitLayoutEffects(finishedWork, root)
  } else {
    root.current = finishedWork
  }

  return null
}

const commitRoot = (root: FiberRoot): null => {
  commitRootImpl(root)
  return null
}

export const performSyncWorkOnRoot = (root: FiberRoot) => {
  const exitStatus = renderRootSync(root)

  const finishedWork: Fiber | null = root.current.alternate

  root.finishedWork = finishedWork

  commitRoot(root)
}

/**
 * 调度fiber节点上的更新
 *
 * @param fiber 当前产生更新的fiber节点
 * @returns 产生更新fiber树的FiberRoot(注意不是rootFiber)
 */
export const scheduleUpdateOnFiber = (fiber: Fiber): FiberRoot | null => {
  let node: Fiber = fiber
  let parent: Fiber | null = node.return

  while (parent) {
    //不断向上遍历，当node为HostRoot类型时会跳出循环
    node = parent
    parent = parent.return
  }

  if (node.tag !== HostRoot) {
    return null
  }

  const root = node.stateNode

  performSyncWorkOnRoot(root)

  return root
}
