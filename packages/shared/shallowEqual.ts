const hasOwnProperty = Object.prototype.hasOwnProperty
const is = Object.is

export const shallowEqual = (objA: unknown, objB: unknown): boolean => {
  if (is(objA, objB)) return true

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  )
    return false

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; ++i) {
    if (
      !hasOwnProperty.call(objB, keysA[i]) ||
      !is((objA as any)[keysA[i]], (objB as any)[keysA[i]])
    ) {
      return false
    }
  }

  return true
}
