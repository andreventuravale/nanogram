const { expect } = require('chai')

const hide = require('../src/decorator/hide')

suite('decorator', () => {
  suite('hide', () => {
    test('decorates the result with the hide flag set to true but does not change the original data', () => {
      const foo = {}
      const bar = hide(foo)
      expect(foo).to.deep.eql({})
      expect(bar).to.deep.eql({ hide: true })
    })
  })
})
