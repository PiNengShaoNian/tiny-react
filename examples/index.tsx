import React, { useState } from '../packages/react'
import { createRoot, render } from '../packages/react-dom'

const Wrapper: React.FC<{
  onClick: () => void
  onClickCapture: () => void
}> = ({ onClick, onClickCapture }) => (
  <div onClickCapture={onClickCapture} onClick={onClick}>
    wrapper
  </div>
)

const App = () => {
  const [num, setNum] = useState(3)
  return (
    <span
      // onClick={() => {
      //   console.log('span bubble')
      // }}
      onClickCapture={() => {
        setNum(num + 1)
      }}
    >
      sdfsad-{num}
    </span>
  )
}

// createRoot(document.querySelector('#app')!).render(<App />)

render(<App />, document.querySelector('#app')!)
// ReactDom.render(<App />, document.querySelector('#app')!)
