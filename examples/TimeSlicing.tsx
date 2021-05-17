/**
 *  打开performance查看Concurrent Mode下render阶段的时间切片
 */

import React from '../packages/react'

const data = Array.from({ length: 5e4 }, (_, i) => i)

export const TimeSlicingDemo = () => {
  return (
    <div>
      {data.map((v) => (
        <li key={v}>{v}</li>
      ))}
    </div>
  )
}
