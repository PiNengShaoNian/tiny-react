import { Dispatcher } from '../react-reconciler/ReactInternalTypes'

/**
 * 用来保存当前的Dispatcher比如，初次渲染时保存的dispatcher就为HooksDispatcherOnMount
 * 组件更新时就为HooksDispatcherOnUpdate，
 * 具体逻辑可以查看react-reconciler/ReactFiberHooks下的renderWithHooks函数
 */
const ReactCurrentDispatcher: {
  current: null | Dispatcher
} = {
  current: null,
}

export { ReactCurrentDispatcher }
