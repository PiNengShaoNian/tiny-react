import React from '../packages/react'
import { createRoot } from '../packages/react-dom'

const App = () => {
  return (
    <div onClick={() => {}}>
      <span></span>
      {/* <span></span>
      <span></span>
      <span key="3">lsf</span> */}
    </div>
  )
}

createRoot(document.querySelector('#app')!).render(<App />)

// ReactDom.render(<App />, document.querySelector('#app')!)
