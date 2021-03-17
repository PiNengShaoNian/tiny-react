import { DOMEventName } from './DOMEventNames'

export const allNativeEvents: Set<DOMEventName> = new Set()

/**
 * Mapping from registration name to event name
 */
export const registrationNameDependencies: Record<string, DOMEventName[]> = {}

export const registerDirectEvent = (
  registrationName: string,
  dependencies: DOMEventName[]
) => {
  if (registrationNameDependencies[registrationName]) {
    console.error(
      'EventRegistry: More than one plugin attempted to publish the same ' +
        'registration name, `%s`.',
      registrationName
    )
  }

  registrationNameDependencies[registrationName] = dependencies

  for (let i = 0; i < dependencies.length; ++i) {
    allNativeEvents.add(dependencies[i])
  }
}

export const registerTwoPhaseEvent = (
  registrationName: string,
  dependencies: DOMEventName[]
): void => {
  registerDirectEvent(registrationName, dependencies)
  registerDirectEvent(registrationName + 'Capture', dependencies)
}
