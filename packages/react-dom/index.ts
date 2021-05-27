import { setBatchingImplementation } from './events/ReactDOMUpdateBatching'
import { createRoot } from './ReactDomRoot'
import {
  discreteUpdates,
  batchedEventUpdates,
} from '../react-reconciler/ReactFiberReconciler'
import { render } from './ReactDOMLegacy'

setBatchingImplementation(discreteUpdates, batchedEventUpdates)

export { createRoot, render }
export default {
  createRoot,
  render,
}
