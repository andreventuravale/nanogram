const { expect } = require('chai')

const { token } = require('../src')

suite.only('token', () => {
  test('regex type checking', () => {
    expect(() => token('digit', '\\d+')()('1', 0)).to.throw(`The regex is not instance of RegExp.`)
  })

  test(`the regex can't have the g flag`, () => {
    expect(() => token('digit', /\d+/g)()('1', 0)).to.throw(`The regex g flag is not accepted.`)
  })

  test('the regex should always be sticky ( have y flag )', () => {
    expect(() => token('digit', /\d+/)()('1', 0)).to.throw(`The regex should always have the y flag ( sticky ).`)
  })

  suite('captures', () => {
    test('the full string match is returned in case there are no extra capture groups', () => {
      const source = '12345'

      const result = token('num', /\d+/y)()(source, 0)

      expect(result).to.eql([
        '12345',
        {
          found: true,
          from: 0,
          to: 5,
          type: 'num'
        }
      ])
    })

    test('the capture groups are returned as $0..$N', () => {
      const source = '3.14'

      const result = token('num', /(\d+)(.)(\d+)/y)()(source, 0)

      require('clipboardy').writeSync(JSON.stringify(result, 0, 2))

      expect(result).to.eql([
        {
          $0: '3.14',
          $1: '3',
          $2: '.',
          $3: '14'
        },
        {
          found: true,
          from: 0,
          to: 4,
          type: 'num'
        }
      ])
    })
  })

  suite('transforming', () => {
    test('true - passing a transform function', () => {
      const source = '3.14'

      const number = token('num', /(\d+)(.)(\d+)/y)

      const parse = number(({ $1, $3 }) => `${$1},${$3}`)

      const result = parse(source, 0)

      expect(result).to.eql(`3,14`)
    })

    test('false - passing a transform function', () => {
      const source = 'foo'

      const number = token('num', /bar/y)

      const parse = number(() => `did fail`)

      const result = parse(source, 0)

      expect(result).to.eql(`did fail`)
    })
  })

  suite('given a falsy result', () => {
    setup(function () {
      this.result = token('space', /\s+/y)()('foo', 1)
      this.data = this.result[0]
      this.info = this.result[1]
    })

    test('the resulting start offset is the same as the input', function () {
      expect(this.info.from).to.eql(1)
    })

    test('the resulting end offset is the same as the input', function () {
      expect(this.info.to).to.eql(1)
    })

    test('the resulting data is an empty array', function () {
      expect(this.data).to.eql({})
    })
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
