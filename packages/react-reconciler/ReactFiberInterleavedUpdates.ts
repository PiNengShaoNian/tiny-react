import { UpdateQueue as HookQueue } from './ReactFiberHooks'

let interleavedQueues: HookQueue<any, any>[] | null = null

export const pushInterleavedQueue = (queue: HookQueue<any, any>) => {
  if (interleavedQueues === null) {
    interleavedQueues = [queue]
  } else {
    interleavedQueues.push(queue)
  }
}

export const enqueueInterleavedUpdates = () => {
  //将interleaved的updates转移到main queue,每一个queue都有一个interleaved和一个pending
  //字段他们分别指向一个循环链表中的最后一个节点，我们需要将interleaved链表加到pending链表的最后
  if (interleavedQueues !== null) {
    for (let i = 0; i < interleavedQueues.length; ++i) {
      const queue = interleavedQueues[i]

      const lastInterleavedUpdate = queue.interleaved
      if (lastInterleavedUpdate !== null) {
        queue.interleaved = null
        const firstInterleavedUpdate = lastInterleavedUpdate.next
        const lastPendingUpdate = queue.pending
        if (lastPendingUpdate !== null) {
          const firstPendingUpdate = lastPendingUpdate.next
          lastPendingUpdate.next = firstInterleavedUpdate
          lastInterleavedUpdate.next = firstPendingUpdate
        }
        queue.pending = lastInterleavedUpdate
      }
    }
    interleavedQueues = null
  }
}
