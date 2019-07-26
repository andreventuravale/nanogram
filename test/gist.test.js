const { expect } = require('chai')

const { compose, many, regex, text } = require('../src')

suite('gist', () => {
  suite('curry', () => {
    test('happy case', () => {
      expect(regex(/\d/)('1+2=3')(0)).to.eql(regex(/\d/, '1+2=3', 0))
    })
  })

  suite('compose', () => {
    test('true - happy case', () => {
      const number = regex(/\d/)

      const expr = compose(
        number(),
        text('+'),
        number(),
        text('='),
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
      const number = regex(/\d/)

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

  suite('regex', () => {
    test('true at begin of input', () => {
      const source = '1+2=3'

      const result = regex(/\d/, source, 0)

      expect(result).to.eql([true, 0, 1])
    })

    test('true at end of input - regex without global flag', () => {
      const source = '1+22=333'

      const result = regex(/\d/, source, 5)

      expect(result).to.eql([true, 5, 8])
    })

    test('true at end of input - regex with global flag', () => {
      const source = '1+22=333'

      const result = regex(/\d/g, source, 5)

      expect(result).to.eql([true, 5, 8])
    })
  })

  suite('text', () => {
    test('true at begin of input', () => {
      const source = 'foo=bar'

      const result = text('foo', source, 0)

      expect(result).to.eql([true, 0, 3])
    })

    test('true at end of input', () => {
      const source = 'foo=bar'

      const result = text('bar', source, 4)

      expect(result).to.eql([true, 4, 7])
    })

    test('false due to end of input', () => {
      const source = 'foo=ba'

      const result = text('bar', source, 4)

      expect(result).to.eql([false])
    })

    test('false due to mismatch', () => {
      const source = 'foo=bar'

      const result = text('qux', source, 4)

      expect(result).to.eql([false])
    })

    test('false due to offset past end of input', () => {
      const source = 'foo=bar'

      const result = text('bar', source, 1)

      expect(result).to.eql([false])
    })
  })

  suite.skip('many', () => {
    test('true - happy case', () => {
      const source = '1,2,3'

      const element = (input, offset) => regex(/\d/, input, offset)

      const separator = (input, offset) => regex(/,/, input, offset)

      expect(many(element, separator, source, 0)).to.eql([true, 0, 5])
    })

    test('true - single element', () => {
      const source = '1'

      const element = (input, offset) => regex(/\d/, input, offset)

      const separator = (input, offset) => regex(/,/, input, offset)

      expect(many(element, separator, source, 0)).to.eql([true, 0, 1])
    })

    test('true - ignores the last separator with no subsequent element', () => {
      const source = '1,2,'

      const element = (input, offset) => regex(/\d/, input, offset)

      const separator = (input, offset) => regex(/,/, input, offset)

      expect(many(element, separator, source, 0)).to.eql([true, 0, 3])
    })

    test('false - empty input', () => {
      const source = ''

      const element = (input, offset) => regex(/\d/, input, offset)

      const separator = (input, offset) => regex(/,/, input, offset)

      expect(many(element, separator, source, 0)).to.eql([false])
    })
  })
})
