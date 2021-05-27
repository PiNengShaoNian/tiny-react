import React from '../packages/react'

describe('ReactJSXElement', () => {
  let Component: Function
  beforeEach(() => {
    Component = () => {
      return <div></div>
    }
  })
  it('returns a complete element according to spec', () => {
    const element = <Component />
    expect(element.type).toBe(Component)
    expect(element.key).toBe(null)
    const expectation = {}
    Object.freeze(expectation)
    expect(element.props).toEqual(expectation)
  })

  it('allows a lower-case to be passed as the string type', () => {
    const element = <div />
    expect(element.type).toBe('div')
    expect(element.key).toBe(null)
    const expectation = {}
    Object.freeze(expectation)
    expect(element.props).toEqual(expectation)
  })

  it('allows a string to be passed as the type', () => {
    const TagName = 'div'
    const element = <TagName />
    expect(element.type).toBe('div')
    expect(element.key).toBe(null)
    const expectation = {}
    Object.freeze(expectation)
    expect(element.props).toEqual(expectation)
  })

  it('does not reuse the object that is spread into props', () => {
    const config = { foo: 1 }
    const element = <Component {...config} />
    expect(element.props.foo).toBe(1)
    config.foo = 2
    expect(element.props.foo).toBe(1)
  })

  it('extracts key and ref from the rest of the props', () => {
    const element = <Component key="12" ref="34" foo="56" />
    expect(element.type).toBe(Component)
    expect(element.key).toBe('12')
    const expectation = { foo: '56' }
    Object.freeze(expectation)
    expect(element.props).toEqual(expectation)
  })

  it('coerces the key to a string', () => {
    const element = <Component key={12} foo="56" />
    expect(element.type).toBe(Component)
    expect(element.key).toBe('12')
    const expectation = { foo: '56' }
    Object.freeze(expectation)
    expect(element.props).toEqual(expectation)
  })

  it('does not override children if no JSX children are provided', () => {
    const element = <Component children="text" />
    expect(element.props.children).toBe('text')
  })

  it('merges JSX children onto the children prop in an array', () => {
    const a = 1
    const b = 2
    const c = 3
    const element = (
      <Component>
        {a}
        {b}
        {c}
      </Component>
    )
    expect(element.props.children).toEqual([1, 2, 3])
  })

  it('is indistinguishable from a plain object', () => {
    const element = <div className="foo" />
    const object = {}
    expect(element.constructor).toBe(object.constructor)
  })
})
