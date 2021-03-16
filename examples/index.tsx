import React from '../packages/react'
import { createRoot } from '../packages/react-dom'

const Wrapper = () => <div>wrapper</div>

const App = () => {
  return (
    <span>
      <Wrapper />
      <div>sdf</div>
      <div>
        <a>sldfj</a>
        <a>sldfj</a>
        <a>sldfj</a>
        <div>sdlf</div>
        sdfsd
      </div>
    </span>
  )
}

createRoot(document.querySelector('#app')!).render(<App />)

// ReactDom.render(<App />, document.querySelector('#app')!)
