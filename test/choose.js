const chai = require('chai')
chai.use(require('chai-subset'))
const { expect } = chai

const { choose, token } = require('../src')

suite('choice', () => {
  test('peek an option given an group', () => {
    const choice = choose(
      'fruit',
      token('orange', /orange/),
      token('apple', /apple/),
      token('watermelon', /watermelon/)
    )

    const result = choice('orange', 0)

    expect(result).to.containSubset(
      {
        found: true,
        from: 0,
        to: 6,
        type: 'fruit',
        data: [
          { found: true, from: 0, to: 6, type: 'orange', data: ['orange'] }
        ]
      }
    )
  })

  test('fails', () => {
    const choice = choose(
      'fruit',
      token('orange', /orange/),
      token('apple', /apple/),
      token('watermelon', /watermelon/)
    )

    const result = choice('strawberry', 0)

    expect(result).to.containSubset(
      {
        found: false,
        from: 0,
        to: 0,
        type: 'fruit',
        data: []
      }
    )
  })
})
