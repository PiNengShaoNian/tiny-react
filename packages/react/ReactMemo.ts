import { REACT_MEMO_TYPE } from '../shared/ReactSymbols'
import { ReactElement } from '../shared/ReactTypes'

export const memo = <Props>(
  type: (props: Props) => ReactElement,
  compare?: (oldProps: Props, newProps: Props) => boolean
): any => {
  const elementType = {
    $$typeof: REACT_MEMO_TYPE,
    type,
    compare: compare === undefined ? null : compare,
  }

  return elementType
}
