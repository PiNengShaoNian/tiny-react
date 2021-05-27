import React from '../packages/react'

describe('ReactElement', () => {
  const FunctionComponent = () => {
    return <div></div>
  }
  it('returns a complete element according to spec', () => {
    const element = React.createElement(FunctionComponent)
    expect(element.type).toBe(FunctionComponent)
    expect(element.key).toBe(null)

    expect(element.props).toEqual({})
  })

  it('allows a string to be passed as the type', () => {
    const element = React.createElement('div')
    expect(element.type).toBe('div')
    expect(element.key).toBe(null)
    expect(element.props).toEqual({})
  })

  it('does not reuse the original config object', () => {
    const config = { foo: 1 }
    const element = React.createElement(FunctionComponent, config)
    expect(element.props.foo).toBe(1)
    config.foo = 2
    expect(element.props.foo).toBe(1)
  })

  it('does not fail if config has no prototype', () => {
    const config = Object.create(null, { foo: { value: 1, enumerable: true } })
    const element = React.createElement(FunctionComponent, config)
    expect(element.props.foo).toBe(1)
  })

  it('extracts key and ref from the config', () => {
    const element = React.createElement(FunctionComponent, {
      key: '12',
      ref: '34',
      foo: '56',
    })
    expect(element.type).toBe(FunctionComponent)
    expect(element.key).toBe('12')
    expect(element.props).toEqual({ foo: '56' })
  })

  it('extracts null key and ref', () => {
    const element = React.createElement(FunctionComponent, {
      key: null,
      ref: null,
      foo: '12',
    })
    expect(element.type).toBe(FunctionComponent)
    expect(element.key).toBe('null')
    expect(element.props).toEqual({ foo: '12' })
  })

  it('ignores undefined key and ref', () => {
    const props = {
      foo: '56',
      key: undefined,
      ref: undefined,
    }
    const element = React.createElement(FunctionComponent, props)
    expect(element.type).toBe(FunctionComponent)
    expect(element.key).toBe(null)
    expect(element.props).toEqual({ foo: '56' })
  })

  it('coerces the key to a string', () => {
    const element = React.createElement(FunctionComponent, {
      key: 12,
      foo: '56',
    })
    expect(element.type).toBe(FunctionComponent)
    expect(element.key).toBe('12')
    expect(element.props).toEqual({ foo: '56' })
  })

  it('merges an additional argument onto the children prop', () => {
    const a = 1
    const element = React.createElement(
      FunctionComponent,
      {
        children: 'text',
      },
      a
    )
    expect(element.props.children).toBe(a)
  })

  it('does not override children if no rest args are provided', () => {
    const element = React.createElement(FunctionComponent, {
      children: 'text',
    })
    expect(element.props.children).toBe('text')
  })

  it('overrides children if null is provided as an argument', () => {
    const element = React.createElement(
      FunctionComponent,
      {
        children: 'text',
      },
      null
    )
    expect(element.props.children).toBe(null)
  })

  it('merges rest arguments onto the children prop in an array', () => {
    const a = 1
    const b = 2
    const c = 3
    const element = React.createElement(FunctionComponent, null as any, a, b, c)
    expect(element.props.children).toEqual([1, 2, 3])
  })

  // NOTE: We're explicitly not using JSX here. This is intended to test
  // classic JS without JSX.
  it('is indistinguishable from a plain object', () => {
    const element = React.createElement('div', { className: 'foo' })
    const object = {}
    expect(element.constructor).toBe(object.constructor)
  })
})
