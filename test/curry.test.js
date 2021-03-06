const { expect } = require('chai')

const curry = require('../src/curry')

suite('curry', () => {
  test('propagates the name of the original function', function () {
    function sumXY (x, y, z) {
      return x + y + z
    }

    const sumXYCurried = curry(sumXY)

    expect(sumXYCurried.name).to.deep.eql('sumXY')
    expect(sumXYCurried(1).name).to.deep.eql('sumXY')
    expect(sumXYCurried(1)(1).name).to.deep.eql('sumXY')
    expect(sumXYCurried(1)().name).to.deep.eql('sumXY')
    expect(sumXYCurried(1)(1).name).to.deep.eql('sumXY')
  })

  test('(1, 2) = (1)(2)', function () {
    const sum = curry((x, y) => x + y)
    expect(sum(1, 2)).to.deep.eql(sum(1)(2))
  })

  test('curring more times than the number of parameters throws an error', function () {
    const sum = curry((x, y) => x + y)
    try {
      sum(1)(2)()
      throw new Error('failed')
    } catch (ex) {
      expect(ex.message).to.contain('is not a function')
    }
  })
})
