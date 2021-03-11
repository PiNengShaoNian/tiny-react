import { Fiber } from './ReactInternalTypes'
import { ConcurrentRoot, RootTag } from './ReactRootTags'
import {
  BlockingMode,
  ConcurrentMode,
  NoMode,
  TypeOfMode,
} from './ReactTypeOfMode'
import { WorkTag, HostRoot } from './ReactWorkTags'

class FiberNode {
  stateNode: any = null
  updateQueue: unknown
  return: Fiber | null = null
  alternate: Fiber | null = null
  memoizedState: any = null

  constructor(
    public tag: WorkTag,
    public pendingProps: unknown,
    public key: null | string,
    public mode: TypeOfMode
  ) {}
}

/**
 *
 * @param tag 标志着该fiber树是以什么模式创建的
 * @returns 返回一个以HostRoot为tag创建的fiber节点(表示fiber树根节点)
 */
export const createHostRootFiber = (tag: RootTag): Fiber => {
  let mode

  if (tag === ConcurrentRoot) {
    mode = ConcurrentMode | BlockingMode
  } else {
    mode = NoMode
  }

  return new FiberNode(HostRoot, null, null, mode)
}

export const createFiber = (
  tag: WorkTag,
  pendingProps: unknown,
  key: string | null,
  mode: TypeOfMode
) => {
  return new FiberNode(tag, pendingProps, key, mode)
}

/**
 *
 * @param current 更具当前界面上的current fiber节点创建一个新的fiber节点去进行工作
 * @param pendingProps 该fiber节点新的props
 */
export const createWorkInProgress = (
  current: Fiber,
  pendingProps: any
): Fiber => {
  let workInProgress = current.alternate

  if (workInProgress === null) {
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode
    )

    workInProgress.stateNode = current.stateNode

    workInProgress.alternate = current
    current.alternate = workInProgress
  }

  workInProgress.updateQueue = current.updateQueue

  return workInProgress
}
