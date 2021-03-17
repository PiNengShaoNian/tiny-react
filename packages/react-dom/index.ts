import { setBatchingImplementation } from './events/ReactDOMUpdateBatching'
import { createRoot } from './ReactDomRoot'
import {
  discreteUpdates,
  batchedEventUpdates,
} from '../react-reconciler/ReactFiberReconciler'

setBatchingImplementation(discreteUpdates, batchedEventUpdates)

export { createRoot }
