import { updateContainer } from '../react-reconciler/ReactFiberReconciler'
import { unbatchedUpdates } from '../react-reconciler/ReactFiberWorkLoop'
import { FiberRoot } from '../react-reconciler/ReactInternalTypes'
import { ReactElement, ReactNodeList } from '../shared/ReactTypes'
import { Container, createLegacyRoot, RootType } from './ReactDomRoot'

type Component<S, P> = unknown

const legacyCreateRootFromDOMContainer = (container: Container): RootType => {
  return createLegacyRoot(container)
}

const legacyRenderSubtreeIntoContainer = (
  parentComponent: Component<any, any> | null,
  children: ReactNodeList,
  container: Container,
  callback?: Function
) => {
  let root: RootType | undefined = container._reactRootContainer

  let fiberRoot: FiberRoot
  if (!root) {
    //首次挂载
    root = container._reactRootContainer = legacyCreateRootFromDOMContainer(
      container
    )
    fiberRoot = root._internalRoot
    if (typeof callback === 'function') {
      const originalCallback = callback
      callback = () => {
        const instance = fiberRoot.current.child?.stateNode ?? null
        originalCallback(instance)
      }
    }

    unbatchedUpdates(() => {
      updateContainer(children, fiberRoot)
    }, null)
  } else {
    throw new Error('Not Implement')
  }

  return fiberRoot.current.child?.stateNode
}

export const render = (
  element: ReactElement,
  container: Container,
  callback?: Function
) => {
  return legacyRenderSubtreeIntoContainer(null, element, container, callback)
}
