import { TEXT_NODE } from '../shared/HTMLNodeType'
import { AnyNativeEvent } from './PluginModuleType'

export const getEventTarget = (nativeEvent: AnyNativeEvent) => {
  const target: Element = (nativeEvent.target || window) as Element

  return target.nodeType === TEXT_NODE ? target.parentNode : target
}
