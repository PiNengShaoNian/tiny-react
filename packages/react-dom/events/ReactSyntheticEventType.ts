export type UnknownReactSyntheticEvent = {}

export type KnownReactSyntheticEvent = {}

export type ReactSyntheticEvent =
  | KnownReactSyntheticEvent
  | UnknownReactSyntheticEvent
