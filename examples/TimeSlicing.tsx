/**
 *  打开performance查看Concurrent Mode下render阶段的时间切片
 * 点击一下按钮然后会开始BitList的render阶段，可以看到处于render阶段(也就是点击按钮后的前几秒)时input
 * 是可以输入的，但是由于要渲染的东西太多，到commit阶段时就会开始卡住，
 * 所以此时会卡顿的瓶颈在浏览器渲染太耗时，而不是在react
 */

import React, { useState } from '../packages/react'

const data = Array.from({ length: 50e4 }, (_, i) => i)
const CHUNK_SIZE = 1e4 / 10

/**
 * fiber是最小的工作粒度，如果要保证render过程中能保证浏览器能
 * 处于交互的状态就得保证一个fiber render的过程不会太耗
 * 事件，所以可以根据机能设置合适的CHUNK_SIZE
 * @param param0
 * @returns
 */
const Chunk = ({ start }: { start: number }): any => {
  const end = Math.min(data.length, start + CHUNK_SIZE)
  const children = Array.from({ length: end - start })
  for (let i = start; i < end; ++i) {
    children[i - start] = <div key={i}>{i}</div>
  }

  return children
}

const BigList = () => {
  const children = []

  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    children.push(<Chunk start={i} />)
  }
  return <div>{children}</div>
}

export const TimeSlicingDemo = () => {
  const [isShowBigList, setIsShowBigList] = useState(false)

  return (
    <div>
      <button
        onClick={() => {
          //由于点击事件内产生的更新会按Sync优先级处理
          //我们手动用setTimeout去掉点击事件的执行上下文
          setTimeout(() => {
            setIsShowBigList(!isShowBigList)
          })
        }}
      >
        toggle BigList
      </button>
      <br />
      <input placeholder="输入点东西，看看交互有没有被阻塞" />
      <br />
      {isShowBigList ? <BigList /> : null}
    </div>
  )
}
