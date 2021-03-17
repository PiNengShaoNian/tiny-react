export type ReactEmpty = null | void | boolean

export type ReactText = string | number

export type Key = string | number

export interface ReactElement<
  P = any,
  T extends string | JSXElementConstructor<any> =
    | string
    | JSXElementConstructor<any>
> {
  type: T
  props: P
  key: Key | null
}

export type JSXElementConstructor<P> = (props: P) => ReactElement | null

export type ReactNode = ReactElement | ReactText

export type ReactNodeList = ReactEmpty | ReactElement

export type EventPriority = 0 | 1 | 2

/**
 * click、keydown、focusin等，这些事件的触发不是连续的，优先级为0。
 */
export const DiscreteEvent: EventPriority = 0
/**
 * drag、scroll、mouseover等，特点是连续触发，阻塞渲染，优先级为1。
 */
export const UserBlockingEvent: EventPriority = 1
/**
 * canplay、error、audio标签的timeupdate和canplay，优先级最高，为2。
 */
export const ContinuousEvent: EventPriority = 2
