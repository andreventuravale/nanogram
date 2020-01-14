const { expect } = require('chai')

const all = require('../src/offsetter/all')
const skipper = require('../src/offsetter/skipper')

suite('offsetters', () => {
  suite('all', () => {
    test('pass along the offset without any modification', () => {
      expect(all('', 0)).to.deep.eql(0)
      expect(all('', 10)).to.deep.eql(10)
    })
  })

  suite('skipper', () => {
    test('skip whitespace - gives a new offset', () => {
      const offset = skipper(/\s+/y)('  1', 0)

      expect(offset).to.deep.eql(2)
    })

    test('skip whitespace - nothing to skip use the same offset', () => {
      const offset = skipper(/\s+/y)('1', 0)

      expect(offset).to.deep.eql(0)
    })
  })
})
