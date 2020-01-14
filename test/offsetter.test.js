const { expect } = require('chai')

const all = require('../src/offsetter/all')
const skipper = require('../src/offsetter/skipper')
const wsSkip = require('../src/offsetter/wsSkip')

const custom = skipper(/\d+/y)

suite('offsetter', () => {
  suite('all', () => {
    test('pass along the offset without any modification', () => {
      expect(all('', 0)).to.deep.eql(0)
      expect(all('', 10)).to.deep.eql(10)
    })
  })

  suite('skipper', () => {
    suite('whitspace', () => {
      test('skip whitespace - gives a new offset', () => {
        const offset = wsSkip('  1', 0)

        expect(offset).to.deep.eql(2)
      })

      test('skip whitespace - nothing to skip use the same offset', () => {
        const offset = wsSkip('1', 0)

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
