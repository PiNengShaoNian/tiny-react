import React from '../packages/react'
import { createRoot, render } from '../packages/react-dom'
import { PriorityScheduling } from './PriorityScheduling'
import { TimeSlicingDemo } from './TimeSlicing'
import { TodoList } from './TodoList'

// createRoot(document.querySelector('#app')!).render(<TodoList />)
createRoot(document.querySelector('#app')!).render(<PriorityScheduling />)
// render(<TimeSlicingDemo />, document.querySelector('#app')!)
