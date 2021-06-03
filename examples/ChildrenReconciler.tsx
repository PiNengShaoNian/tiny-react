/**
 * 用来测试子元素的diff是否正确
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

const TriggerUpdate = () => {
  const [count, setCount] = useState(0)

  return (
    <div>
      {count}
      <button
        onClick={() => {
          setCount(count + 1)
        }}
      >
        increment
      </button>
    </div>
  )
}

const BubbleFlagsOnChildrenOfBailoutComponent = () => {
  return (
    <ul>
      <TriggerUpdate />
    </ul>
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

const UpdateTextNodeDemo = () => {
  const [count, setCount] = useState(0)
  return (
    <div>
      <div>{count}-</div>
      <button
        onClick={() => {
          setCount(count + 1)
        }}
      >
        increment
      </button>
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
      <br />
      UpdateTextNodeDemo
      <UpdateTextNodeDemo />
      <br />
      BubbleFlagsOnChildrenOfBailoutHostComponent
      <BubbleFlagsOnChildrenOfBailoutComponent />
    </div>
  )
}
