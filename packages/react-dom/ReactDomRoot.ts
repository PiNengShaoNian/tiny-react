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

/**
 * 将JSX对象渲染为Dom并挂载到container上
 */
ReactDomRoot.prototype.render = ReactDOMLegacyRoot.prototype.render = function (
  children: ReactNodeList
) {
  const root = this._internalRoot

  updateContainer(children, root)
}

export const createRoot = (container: Container) => {
  return new ReactDomRoot(container)
}

/**
 *
 * @param container createRoot的第一个参数，一个dom元素，表示该React App要改在的容器
 * @param tag 该Root的类型用createRoot创建的为ConcurrentRoot,
 * 用ReactDOM.render创建的为LegacyRoot
 *该标签对以后的流程有深远的影响
 * @returns 返回一个FiberRoot,一个在并不对应任何DOM的最上层节点，
 * 所有的fiber节点的根节点，注意HostRoot(Fiber树根节点)可以有多个,
 * 但是FiberRoot只有一个
 */
const createRootImpl = (container: Container, tag: RootTag): FiberRoot => {
  const root = createContainer(container, tag)
  markContainerAsRoot(root.current, container)

  const rootContainerElement =
    container.nodeType === COMMENT_NODE ? container.parentNode! : container

  //在container上初始化事件系统，在这里将ReactDom接入react，保证了
  //基于fiber树的事件代理，以及基于不同事件优先级调度能正常工作
  listenToAllSupportedEvents(rootContainerElement)
  return root
}

/**
 * 创建一个LegacyRoot也就是ReactDOM.render所创建出的root
 * 该模式没有优先级调度，以及时间切片功能
 * @param container 挂载ReactApp 的dom容器
 * @returns 
 */
export const createLegacyRoot = (container: Container): RootType => {
  return new ReactDOMLegacyRoot(container)
}
