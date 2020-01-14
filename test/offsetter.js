const { expect } = require('chai')

const skipper = require('../src/offsetter/skipper')

suite('offsetters', () => {
  test('ignore whitespace', () => {
    const offset = skipper(/\s+/y)('  1', 0)

    expect(offset).to.deep.eql(2)
  })
})
