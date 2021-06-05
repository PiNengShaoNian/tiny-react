# 优先队列的应用，能让你更容易理解Scheduler模块中优先级调度的相关代码

## 题目1.数据流的中位数
中位数是有序列表中间的数。如果列表长度是偶数，中位数则是中间两个数的平均值。

例如，

[2,3,4] 的中位数是 3

[2,3] 的中位数是 (2 + 3) / 2 = 2.5

设计一个支持以下两种操作的数据结构：

void addNum(int num) - 从数据流中添加一个整数到数据结构中。
double findMedian() - 返回目前所有元素的中位数。

### 示例:
```
addNum(1)
addNum(2)
findMedian() -> 1.5
addNum(3) 
findMedian() -> 2
```

### 参考答案
```ts
interface Comparable<T> {
  compareTo(that: T): number
  equals(that: T): boolean
}

class PriorityQueue<E extends number | string | Comparable<E>> {
  private pq: E[] = []
  private _size = 0

  constructor(comparator?: (a: E, b: E) => boolean) {
    if (comparator) {
      this.less = (i: number, j: number) => {
        return comparator(this.pq[i], this.pq[j])
      }
    }
  }

  size() {
    return this._size
  }

  isEmpty() {
    return this._size === 0
  }

  insert(e: E) {
    this.pq[++this._size] = e
    this.swim(this._size)
  }

  remove() {
    const min = this.pq[1]

    this.exch(1, this._size)
    this._size--
    this.pq.length = this._size + 1

    this.sink(1)

    return min
  }

  private exch(i: number, j: number) {
    const t = this.pq[i]
    this.pq[i] = this.pq[j]
    this.pq[j] = t
  }

  private sink(k: number) {
    while (2 * k <= this._size) {
      let j = 2 * k

      if (j + 1 <= this._size && this.less(j + 1, j)) j++

      if (this.less(k, j)) break

      this.exch(k, j)
      k = j
    }
  }

  private swim(k: number) {
    let j: number
    while (k > 1 && this.less(k, (j = Math.floor(k / 2)))) {
      this.exch(j, k)
      k = j
    }
  }

  private less(i: number, j: number): boolean {
    if (typeof this.pq[i] === 'string' || typeof this.pq[i] === 'number') {
      return this.pq[i] < this.pq[j]
    } else {
      return (this.pq[i] as Comparable<E>).compareTo(this.pq[j]) < 0
    }
  }

  peek(): null | E {
    return this.pq[1] ?? null
  }
}

class MedianFinder {
  private minPQ: PriorityQueue<number> = new PriorityQueue<number>()
  private maxPQ: PriorityQueue<number> = new PriorityQueue<number>((a, b) => {
    return a > b
  })

  size(): number {
    return this.minPQ.size() + this.maxPQ.size()
  }

  addNum(v: number): void {
    if (this.size() % 2 === 0) {
      const max = this.maxPQ.peek()

      if (max === null || max < v) {
        this.minPQ.insert(v)
      } else {
        this.minPQ.insert(this.maxPQ.remove())
        this.maxPQ.insert(v)
      }
    } else {
      const min = this.minPQ.peek()

      if (min === null || v < min) {
        this.maxPQ.insert(v)
      } else {
        this.maxPQ.insert(this.minPQ.remove())
        this.minPQ.insert(v)
      }
    }
  }

  findMedian(): number | null {
    const size = this.size()

    if (size === 0) return null

    if (size % 2 === 0) {
      return (this.minPQ.peek()! + this.maxPQ.peek()!) / 2
    } else {
      return this.minPQ.peek()
    }
  }
}
```
### 解释
使用两个优先级堆（priority heap），即一个大顶堆，存放小于中位数的值，以
及一个小顶堆，存放大于中位数的值。这会将所有元素大致分为两半，中间的两个元素位于两个堆的堆顶。这样一来，要找出中间值就是小事一桩。

## 相关引用
- [leetcode 295. 数据流的中位数](https://leetcode-cn.com/problems/find-median-from-data-stream/)