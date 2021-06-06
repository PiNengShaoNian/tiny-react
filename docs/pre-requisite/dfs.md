# DFS(深度优先遍历)

DFS可能是React中使用最频繁的算法，在阅读源码前，请务必把下面的内容搞懂

假设有以下数据结构,我们的目的就是写一个函数来深度优先的遍历这种数据结构
```ts
type TreeNode<T> = {
  value: T
  children: TreeNode<T>[]
}
```
## 第一版. 递归实现
由于递归自带dfs属性我们可以轻松写出以下代码
```ts
const traverseRecursively = () => {
  for (let i = 0; i < root.children.length; ++i) {
    traverseRecursively(root.children[i], callback)
  }

  callback(root)
} 
```
## 第二版. 迭代版本
实际上在React中所有dfs的实现都是基于实现迭代版本实现，那也不难我们可以使用栈这种数据结构
```ts
const traverseIteratively = <T>(
  root: TreeNode<T>,
  callback: (v: TreeNode<T>) => void
): void => {
  const stack: Command[] = []
  type Command = {
    type: 'GO' | 'PERFORM_WORK'
    node: TreeNode<T>
  }

  stack.push({
    type: 'GO',
    node: root,
  })
  while (stack.length) {
    const { type, node } = stack.pop()!

    switch (type) {
      case 'GO':
        {
          //由于栈式先进后出的任务，所以越靠后的任务需要越先入栈
          stack.push({
            node,
            type: 'PERFORM_WORK',
          })

          for (let i = node.children.length - 1; i >= 0; --i) {
            stack.push({
              type: 'GO',
              node: node.children[i],
            })
          }
        }
        break
      case 'PERFORM_WORK': {
        callback(node)
      }
    }
  }
}
```
## 第三版. 迭代优化版本
上面的迭代版本好像除了在树的层级过深时不会报`Maximum call stack size exceeded`错误外和递归版本比一无是处，因为他的空间复杂度还是O(N),下面我们就实现一个O(1)空间复杂度的迭代版本的DFS,为了实现这个版本我们需要对上面的树节点的数据结构做一些改变，能让一个树节点知道他还有没有下一个兄弟节点，还有知道他的父节点是什么
```ts
type Fiber<T> = {
  /**
   * 节点上存储的值
   */
  value: T
  /**
   * 他的下一个同级兄弟节点
   */
  sibling:  Fiber<T> | null
  /**
   * 他的父节点
   */
  return: Fiber<T> | null
  /**
   * 他的第一个子节点，其他子节点可以通过fiber.child.sibling获得
   */
  child: Fiber<T> | null
}
```
然后根据的数据可以写出下面的代码
```ts
const traverseIterativelyPlus = <T>(
  root: Fiber<T>,
  callback: (v: Fiber<T>) => void
): void => {
  let workInProgress: null | Fiber<T> = root

  while (workInProgress !== null) {
    while (workInProgress.child !== null) {
      //只要还有子节点就继续向下走
      workInProgress = workInProgress.child
      continue
    }

    //已经到达最底层，该节点没有子节点了执行他的callback
    callback(workInProgress)

    //已经返回至最上层，直接退出函数
    if (workInProgress === root) return

    while (workInProgress.sibling === null) {
      if (workInProgress.return === null) return

      workInProgress = workInProgress.return
      //他的子节点已经全部完成工作了，现在执行他的callback
      callback(workInProgress)
    }

    workInProgress = workInProgress.sibling
  }
}
```

## 第四版. 迭代优化版本，并且区分出工作阶段
上面的版本既不会爆栈，也能把空间复杂度控制在O(1),但是他的callback只照顾到后序遍历的情况，即只有对所有子节点都调用callback后，才会执行父节点的callback,现在我们要将递归细分成两个阶段，一个为**递阶段**：此阶段处于第一次访问该节点，一个为**归阶段**：该阶段处于一个节点的所有子节点都完成了两个阶段又返回他，我们上面的代码只处理到了第二个阶段(归阶段)，我们把**递阶段**命名为begin,**归阶段**命名为complete,所以可以写出下面的代码

```ts
const traverseIterativelyPlusMax = <T>(
  root: Fiber<T>,
  beginCallback: (v: Fiber<T>) => void,
  completeCallback: (v: Fiber<T>) => void
): void => {
  /**
   * 执行一个节点的递阶段
   * @param workInProgress 要执行递阶段的节点
   * @returns 下一个要执行递阶段的节点如果为null则表示要执行workInProgress
   * 的归阶段了
   */
  const beginWork = (workInProgress: Fiber<T>): Fiber<T> | null => {
    //第一次访问该节点，执行他的begin回调
    beginCallback(workInProgress)

    //返回他的子节点，如果他存在子节点，就会开始该子节点的递阶段(begin phase)
    //如果不存在就会开始他的归阶段(complete phase)
    return workInProgress.child
  }

  /**
   * 执行一个节点的归阶段
   * @param workInProgress 要执行归阶段的节点
   */
  const completeWork = (workInProgress: Fiber<T>) => {
    completeCallback(workInProgress)
  }

  const workLoop = () => {
    let next: Fiber<T> | null = null
    while (workInProgress !== null) {
      next = beginWork(workInProgress)

      if (next === null) {
        //workInProgress没有子节点了，该进行他的归阶段了

        let completedWork: Fiber<T> | null = workInProgress
        do {
          completeWork(completedWork)

          //上面的节点已经完成了他的归阶段，该进行他同级兄弟节点的递阶段了
          //如果有的话
          const siblingFiber = completedWork.sibling

          if (siblingFiber !== null) {
            workInProgress = siblingFiber
            break
          } else {
            //他没有同级兄弟节点，意味着该进行他父节点的归阶段了
            completedWork = workInProgress.return!
            workInProgress = completedWork
          }
        } while (completedWork !== null)
      } else {
        workInProgress = next
      }
    }
  }

  let workInProgress: Fiber<T> | null = root

  workLoop()
}
```
好了现在第四版中这个dfs就是React中workLoop的大体流程了，让我们为他们，写一些测试为了方便，我们可以实现一个将`TreeNode`转换为`Fiber`的函数，他的原理不用了解
```ts
const transformTreeNodeToFiber = <T>(treeNode: TreeNode<T>): Fiber<T> => {
  const ans: Fiber<T> = {
    value: treeNode.value,
    child: null,
    sibling: null,
    return: null,
  }

  const dfs = (vertex1: TreeNode<T>, vertex2: Fiber<T>) => {
    if (vertex1.children.length === 0) return

    let currentTreeNode: TreeNode<T>
    let currentFiber: Fiber<T> | null = null

    for (let i = 0; i < vertex1.children.length; ++i) {
      currentTreeNode = vertex1.children[i]
      const newFiber: Fiber<T> = {
        value: currentTreeNode.value,
        sibling: null,
        child: null,
        return: vertex2,
      }

      if (currentFiber === null) {
        //他是第一个节点，将他接到父节点的child中
        vertex2.child = newFiber
      } else {
        //不是第一个节点，将他接到前一个节点的sibling中
        currentFiber.sibling = newFiber
      }

      currentFiber = newFiber
      newFiber.return = vertex2

      dfs(currentTreeNode, currentFiber)
    }
  }

  dfs(treeNode, ans)

  return ans
}
```

