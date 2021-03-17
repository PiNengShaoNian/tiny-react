export const createSyntheticEvent = () => {
  class SyntheticBaseEvent {}

  return SyntheticBaseEvent
}

export const SyntheticEvent = createSyntheticEvent()

export const SyntheticMouseEvent = createSyntheticEvent()
