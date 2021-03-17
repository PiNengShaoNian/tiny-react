import {
  createContainer,
  updateContainer,
} from '../react-reconciler/ReactFiberReconciler'
import { FiberRoot } from '../react-reconciler/ReactInternalTypes'
import { ConcurrentRoot } from '../react-reconciler/ReactRootTags'
import { ReactNodeList } from '../shared/ReactTypes'
import { listenToAllSupportedEvents } from './events/DOMPluginEventSystem'
import { COMMENT_NODE } from './shared/HTMLNodeType'

export type Container =
  | (Element & { _reactRootContainer?: RootType })
  | (Document & { _reactRootContainer?: RootType })

export type RootType = {
  render(children: ReactNodeList): void
  unmount(): void
  _internalRoot: FiberRoot
}

/**
 * createRoot创建节点是使用的类（ConcurrentRoot）
 */
class ReactDomRoot {
  _internalRoot: FiberRoot
  constructor(container: Container) {
    const root = createContainer(container, ConcurrentRoot)
    this._internalRoot = root
    const rootContainerElement: Node =
      container.nodeType === COMMENT_NODE ? container.parentNode! : container

    //在container上初始化事件系统
    listenToAllSupportedEvents(rootContainerElement)
  }

  render(children: ReactNodeList) {
    const root = this._internalRoot

    updateContainer(children, root)
  }
}

export const createRoot = (container: Container) => {
  return new ReactDomRoot(container)
}
