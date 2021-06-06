# tiny-react是一个基于React17精简而来的仓库
为了简化react源码学习的库，和react17的区别就是少了很多功能，只实现了核心的逻辑，和preact这种react-like库有着根本区别,preact更像是一个和react有着相同的接口但是实现细节却不尽相同的react,而tiny-react是从react官方仓库精简而来，它更像官方react的阉割版，所以每一行代码，每一个函数都能在react最新的官方仓库中找到出处，而且总共的代码只有6千多行，刨除掉ReactDOM只有4000多行，能让React源码学习的难度大大降低

## 使用指南
* 在阅读源码前，你需要对react的大体原理有一定的了解在这里强烈推荐去通读一下卡颂老师的[React技术揭秘](https://react.iamkasong.com/)
* 对react的大体原理有一定了解后就可以开始看源码了，不过有些同学可能对一些源码中使用频繁的的数据结构和算法还不怎么了解，这时候就可以看一下下面的[看源码前需要了解的数据结构和算法](#看源码前需要了解的数据结构和算法),如果你已经非常了解这些知识则可以跳过
* react-dom这个模块，可以不用太关注，虽然他的代码有2000多行，但是大量的代码都是dom操作和事件委托相关函数，对学习React核心原理影响不大，不过其中 [浏览器事件优先级](https://github.com/PiNengShaoNian/tiny-react/blob/main/packages/react-dom/events/ReactDOMEventListener.ts) 相关的代码还是要注意一下
* react-reconciler这个模块需要重点关注特别是其中的 [ReactFiberWorkLoop](https://github.com/PiNengShaoNian/tiny-react/blob/main/packages/react-reconciler/ReactFiberWorkLoop.ts) 他是React源码的骨干，把所有的模块连接到了一起
* scheduler这个模块是代码最少，最简单的模块了，而且基本没有和其他模块耦合，可以直接单独看他的源码

## [看源码前需要了解的数据结构和算法](./docs/pre-requisite/index.md)
 - ### [位运算](./docs/pre-requisite/bit-manipulation.md)
 - ### [优先队列](./docs/pre-requisite/priority-queue.md)
 - ### [循环链表](./docs/pre-requisite/circular-linked-list.md)
 - ### [dfs](./docs/pre-requisite/dfs.md)

## Feature

### 时间切片
![image](https://i.loli.net/2021/06/06/x91pyG2MNhe3TBo.png)

### useState和useEffect
![image](https://i.loli.net/2021/06/06/nPSNCFK25UVbTAR.gif)

### useLayoutEffect
![image](https://i.loli.net/2021/06/06/VcGABLKUYC6QMfR.gif)

### 优先级调度
```ts
import React, { useState, useEffect } from '../packages/react'

export const PriorityScheduling = () => {
  const [count, updateCount] = useState(0)

  const onClick = () => {
    updateCount((count) => count + 2)
  }

  console.log({ count })

  useEffect(() => {
    //暂时不支持ref直接用选择器获取
    const button = document.getElementById('discretEventDispatcher')!
    setTimeout(() => updateCount(1), 1000)
    setTimeout(() => {
      button.click()
      //根据机能给第二个setTimeout一个合适的时间,或者适当的加长数组的长度
      //以保证点击事件触发时，前一个低优先级的更新的render阶段还没有完成
      //才能看到插队情况发生
    }, 1030)
  }, [])

  return (
    <div>
      <button id="discretEventDispatcher" onClick={onClick}>
        增加2
      </button>
      <div>
        {Array.from(new Array(10000)).map((v, index) => (
          <span key={index}>{count}</span>
        ))}
      </div>
    </div>
  )
}
```
![image](https://i.loli.net/2021/06/06/PfXslp4dkytA6nr.gif)