```ts
import * as assert from 'assert'

const main = (): void => {
  const root1: TreeNode<number> = {
    value: 4,
    children: [
      {
        value: 2,
        children: [
          {
            value: 1,
            children: [],
          },
        ],
      },
      {
        value: 3,
        children: [],
      },
    ],
  }
  const root2: TreeNode<number> = {
    value: 1,
    children: [],
  }
  const root3: TreeNode<string> = {
    value: 'div',
    children: [
      {
        value: 'ul',
        children: [
          { value: 'li', children: [] },
          { value: 'li', children: [] },
        ],
      },
      {
        value: '666',
        children: [],
      },
      {
        value: 'p',
        children: [],
      },
    ],
  }
  const fiber1 = transformTreeNodeToFiber(root1)
  const fiber2 = transformTreeNodeToFiber(root2)
  const fiber3 = transformTreeNodeToFiber(root3)

  const acutal: Array<number | string> = []

  //递归版dfs测试
  traverseRecursively(root1, (v) => {
    acutal.push(v.value)
  })
  assert.deepStrictEqual(acutal, [1, 2, 3, 4])

  acutal.length = 0
  traverseRecursively(root2, (v) => {
    acutal.push(v.value)
  })
  assert.deepStrictEqual(acutal, [1])

  acutal.length = 0
  traverseRecursively(root3, (v) => {
    acutal.push(v.value as any)
  })
  assert.deepStrictEqual(acutal, ['li', 'li', 'ul', '666', 'p', 'div'])

  //迭代版dfs测试
  acutal.length = 0
  traverseIteratively(root1, (v) => {
    acutal.push(v.value)
  })
  assert.deepStrictEqual(acutal, [1, 2, 3, 4])

  acutal.length = 0
  traverseIteratively(root2, (v) => {
    acutal.push(v.value)
  })
  assert.deepStrictEqual(acutal, [1])

  acutal.length = 0
  traverseIteratively(root3, (v) => {
    acutal.push(v.value as any)
  })
  assert.deepStrictEqual(acutal, ['li', 'li', 'ul', '666', 'p', 'div'])

  //优化空间复杂度迭代版dfs测试
  acutal.length = 0
  traverseIterativelyPlus(fiber1, (v) => {
    acutal.push(v.value)
  })
  assert.deepStrictEqual(acutal, [1, 2, 3, 4])

  acutal.length = 0
  traverseIterativelyPlus(fiber2, (v) => {
    acutal.push(v.value)
  })
  assert.deepStrictEqual(acutal, [1])

  acutal.length = 0
  traverseIterativelyPlus(fiber3, (v) => {
    acutal.push(v.value as any)
  })
  assert.deepStrictEqual(acutal, ['li', 'li', 'ul', '666', 'p', 'div'])

  //优化空间复杂度，切分执行时期迭代版dfs测试
  acutal.length = 0
  traverseIterativelyPlusMax(
    fiber1,
    (v) => {
      acutal.push(v.value + '-begin')
    },
    (v) => {
      acutal.push(v.value + '-complete')
    }
  )
  assert.deepStrictEqual(acutal, [
    '4-begin',
    '2-begin',
    '1-begin',
    '1-complete',
    '2-complete',
    '3-begin',
    '3-complete',
    '4-complete',
  ])

  acutal.length = 0
  traverseIterativelyPlusMax(
    fiber2,
    (v) => {
      acutal.push(v.value + '-begin')
    },
    (v) => {
      acutal.push(v.value + '-complete')
    }
  )
  assert.deepStrictEqual(acutal, ['1-begin', '1-complete'])

  acutal.length = 0
  traverseIterativelyPlusMax(
    fiber3,
    (v) => {
      acutal.push(v.value + '-begin')
    },
    (v) => {
      acutal.push(v.value + '-complete')
    }
  )
  assert.deepStrictEqual(acutal, [
    'div-begin',
    'ul-begin',
    'li-begin',
    'li-complete',
    'li-begin',
    'li-complete',
    'ul-complete',
    '666-begin',
    '666-complete',
    'p-begin',
    'p-complete',
    'div-complete',
  ])
}

main()
```