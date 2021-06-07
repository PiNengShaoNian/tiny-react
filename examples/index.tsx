import React from '../packages/react'
import { createRoot, render } from '../packages/react-dom'
import { LayoutEffectDemo } from './LayoutEffect'
import { PriorityScheduling } from './PriorityScheduling'
import { StateEffectDemo } from './StateAndEffect'
import { TimeSlicingDemo } from './TimeSlicing'
import { TodoList } from './TodoList'
import { ChildrenReconcilerDemo } from './ChildrenReconciler'
import { MemorizedComponentDemo } from './MemorizedComponent'

// createRoot(document.querySelector('#app')!).render(<MemorizedComponentDemo />)
// createRoot(document.querySelector('#app')!).render(<TodoList />)
// createRoot(document.querySelector('#app')!).render(<PriorityScheduling />)
// createRoot(document.querySelector('#app')!).render(<ChildrenReconcilerDemo />)
// createRoot(document.querySelector('#app')!).render(<LayoutEffectDemo />)
// createRoot(document.querySelector('#app')!).render(<StateEffectDemo />)
// createRoot(document.querySelector('#app')!).render(<TimeSlicingDemo />)
// render(<PriorityScheduling />, document.querySelector('#app')!)
// render(<StateEffectDemo />, document.querySelector('#app')!)
// render(<TimeSlicingDemo />, document.querySelector('#app')!)
