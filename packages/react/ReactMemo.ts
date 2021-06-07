import { REACT_MEMO_TYPE } from '../shared/ReactSymbols'

export const memo = <Props>(
  type: any,
  compare?: (oldProps: Props, newProps: Props) => boolean
): any => {
  const elementType = {
    $$typeof: REACT_MEMO_TYPE,
    type,
    compare: compare === undefined ? null : compare,
  }

  return elementType
}
