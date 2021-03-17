import { Dispatcher } from '../react-reconciler/ReactInternalTypes'

const ReactCurrentDispatcher: {
  current: null | Dispatcher
} = {
  current: null,
}

export { ReactCurrentDispatcher }
