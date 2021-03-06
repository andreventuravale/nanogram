const chai = require('chai')
const { expect } = chai

const channel = require('../src/channel')
const optional = require('../src/optional')

suite('optional', () => {
  test('when missing it returns not found but with an ignored flag set to true', () => {
    const foo = channel()()('foo', /foo/y)()

    expect(
      foo('foo', 0)
    ).to.deep.eql({
      found: true,
      from: 0,
      to: 3,
      type: 'foo',
      data: 'foo'
    })

    expect(
      foo('bar', 0)
    ).to.deep.eql({
      found: false,
      from: 0,
      to: 0,
      type: 'foo',
      data: {}
    })

    expect(
      optional(foo)('bar', 0)
    ).to.deep.eql({
      found: false,
      ignored: true,
      from: 0,
      to: 0,
      type: 'foo',
      data: {}
    })
  })

  test('when found the result is just passed along from the original element', () => {
    const foo = channel()()('foo', /foo/y)()

    expect(
      foo('foo', 0)
    ).to.deep.eql({
      found: true,
      from: 0,
      to: 3,
      type: 'foo',
      data: 'foo'
    })

    expect(
      optional(foo)('foo', 0)
    ).to.deep.eql({
      found: true,
      from: 0,
      to: 3,
      type: 'foo',
      data: 'foo'
    })
  })

  // TODO: fail fast validation: more than one argument passed ; first argument is not a function
})
