type Heap = Array<Node>
export type Node = {
  id: number
  sortIndex: number
}

const compare = (a: Node, b: Node): number => {
  const diff = a.sortIndex - b.sortIndex
  return diff !== 0 ? diff : a.id - b.id
}

const siftUp = (heap: Heap, node: Node, i: number): void => {
  let index = i
  while (index > 0) {
    const parentIndex = (index - 1) >>> 1
    const parent = heap[parentIndex]

    if (compare(parent, node) > 0) {
      heap[parentIndex] = node
      heap[index] = parent
      index = parentIndex
    } else return
  }
}

export const push = (heap: Heap, node: Node) => {
  const index = heap.length
  heap.push(node)
  siftUp(heap, node, index)
}

export const peek = (heap: Heap): Node | null => {
  return heap.length === 0 ? null : heap[0]
}

const siftDown = (heap: Heap, node: Node, i: number): void => {
  let index = i
  const length = heap.length
  const halfLength = length >>> 1
  while (index < halfLength) {
    const leftIndex = (index + 1) * 2 - 1
    const left = heap[leftIndex]
    const rightIndex = leftIndex + 1
    const right = heap[rightIndex]

    if (compare(left, node) < 0) {
      if (rightIndex < length && compare(right, left) < 0) {
        heap[index] = right
        heap[rightIndex] = node
        index = rightIndex
      } else {
        heap[index] = left
        heap[leftIndex] = node
        index = leftIndex
      }
    } else if (rightIndex < length && compare(right, node) < 0) {
      heap[index] = right
      heap[rightIndex] = node
      index = rightIndex
    } else return
  }
}

export const pop = (heap: Heap): Node | null => {
  if (heap.length === 0) return null

  const first = heap[0]
  const last = heap.pop()!

  if (last !== first) {
    heap[0] = last
    siftDown(heap, last, 0)
  }

  return first
}
