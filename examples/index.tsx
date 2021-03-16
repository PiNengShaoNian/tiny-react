import React from '../packages/react'
import { createRoot } from '../packages/react-dom'

const Wrapper = () => <div>wrapper</div>

const App = () => {
  return (
    <span>
      <Wrapper />
      <div>sdf</div>
    </span>
  )
}

createRoot(document.querySelector('#app')!).render(<App />)

// ReactDom.render(<App />, document.querySelector('#app')!)
