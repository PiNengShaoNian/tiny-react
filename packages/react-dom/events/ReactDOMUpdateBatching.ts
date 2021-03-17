let discreteUpdatesImpl = <A extends Function, B, C, D, E>(
  fn: A,
  a: B,
  b: C,
  c: D,
  d: E
) => {
  return fn(a, b, c, d)
}

let batchedEventUpdatesImpl = (...args: any[]) => {}

export const discreteUpdates = <A extends Function, B, C, D, E>(
  fn: A,
  a: B,
  b: C,
  c: D,
  d: E
) => {
  return discreteUpdatesImpl(fn, a, b, c, d)
}

export const batchedEventUpdates = <A, B, C>(fn: A, a: B, b: C) => {
  return batchedEventUpdatesImpl(fn, a)
}

export const setBatchingImplementation = (
  _discreteUpdatesImpl: Function,
  _batchedEventUpdates: Function
) => {
  discreteUpdatesImpl = _discreteUpdatesImpl as any
  batchedEventUpdatesImpl = _batchedEventUpdates as any
}
