import React from '../packages/react'
import { createRoot, render } from '../packages/react-dom'
import { TimeSlicingDemo } from './TimeSlicing'
import { TodoList } from './TodoList'

createRoot(document.querySelector('#app')!).render(<TodoList />)
// render(<TimeSlicingDemo />, document.querySelector('#app')!)
