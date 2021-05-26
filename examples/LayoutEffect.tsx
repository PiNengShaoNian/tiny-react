import { CSSProperties } from 'react'
import React, { useState, useEffect } from '../packages/react'

const shuffleArray = (array: number[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    let temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

const previousLayoutInfo: DOMRect[] = Array.from({ length: 25 })
const colors = [
  '#0351C1',
  '#01142F',
  '#51EAFF',
  '#45D09E',
  '#116315',
  '#CBE724',
  '#FFD600',
  '#F85C50',
  '#FFDFDC',
  '#EF2FA2',
  '#2F3640',
  '#7367F0',
  '#0070A5',
  '#9CBAED',
  '#74F6F7',
  '#FDDB92',
  '#00C6FF',
  '#98E5D9',
  '#89D405',
  '#511414',
  '#B4B0BE',
  '#FF9966',
  '#00C9FF',
  '#2F0166',
  '#4A00E0',
]

export const LayoutEffectDemo = () => {
  const [list, setList] = useState(Array.from({ length: 25 }, (_, i) => i))

  useEffect(() => {
    if (!previousLayoutInfo[0]) return
    const currentLayoutInfo: DOMRect[] = Array.from({ length: 25 })
    const gridItems = document.querySelectorAll<HTMLDivElement>('.grid-item')
    const indexKeyToElementMap: Map<number, HTMLDivElement> = new Map()
    for (let i = 0; i < gridItems.length; ++i) {
      currentLayoutInfo[gridItems[i].textContent as any] =
        gridItems[i].getBoundingClientRect()
      indexKeyToElementMap.set(+gridItems[i].textContent!, gridItems[i])
    }

    console.log(currentLayoutInfo)

    for (let i = 0; i < currentLayoutInfo.length; ++i) {
      const firstRect = previousLayoutInfo[i]
      const lastRect = currentLayoutInfo[i]
      const lastEl = indexKeyToElementMap.get(i)!
      lastEl.animate(
        [
          {
            transform: `
                translateX(${firstRect.left - lastRect.left}px)
                translateY(${firstRect.top - lastRect.top}px)
                scale(${firstRect.width / lastRect.width})
              `,
          },
          {
            transform: `
                translateX(0)
                translateY(0)
                scale(1)
               `,
          },
        ],
        {
          duration: 600,
          easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
        }
      )
    }
  }, [list])

  const shuffle = () => {
    const next = [...list]
    //在做dom变更前先记录下此时的layout信息
    const gridItems = document.querySelectorAll('.grid-item')

    for (let i = 0; i < gridItems.length; ++i) {
      previousLayoutInfo[gridItems[i].textContent as any] =
        gridItems[i].getBoundingClientRect()
    }
    console.log(previousLayoutInfo)
    shuffleArray(next)
    setList(next)
  }

  return (
    <div>
      <button onClick={shuffle}>shuffle</button>
      <div style={styles.grid}>
        {list.map((v) => {
          return (
            <div className="grid-item" style={gridItemStyles[v]} key={v}>
              {v}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles: { [key: string]: CSSProperties } = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    rowGap: 20,
    columnGap: 20,
    maxWidth: 800,
  },
  gridItem: {
    height: 100,
    width: 100,
    background: 'indigo',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}

const gridItemStyles = colors.map((v) => ({ ...styles.gridItem, background: v }))
