const { expect } = require('chai')

const hidden = require('../src/decorator/hidden')

suite('decorator', () => {
  suite('hidden', () => {
    test('decorates the result with the hidden flag set to true but does not change the original data', () => {
      const foo = {}
      const bar = hidden(foo)
      expect(foo).to.deep.eql({})
      expect(bar).to.deep.eql({ hidden: true })
    })
  })
})
