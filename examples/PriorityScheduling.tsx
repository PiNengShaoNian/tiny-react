/**
 * 优先级调度的展示，高优先级的任务（点击事件产生的更新）会打断低
 * 优先级的任务（直接指向setState的更新）
 */
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
