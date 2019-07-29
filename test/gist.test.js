const { expect } = require('chai')

const { compose, list, one } = require('../src')

suite('gist', () => {
  suite('curry', () => {
    test('happy case', () => {
      expect(one(/\d/)('1+2=3')(0)).to.eql(one(/\d/, '1+2=3', 0))
    })
  })

  suite.skip('compose', () => {
    test('proof of concept', () => {
      const number = one(/\d+/)

      const expr = compose(
        number,
        one(/\+/),
        number,
        one(/=/),
        number
      )

      const result = expr('1+22=333', 0)

      expect(result).to.eql([true, 0, 8, [
        [true, 0, 1],
        [true, 1, 2],
        [true, 2, 4],
        [true, 4, 5],
        [true, 5, 8]
      ]])
    })

    test('true - happy case', () => {
      const number = one(/\d/)

      const expr = compose(
        number(),
        one(/\+/),
        number(),
        one(/=/),
        number()
      )

      const result = expr('1+2=3', 0)

      expect(result).to.eql([true, 0, 5, [
        [true, 0, 1],
        [true, 1, 2],
        [true, 2, 3],
        [true, 3, 4],
        [true, 4, 5]
      ]])
    })

    test('false - empty composition', () => {
      const expr = compose()

      const result = expr('1', 0)

      expect(result).to.eql([false])
    })

    test('false - empty input', () => {
      const number = one(/\d/)

      const expr = compose(
        number()
      )

      const result = expr('', 0)

      expect(result).to.eql([false])
    })

    test('false - empth composition with empty input', () => {
      const expr = compose()

      const result = expr('', 0)

      expect(result).to.eql([false])
    })
  })

  suite.only('one', () => {
    // test pure function

    test('stateless regex', () => {
      const source = '123'

      const result = one(/\d+/, source, 0)

      expect(result).to.eql([true, 0, 3, ['123']])
    })

    test('stateless regex with offset', () => {
      const source = '123'

      const result = one(/\d+/, source, 1)

      expect(result).to.eql([true, 1, 3, ['23']])
    })

    test('global regex', () => {
      const source = '1 22 333'

      const result = one(/\d+/g, source, 2)

      expect(result).to.eql([true, 2, 4, ['22']])
    })

    test('sticky regex', () => {
      const source = '1 22 333'

      const result = one(/\d+/y, source, 2)

      expect(result).to.eql([true, 2, 4, ['22']])
    })
  })

  suite('list', () => {
    test.only('true - happy case', () => {
      const source = '1,2,3'

      const element = (input, offset) => one(/\d/, input, offset)

      const separator = (input, offset) => one(/,/, input, offset)

      expect(list(element, separator, source, 0)).to.eql([
        true,
        0,
        5,
        [
          [true, 0, 1, ['1']],
          [true, 2, 3, ['2']],
          [true, 4, 5, ['3']]
        ]
      ])
    })

    test('true - single element', () => {
      const source = '1'

      const element = (input, offset) => one(/\d/, input, offset)

      const separator = (input, offset) => one(/,/, input, offset)

      expect(list(element, separator, source, 0)).to.eql([true, 0, 1])
    })

    test('true - ignores the last separator with no subsequent element', () => {
      const source = '1,2,'

      const element = (input, offset) => one(/\d/, input, offset)

      const separator = (input, offset) => one(/,/, input, offset)

      expect(list(element, separator, source, 0)).to.eql([true, 0, 3])
    })

    test('false - empty input', () => {
      const source = ''

      const element = (input, offset) => one(/\d/, input, offset)

      const separator = (input, offset) => one(/,/, input, offset)

      expect(list(element, separator, source, 0)).to.eql([false])
    })
  })
})
