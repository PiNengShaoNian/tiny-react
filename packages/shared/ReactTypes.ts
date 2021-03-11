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
