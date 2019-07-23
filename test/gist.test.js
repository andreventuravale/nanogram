const { expect } = require('chai')

const { compose, many, regex, text } = require('../src')

suite('gist', () => {
  // suite('compose', () => {
  //   test('true - happy case', () => {
  //     const number = regex(/\d/)

  //     compose(
  //       number(),
  //       text('+'),
  //       number(),
  //       text('='),
  //       number()
  //     )

  //     const source = '1+2=3'

  //     const result = regex(source, 0, /\d/)

  //     expect(result).to.eql([true, 0, 1])
  //   })
  // })

  suite('regex', () => {
    test('true at begin of input', () => {
      const source = '1+2=3'

      const result = regex(source, 0, /\d/)

      expect(result).to.eql([true, 0, 1])
    })

    test('true at end of input - regex without global flag', () => {
      const source = '1+22=333'

      const result = regex(source, 5, /\d/)

      expect(result).to.eql([true, 5, 8])
    })

    test('true at end of input - regex with global flag', () => {
      const source = '1+22=333'

      const result = regex(source, 5, /\d/g)

      expect(result).to.eql([true, 5, 8])
    })
  })

  suite('text', () => {
    test('true at begin of input', () => {
      const source = 'foo=bar'

      const result = text(source, 0, 'foo')

      expect(result).to.eql([true, 0, 3])
    })

    test('true at end of input', () => {
      const source = 'foo=bar'

      const result = text(source, 4, 'bar')

      expect(result).to.eql([true, 4, 7])
    })

    test('false due to end of input', () => {
      const source = 'foo=ba'

      const result = text(source, 4, 'bar')

      expect(result).to.eql([false])
    })

    test('false due to mismatch', () => {
      const source = 'foo=bar'

      const result = text(source, 4, 'qux')

      expect(result).to.eql([false])
    })

    test('false due to offset past end of input', () => {
      const source = 'foo=bar'

      const result = text(source, 100, 'bar')

      expect(result).to.eql([false])
    })
  })

  suite('many', () => {
    test('true - happy case', () => {
      const source = '1,2,3'

      const element = (input, offset) => regex(input, offset, /\d/)

      const separator = (input, offset) => regex(input, offset, /,/)

      expect(many(source, 0, element, separator)).to.eql([true, 0, 5])
    })

    test('true - single element', () => {
      const source = '1'

      const element = (input, offset) => regex(input, offset, /\d/)

      const separator = (input, offset) => regex(input, offset, /,/)

      expect(many(source, 0, element, separator)).to.eql([true, 0, 1])
    })

    test('true - ignores the last separator with no subsequent element', () => {
      const source = '1,2,'

      const element = (input, offset) => regex(input, offset, /\d/)

      const separator = (input, offset) => regex(input, offset, /,/)

      expect(many(source, 0, element, separator)).to.eql([true, 0, 3])
    })

    test('false - empty input', () => {
      const source = ''

      const element = (input, offset) => regex(input, offset, /\d/)

      const separator = (input, offset) => regex(input, offset, /,/)

      expect(many(source, 0, element, separator)).to.eql([false])
    })
  })
})
