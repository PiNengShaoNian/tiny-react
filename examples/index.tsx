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
    console.log('sa')
  }, [])

  console.log('render')
  return (
    <span
      // onClick={() => {
      //   console.log('span bubble')
      // }}
      onClickCapture={() => {
        setNum(num + 1)
        setNum(num + 2)
        setNum(num + 3)
        setNum1(num1 + 2)
        setNum1(num1 + 4)
        setNum1(num1 + 6)
      }}
    >
      sdfsad-{num}
      <div />
      {num1}
      <Wrapper onClick={() => {}} num={num1 + num}></Wrapper>
    </span>
  )
}

// createRoot(document.querySelector('#app')!).render(<App />)

render(<App />, document.querySelector('#app')!)
// ReactDom.render(<App />, document.querySelector('#app')!)
