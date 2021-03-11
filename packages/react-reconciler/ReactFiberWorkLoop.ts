import { createWorkInProgress } from './ReactFiber'
import { beginWork } from './ReactFiberBeginWork'
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

const performUnitOfWork = (unitOfWork: Fiber): void => {
  const current = unitOfWork.alternate

  let next: Fiber | null = null

  next = beginWork(current, unitOfWork)
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

export const performSyncWorkOnRoot = (root: FiberRoot) => {
  const exitStatus = renderRootSync(root)
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
