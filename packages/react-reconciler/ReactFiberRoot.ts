import { createHostRootFiber } from './ReactFiber'
import { FiberRoot } from './ReactInternalTypes'
import { RootTag } from './ReactRootTags'
import { initializeUpdateQueue } from './ReactUpdateQueue'

class FiberRootNode {
  constructor(public containerInfo: any, public tag: RootTag) {}
}

/**
 *
 * @param containerInfo 当前创建fiber树所在的dom节点由createRoot方法传入
 * @param tag 决定fiber树是以什么模式创建的(concurrent,blocking)
 * @returns 返回FiberRoot（整个应用的根节点，其中current保存有当前页面所对应的fiber树）
 */
export const createFiberRoot = (
  containerInfo: any,
  tag: RootTag
): FiberRoot => {
  const root: FiberRoot = new FiberRootNode(containerInfo, tag) as any

  const uninitializedFiber = createHostRootFiber(tag)
  root.current = uninitializedFiber
  uninitializedFiber.stateNode = root

  initializeUpdateQueue(uninitializedFiber)

  return root
}
