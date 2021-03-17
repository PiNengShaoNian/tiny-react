import { Dispatcher } from '../react-reconciler/ReactInternalTypes'
import { ReactCurrentDispatcher } from './ReactCurrentDispatcher'

type BasicStateAction<S> = ((a: S) => S) | S
type Dispatch<A> = (a: A) => void

const resolveDispatcher = (): Dispatcher => {
  const dispatcher = ReactCurrentDispatcher.current

  return dispatcher!
}

export const useState = <S>(
  initialState: (() => S) | S
): [S, Dispatch<BasicStateAction<S>>] => {
  const dispatcher = resolveDispatcher()

  return dispatcher.useState(initialState)
}
