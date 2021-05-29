import React from '../packages/react'
import { createRoot, render } from '../packages/react-dom'
import { LayoutEffectDemo } from './LayoutEffect'
import { PriorityScheduling } from './PriorityScheduling'
import { StateEffectDemo } from './StateAndEffect'
import { TimeSlicingDemo } from './TimeSlicing'
import { TodoList } from './TodoList'

// createRoot(document.querySelector('#app')!).render(<TodoList />)
// createRoot(document.querySelector('#app')!).render(<PriorityScheduling />)
// createRoot(document.querySelector('#app')!).render(<LayoutEffectDemo />)
// createRoot(document.querySelector('#app')!).render(<StateEffectDemo />)
// render(<PriorityScheduling />, document.querySelector('#app')!)
render(<StateEffectDemo />, document.querySelector('#app')!)
// render(<TimeSlicingDemo />, document.querySelector('#app')!)
