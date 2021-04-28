import {
  createContainer,
  updateContainer,
} from '../react-reconciler/ReactFiberReconciler'
import { FiberRoot } from '../react-reconciler/ReactInternalTypes'
import {
  ConcurrentRoot,
  LegacyRoot,
  RootTag,
} from '../react-reconciler/ReactRootTags'
import { ReactNodeList } from '../shared/ReactTypes'
import { listenToAllSupportedEvents } from './events/DOMPluginEventSystem'
import { markContainerAsRoot } from './ReactDOMComponentTree'
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
 * createRoot创建节点时使用的类（ConcurrentRoot）
 */
class ReactDomRoot {
  _internalRoot: FiberRoot
  constructor(container: Container) {
    this._internalRoot = createRootImpl(container, ConcurrentRoot)
  }

  render(children: ReactNodeList): void {}

  unmount() {}
}

/**
 * ReactDOM.render创建FiberRoot的时使用的类
 */
class ReactDOMLegacyRoot {
  _internalRoot: FiberRoot
  constructor(container: Container) {
    this._internalRoot = createRootImpl(container, LegacyRoot)
  }

  unmount() {}

  render(children: ReactNodeList): void {}
}

ReactDomRoot.prototype.render = ReactDOMLegacyRoot.prototype.render = function (
  children: ReactNodeList
) {
  const root = this._internalRoot

  updateContainer(children, root)
}

export const createRoot = (container: Container) => {
  return new ReactDomRoot(container)
}

const createRootImpl = (container: Container, tag: RootTag): FiberRoot => {
  const root = createContainer(container, tag)
  markContainerAsRoot(root.current, container)

  const rootContainerElement =
    container.nodeType === COMMENT_NODE ? container.parentNode! : container

  //在container上初始化事件系统
  listenToAllSupportedEvents(rootContainerElement)
  return root
}

export const createLegacyRoot = (container: Container): RootType => {
  return new ReactDOMLegacyRoot(container)
}
