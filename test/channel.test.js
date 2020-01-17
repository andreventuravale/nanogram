const { expect } = require('chai')

const channel = require('../src/channel')

suite('channel', () => {
  test('the default decorator does nothing', () => {
    const undecorated = channel
    const decorated = undecorated()
    const unoffsetted = decorated
    const offsetted = unoffsetted()
    const untransformed = offsetted('word', /\w+/y)
    const transformed = untransformed()

    expect(
      transformed('foo', 0)
    ).to.deep.eql({
      found: true,
      from: 0,
      to: 3,
      type: 'word',
      data: 'foo'
    })
  })

  test('decorator adds { foo: "bar" } to every produced result ( regardless success or fail )', () => {
    const undecorated = channel
    const decorated = undecorated(info => ({ ...info, foo: 'bar' }))
    const unoffsetted = decorated
    const offsetted = unoffsetted()
    const untransformed = offsetted('word', /\w+/y)
    const transformed = untransformed()

    expect(
      transformed('foo', 0)
    ).to.deep.eql({
      foo: 'bar',
      found: true,
      from: 0,
      to: 3,
      type: 'word',
      data: 'foo'
    })

    expect(
      transformed('@#$', 0)
    ).to.deep.eql({
      foo: 'bar',
      found: false,
      from: 0,
      to: 0,
      type: 'word',
      data: {}
    })
  })

  test('the default offsetter pass along the offset without any change', () => {
    const word = channel()()('word', / \w+ /y)()

    expect(
      word('  foo  ', 1)
    ).to.deep.eql({
      found: true,
      from: 1,
      to: 6,
      type: 'word',
      data: ' foo '
    })
  })

  suite('capture groups', () => {
    test('the full string match is returned in case there are no extra capture groups', () => {
      const source = '12345'

      const result = channel()()('num', /\d+/y)()(source, 0)

      expect(result).to.deep.eql({
        found: true,
        from: 0,
        to: 5,
        type: 'num',
        data: '12345'
      })
    })

    test('the capture groups are returned as $0..$N', () => {
      const source = '3.14'

      const result = channel()()('num', /(\d+)(.)(\d+)/y)()(source, 0)

      expect(result).to.deep.eql({
        found: true,
        from: 0,
        to: 4,
        type: 'num',
        data: {
          $0: '3.14',
          $1: '3',
          $2: '.',
          $3: '14'
        }
      })
    })
  })

  suite('transformation', () => {
    test('passing a transform function to a success case', () => {
      const source = '3.14'

      const untransformed = channel()()('num', /(\d+)(.)(\d+)/y)

      const transformed = untransformed(({ $1, $3 }) => `${$1},${$3}`)

      const result = transformed(source, 0)

      expect(result).to.deep.eql({
        found: true,
        from: 0,
        to: 4,
        type: 'num',
        data: '3,14'
      })
    })

    test('passing a transform function to a fail case', () => {
      const untransformed = channel()()('name', /bar/y)

      const transformed = untransformed((data, { found }) => found ? `did success` : `did fail`)

      const result = transformed('foo', 0)

      expect(result).to.deep.eql({
        found: false,
        from: 0,
        to: 0,
        type: 'name',
        data: 'did fail'
      })
    })
  })

  suite('given a fail case', () => {
    setup(function () {
      this.result = channel()()('space', /\s+/y)()('foo', 1)
    })

    test('the resulting start offset is the same as the input', function () {
      expect(this.result.from).to.deep.eql(1)
    })

    test('the resulting end offset is the same as the input', function () {
      expect(this.result.to).to.deep.eql(1)
    })

    test('the resulting data is an empty object hash', function () {
      expect(this.result.data).to.deep.eql({})
    })
  })

  test('type resulting function name is equal to the type', () => {
    const untransformed = channel()()('num', /(\d+)(.)(\d+)/y)

    const transformed = untransformed(({ $1, $3 }) => `${$1},${$3}`)

    expect(untransformed.name).to.deep.eql('num')

    expect(transformed.name).to.deep.eql('num')
  })

  suite('fail fast validation', () => {
    test('invalid types', () => {
      expect(() => channel()()(_ => _)).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => channel()()('')).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => channel()()('$')).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => channel()()('1')).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => channel()()([])).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => channel()()({})).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => channel()()(1)).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => channel()()(NaN)).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => channel()()(new Date())).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => channel()()(null)).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => channel()()(Number(0))).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => channel()()(true)).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => channel()()(undefined)).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
    })

    test('regex type checking', () => {
      expect(() => channel()()('digit', '\\d+')()('1', 0)).to.throw(`The regex is not instance of RegExp.`)
    })

    test(`the regex can't have the g flag`, () => {
      expect(() => channel()()('digit', /\d+/g)()('1', 0)).to.throw(`The regex g flag is not accepted.`)
    })

    test('the regex should always be sticky ( have y flag )', () => {
      expect(() => channel()()('digit', /\d+/)()('1', 0)).to.throw(`The regex must always have the y flag ( sticky ).`)
    })
  })
})
