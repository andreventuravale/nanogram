const { expect } = require('chai')

const { token } = require('../src')

suite.only('token', () => {
  suite('given a falsy result', () => {
    setup(function () {
      this.result = token('space', /\s+/)()('foo', 1)
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

  test('stateless regex', () => {
    const source = '123'

    const result = token('num', /\d+/)()(source, 0)

    expect(result).to.eql([
      { $0: '123' },
      {
        found: true,
        from: 0,
        to: 3,
        type: 'num'
      }
    ])
  })

  test('stateless regex with offset', () => {
    const source = '123'

    const result = token('num', /\d+/)()(source, 1)

    expect(result).to.eql([
      { $0: '23' },
      {
        found: true,
        from: 1,
        to: 3,
        type: 'num'
      }
    ])
  })

  test('global regex', () => {
    const source = '1 22 333'

    const result = token('num', /\d+/g)()(source, 2)

    expect(result).to.eql([
      { $0: '22' },
      {
        found: true,
        from: 2,
        to: 4,
        type: 'num'
      }
    ])
  })

  test('sticky regex', () => {
    const source = '1 22 333'

    const result = token('num', /\d+/y)()(source, 2)

    expect(result).to.eql([
      { $0: '22' },
      {
        found: true,
        from: 2,
        to: 4,
        type: 'num'
      }
    ])
  })

  test('captures', () => {
    const source = '3.14'

    const result = token('num', /(\d+)(.\d+)/y)()(source, 0)

    expect(result).to.eql([
      {
        $0: '3.14',
        $1: '3',
        $2: '.14'
      },
      {
        found: true,
        from: 0,
        to: 4,
        type: 'num'
      }
    ])
  })

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

  suite('curry', () => {
    test('happy case', () => {
      expect(
        token('num')(/\d/)()('1+2=3')(0)
      ).to.deep.eql(
        token('num', /\d/)()('1+2=3', 0)
      )
    })
  })
})
