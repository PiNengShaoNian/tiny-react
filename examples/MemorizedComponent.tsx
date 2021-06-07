import React, { memo, useState } from '../packages/react'

const NormalComponent = () => {
  console.log('render NormalComponent')
  return <div>NormalComponent</div>
}

const MemorizedComponent = memo(() => {
  console.log('render MemorizedComponent')
  return <div>MemorizedComponent</div>
})

export const MemorizedComponentDemo = () => {
  const [count, setCount] = useState(0)
  return (
    <div>
      <MemorizedComponent />
      <NormalComponent />
      <button
        onClick={() => {
          setCount(count + 1)
        }}
      >
        incrment-{count}
      </button>
    </div>
  )
}
