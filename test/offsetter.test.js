const { expect } = require('chai')

const noOffset = require('../src/offsetter/noOffset')
const skipper = require('../src/offsetter/skipper')
const noWhitespace = require('../src/offsetter/noWhitespace')

const custom = skipper(/\d+/y)

suite('offsetter', () => {
  suite('noOffset', () => {
    test('pass along the offset without any modification', () => {
      expect(noOffset('', 0)).to.deep.eql(0)
      expect(noOffset('', 10)).to.deep.eql(10)
    })
  })

  suite('skipper', () => {
    suite('noWhitspace', () => {
      test('skip whitespace - gives a new offset', () => {
        const offset = noWhitespace('  1', 0)

        expect(offset).to.deep.eql(2)
      })

      test('skip whitespace - nothing to skip use the same offset', () => {
        const offset = noWhitespace('1', 0)

        expect(offset).to.deep.eql(0)
      })
    })

    test('custom skipper skips all leading digits', () => {
      const offset = custom('123abc', 0)

      expect(offset).to.deep.eql(3)
    })

    test('pass along the offset when there are nothing to skip', () => {
      const offset = custom('abc', 0)

      expect(offset).to.deep.eql(0)
    })
  })
})
