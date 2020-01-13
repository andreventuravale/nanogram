const chai = require('chai')
const choose = require('../src/choose')
const token = require('../src/token')

chai.use(require('chai-subset'))

const { expect } = chai

suite('choice', () => {
  test('peeks an option given an list', () => {
    const choice = choose(
      'fruit',
      token('orange', /orange/y)(),
      token('apple', /apple/y)(),
      token('watermelon', /watermelon/y)()
    )

    const result = choice('orange', 0)

    expect(result).to.eql({
      found: true,
      from: 0,
      to: 6,
      type: 'fruit',
      data: [
        {
          found: true,
          from: 0,
          to: 6,
          type: 'orange',
          data: 'orange'
        }
      ]
    })
  })

  test('fail case', () => {
    const choice = choose(
      'fruit',
      token('orange', /orange/y),
      token('apple', /apple/y),
      token('watermelon', /watermelon/y)
    )

    const result = choice('strawberry', 0)

    expect(result).to.eql({
      found: false,
      from: 0,
      to: 0,
      type: 'fruit',
      data: []
    })
  })
})
