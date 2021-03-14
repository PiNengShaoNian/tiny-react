import { Fiber } from './ReactInternalTypes'

export const renderWithHooks = <Props, SecondArg>(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: (p: Props, arg: SecondArg) => any,
  props: Props,
  secondArg: SecondArg
) => {
  //调用函数组件，获取JSX对象
  let children = Component(props, secondArg)

  return children
}
