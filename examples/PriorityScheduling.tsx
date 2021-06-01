/**
 * 优先级调度的展示
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
    const button = document.querySelector('button')!
    // setTimeout(() => updateCount(1), 1000)
    setTimeout(() => {
      updateCount(1)
      button.click()
      updateCount(3)
      // button.click()
    }, 1040)
  }, [])

  return (
    <div>
      <button onClick={onClick}>增加2</button>
      <div>
        {Array.from(new Array(10000)).map((v, index) => (
          <span key={index}>{count}</span>
        ))}
      </div>
    </div>
  )
}
