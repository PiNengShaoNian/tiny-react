/**
 * 简单的useState和useEffect例子
 */
import React, { useState, useEffect } from '../packages/react'

export const StateEffectDemo = () => {
  const [num, setNum] = useState(0)
  const [num1, setNum1] = useState(0)
  useEffect(() => {
    console.log('num', num)
  }, [num])

  useEffect(() => {
    console.log('num1', num1)
  }, [num1])

  return (
    <span>
      <button onClick={() => setNum(num + 1)}>num-{num}</button>
      <br />
      <button
        onClick={() => {
          setNum1(num1 + 1)
          setNum1(num1 + 2)
          setNum1(num1 + 3)
        }}
      >
        num1-{num1}
      </button>
    </span>
  )
}
