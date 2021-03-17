import React from '../packages/react'
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
  return (
    <span
      // onClick={() => {
      //   console.log('span bubble')
      // }}
      onClickCapture={() => {
        debugger
        console.log('span capture')
      }}
    >
      sdfsad
      {/* <Wrapper
        onClick={() => {
          console.log('wrapper bubble')
        }}
        onClickCapture={() => {
          console.log('wrapper capture')
        }}
      /> */}
    </span>
  )
}

createRoot(document.querySelector('#app')!).render(<App />)

// ReactDom.render(<App />, document.querySelector('#app')!)
