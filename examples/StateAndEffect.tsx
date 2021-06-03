/**
 * 简单的useState和useEffect例子
 */
import React, { useState, useEffect } from '../packages/react'

export const StateEffectDemo = () => {
  const [num, setNum] = useState(0)
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  useEffect(() => {
    console.log('num', num)
  }, [num])

  useEffect(() => {
    console.log('num1', num1)
  }, [num1])

  useEffect(() => {
    console.log('num2', num2)
  }, [num2])

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
      <br />
      <button
        onClick={() => {
          setTimeout(() => {
            setNum2(num2 + 1)
            setNum2(num2 + 2)
            setNum2(num2 + 3)
          })
        }}
      >
        num2-{num2}
      </button>
    </span>
  )
}
