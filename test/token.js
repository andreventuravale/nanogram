const { expect } = require('chai')

const { token } = require('../src')

suite('token', () => {
  suite('fail fast validation', () => {
    test('regex type checking', () => {
      expect(() => token('digit', '\\d+')()('1', 0)).to.throw(`The regex is not instance of RegExp.`)
    })

    test(`the regex can't have the g flag`, () => {
      expect(() => token('digit', /\d+/g)()('1', 0)).to.throw(`The regex g flag is not accepted.`)
    })

    test('the regex should always be sticky ( have y flag )', () => {
      expect(() => token('digit', /\d+/)()('1', 0)).to.throw(`The regex must always have the y flag ( sticky ).`)
    })
  })

  suite('capture groups', () => {
    test('the full string match is returned in case there are no extra capture groups', () => {
      const source = '12345'

      const result = token('num', /\d+/y)()(source, 0)

      expect(result).to.eql({
        found: true,
        from: 0,
        to: 5,
        type: 'num',
        data: '12345'
      })
    })

    test('the capture groups are returned as $0..$N', () => {
      const source = '3.14'

      const result = token('num', /(\d+)(.)(\d+)/y)()(source, 0)

      expect(result).to.eql({
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

  suite('transforming', () => {
    test('passing a transform function to a success case', () => {
      const source = '3.14'

      const untrasformed = token('num', /(\d+)(.)(\d+)/y)

      const transformed = untrasformed(({ $1, $3 }) => `${$1},${$3}`)

      const result = transformed(source, 0)

      expect(result).to.eql({
        found: true,
        from: 0,
        to: 4,
        type: 'num',
        data: '3,14'
      })
    })

    test('passing a transform function to a fail case', () => {
      const untransformed = token('name', /bar/y)

      const transformed = untransformed((data, { found }) => found ? `did success` : `did fail`)

      const result = transformed('foo', 0)

      expect(result).to.eql({
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
      this.result = token('space', /\s+/y)()('foo', 1)
    })

    test('the resulting start offset is the same as the input', function () {
      expect(this.result.from).to.eql(1)
    })

    test('the resulting end offset is the same as the input', function () {
      expect(this.result.to).to.eql(1)
    })

    test('the resulting data is an empty object hash', function () {
      expect(this.result.data).to.eql({})
    })
  })

  test('type resulting function name is equal to the type', () => {
    const untransformed = token('num', /(\d+)(.)(\d+)/y)

    const transformed = untransformed(({ $1, $3 }) => `${$1},${$3}`)

    expect(untransformed.name).to.eql('num')

    expect(transformed.name).to.eql('num')
  })

  suite('curry', () => {
    test('happy case', () => {
      expect(
        token('num')(/\d/y)()('1+2=3')(0)
      ).to.deep.eql(
        token('num', /\d/y)()('1+2=3', 0)
      )
    })
  })
})
