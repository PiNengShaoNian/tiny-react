import { CSSProperties } from 'react'
import React, { memo, useState, useEffect } from '../packages/react'

type Color = '#fff' | 'green'
type Component =
  | 'NestedComponent'
  | 'NormalComponent'
  | 'MemorizedComponentWithUnstableProps'
  | 'MemorizedNestedComponent'
  | 'MemorizedComponentWithCustomCompareFunc'
  | 'MemorizedComponent'

const prevColors: Record<Component, Color> = {
  NestedComponent: 'green',
  NormalComponent: 'green',
  MemorizedComponentWithUnstableProps: 'green',
  MemorizedNestedComponent: 'green',
  MemorizedComponentWithCustomCompareFunc: 'green',
  MemorizedComponent: 'green',
}

const useCurrentOutlineStyle = (componentName: Component): CSSProperties => {
  const currColor = prevColors[componentName] === '#fff' ? 'green' : '#fff'
  prevColors[componentName] = currColor
  return {
    outline: `1px solid ${currColor}`,
  }
}

const NormalComponent = () => {
  return (
    <div>
      NormalComponent
      <NestedComponent />
      <MemorizedNestedComponent />
    </div>
  )
}

const NestedComponent = () => {
  const outlineStyle = useCurrentOutlineStyle('NestedComponent')
  return <div style={outlineStyle}>-- NestedComponent</div>
}

const MemorizedNestedComponent = memo(() => {
  const outlineStyle = useCurrentOutlineStyle('MemorizedNestedComponent')

  return <div style={outlineStyle}>-- MemorizedNestedComponent</div>
})

const MemorizedComponent = memo(() => {
  const outlineStyle = useCurrentOutlineStyle('MemorizedComponent')

  return <div style={outlineStyle}>MemorizedComponent</div>
})

const MemorizedComponentWithUnstableProps = memo<{ count: number }>(
  ({ count }) => {
    const outlineStyle = useCurrentOutlineStyle(
      'MemorizedComponentWithUnstableProps'
    )

    return (
      <div style={outlineStyle}>
        MemorizedComponentWithUnstableProps {count}
      </div>
    )
  }
)

const MemorizedComponentWithCustomCompareFunc = memo<{ text: string }>(
  ({ text }) => {
    const outlineStyle = useCurrentOutlineStyle(
      'MemorizedComponentWithCustomCompareFunc'
    )

    return <div style={outlineStyle}>最大字符长度-8 {text}</div>
  },
  (oldProps, newProps) => newProps.text.length > 8
)

export const MemorizedComponentDemo = () => {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')
  return (
    <div>
      <MemorizedComponent />
      <br />
      <NormalComponent />
      <br />
      <MemorizedComponentWithUnstableProps count={count} />
      <br />
      <MemorizedComponentWithCustomCompareFunc text={text} />
      <br />
      <button
        onClick={() => {
          setCount(count + 1)
        }}
      >
        incrment-{count}
      </button>
      <br />
      <input
        placeholder="输入"
        onChange={(e) => {
          setText(e.target.value)
        }}
      />
    </div>
  )
}
