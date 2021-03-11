import React from '../packages/react'
import ReactDom from '../packages/react-dom'

const App = () => {
  return (
    <div onClick={() => {}}>
      <span></span>
      <span></span>
      <span></span>
      <span key="3">lsf</span>
    </div>
  )
}

ReactDom.render(<App />, document.querySelector('#app')!)
