import { Dispatcher } from '../react-reconciler/ReactInternalTypes'
import { ReactCurrentDispatcher } from './ReactCurrentDispatcher'

type BasicStateAction<S> = ((a: S) => S) | S
type Dispatch<A> = (a: A) => void

/**
 * 取得此时因该使用的Dispatcher,比如首次mount时的dispatcher就为
 * 就为HooksDispatcherOnMount
 * 组件更新时就为HooksDispatcherOnUpdate，
 * 具体逻辑可以查看react-reconciler/ReactFiberHooks下的renderWithHooks函数
 * @returns 
 */
const resolveDispatcher = (): Dispatcher => {
  const dispatcher = ReactCurrentDispatcher.current

  return dispatcher!
}

/**
 * 更具当前的dispatcher调用对应的useState
 * @param initialState 初始状态
 * @returns 
 */
export const useState = <S>(
  initialState: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] => {
  const dispatcher = resolveDispatcher()

  return dispatcher.useState(initialState)
}

export const useEffect = (
  create: () => (() => void) | void,
  deps: unknown[] | void | null
): void => {
  const dispatcher = resolveDispatcher()
  return dispatcher.useEffect(create, deps)
}

export const useLayoutEffect = (
  create: () => (() => void) | void,
  deps: unknown[] | void | null
): void => {
  const dispatcher = resolveDispatcher()
  return dispatcher.useLayoutEffect(create, deps)
}
