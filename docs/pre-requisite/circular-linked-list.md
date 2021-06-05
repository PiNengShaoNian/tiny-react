# 循环链表

循环链表可能是React中使用最频繁的数据结构了，在这里我们会实现一个类似的数据结构
首先我们先定义LinkedList的结构
```ts
type ListNode<TValue> = {
  /**
   * 该节点存储的值
   */
  value: TValue
}

type CircularLinkedList<TValue> = {
  /**
   * 链表的尾节点
   */
  last: null | ListNode<TValue>
}
```
下面在为该循环链表实现几个函数

`add`函数用来为链表添加一个节点
```ts
const add = <T>(list: CircularLinkedList<T>, value: T): void => {
  const node: ListNode<T> = {
    value,
    next: null as any,
  }

  if (!list.last) {
    //node是第一个加入的节点
    node.next = node
  } else {
    //node为现在的最后一个节点
    const first = list.last.next
    node.next = first
    list.last.next = node
  }

  list.last = node
}
```
`traverse`函数用来遍历该循环链表
```ts
const traverse = <T>(
  list: CircularLinkedList<T>,
  callback: (v: ListNode<T>) => void
): void => {
  if (!list.last) return
  const first = list.last.next
  let node = first

  do {
    callback(node)
    node = node.next
  } while (node !== first)
}
```

`merge`函数用来将第二个链表合并到第一个链表上
```ts
const merge = <T>(
  list1: CircularLinkedList<T>,
  list2: CircularLinkedList<T>
): void => {
  const last1 = list1.last
  const last2 = list2.last

  if (last1 === null || last2 === null) return

  const first1 = last1.next
  const first2 = last2.next

  //将第二个链表的头接到第一个链表的末尾
  last1.next = first2
  //现在last2为最后的节点，将他的next指向整个链表的头也就是first1
  last2.next = first1

  //list1.last指向合并后链表的最后节点，而现在last2才是最后节点
  list1.last = last2
  //清除list2
  list2.last = null
}
```
上面的函数，就是React所有用到的循环链表操作了，我们在为他写点测试
```ts
import * as assert from 'assert'

const main = (): void => {
  const list1: CircularLinkedList<number> = {
    last: null,
  }

  add(list1, 1)
  add(list1, 2)
  add(list1, 3)
  const actual: number[] = []
  traverse(list1, (v) => {
    actual.push(v.value)
  })
  assert.deepStrictEqual(actual, [1, 2, 3])

  const list2: CircularLinkedList<number> = {
    last: null,
  }
  add(list2, 4)
  add(list2, 5)
  add(list2, 6)
  merge(list1, list2)
  assert.strictEqual(list2.last, null)
  actual.length = 0
  traverse(list1, (v) => {
    actual.push(v.value)
  })
  assert.deepStrictEqual(actual, [1, 2, 3, 4, 5, 6])
}

main()
```