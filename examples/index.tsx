import React, { useState } from '../packages/react'
import { createRoot } from '../packages/react-dom'

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
        setNum(4)
      }}
    >
      sdfsad-{num}
    </span>
  )
}

createRoot(document.querySelector('#app')!).render(<App />)

// ReactDom.render(<App />, document.querySelector('#app')!)
