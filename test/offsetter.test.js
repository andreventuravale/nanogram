const { expect } = require('chai')

const skipper = require('../src/offsetter/skipper')

suite('offsetters', () => {
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
