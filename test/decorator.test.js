const { expect } = require('chai')

const hidden = require('../src/decorator/hidden')

suite('decorator', () => {
  suite('hidden', () => {
    test('decorates the resulting info with the hidden flag set to true but does not change the original', () => {
      const info = { foo: 'bar' }

      const decoratedInfo = hidden(info)

      expect(info).to.deep.eql({ foo: 'bar' })

      expect(decoratedInfo).to.deep.eql({ foo: 'bar', hidden: true })
    })
  })
})
