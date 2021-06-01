/**
 * 用来测试是子元素的diff是否正确
 */

import React, { useState } from '../packages/react'

const NotReuseFiberWhenTypeChange = () => {
  const [isShowDiv, setIsShowDiv] = useState(true)

  return (
    <div>
      {isShowDiv ? <div>test</div> : <p>test</p>}
      <button
        onClick={() => {
          setIsShowDiv(!isShowDiv)
        }}
      >
        toggle
      </button>
    </div>
  )
}

const ResetContentWhenTextChildrenChangeToOther = () => {
  const [isShowText, setIsShowText] = useState(false)

  return (
    <div>
      <button
        onClick={() => {
          setIsShowText(!isShowText)
        }}
      >
        toggle
      </button>
      <div>{isShowText ? <div>div</div> : 'Directed Text'}</div>
    </div>
  )
}

export const ChildrenReconcilerDemo = () => {
  return (
    <div>
      NotReuseFiberWhenTypeChange
      <NotReuseFiberWhenTypeChange />
      <br />
      ResetContentWhenNormalChildrenChangeToText
      <ResetContentWhenTextChildrenChangeToOther />
    </div>
  )
}
