import React, { useState, useEffect } from '../packages/react'
import { createRoot, render } from '../packages/react-dom'

const Wrapper: React.FC<{
  onClick: () => void
  num: number
}> = ({ onClick, num }) => <div onClick={onClick}>wrapper-{num}</div>

const App = () => {
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
      <button onClick={() => setNum1(num1 + 1)}>num1-{num1}</button>
    </span>
  )
}

// render(<App />, document.querySelector('#app')!)

createRoot(document.querySelector('#app')!).render(<App />)
