const { expect } = require('chai')

const { token } = require('../src')

suite('token', () => {
  // test pure function

  suite('given a falsy result', () => {
    setup(function () {
      this.result = token('space', /\s+/, 'foo', 1)
    })

    test('the resulting start offset is the same as the input', function () {
      expect(this.result[1]).to.eql(1)
    })

    test('the resulting end offset is the same as the input', function () {
      expect(this.result[2]).to.eql(1)
    })

    test('the resulting data is an empty array', function () {
      expect(this.result[4]).to.eql([])
    })
  })

  test('stateless regex', () => {
    const source = '123'

    const result = token('num', /\d+/, source, 0)

    expect(result).to.eql([true, 0, 3, 'num', ['123']])
  })

  test('stateless regex with offset', () => {
    const source = '123'

    const result = token('num', /\d+/, source, 1)

    expect(result).to.eql([true, 1, 3, 'num', ['23']])
  })

  test('global regex', () => {
    const source = '1 22 333'

    const result = token('num', /\d+/g, source, 2)

    expect(result).to.eql([true, 2, 4, 'num', ['22']])
  })

  test('sticky regex', () => {
    const source = '1 22 333'

    const result = token('num', /\d+/y, source, 2)

    expect(result).to.eql([true, 2, 4, 'num', ['22']])
  })

  test('captures', () => {
    const source = '3.14'

    const result = token('num', /(\d+)(.\d+)/y, source, 0)

    expect(result).to.eql([true, 0, 4, 'num', ['3.14', '3', '.14']])
  })

  suite('curry', () => {
    test('happy case', () => {
      expect(
        token('num')(/\d/)('1+2=3')(0)
      ).to.eql(
        token('num', /\d/, '1+2=3', 0)
      )
    })
  })
})
