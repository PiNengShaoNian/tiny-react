import React from '../packages/react'
import { createRoot, render } from '../packages/react-dom'
import { PriorityScheduling } from './PriorityScheduling'
import { StateEffectDemo } from './StateAndEffect'
import { TimeSlicingDemo } from './TimeSlicing'
import { TodoList } from './TodoList'

// createRoot(document.querySelector('#app')!).render(<TodoList />)
createRoot(document.querySelector('#app')!).render(<PriorityScheduling />)
// createRoot(document.querySelector('#app')!).render(<StateEffectDemo />)
// render(<TimeSlicingDemo />, document.querySelector('#app')!)
