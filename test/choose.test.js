const chai = require('chai')
const choose = require('../src/choose')
const channel = require('../src/channel')

const { expect } = chai

suite('choice', () => {
  test('peeks an option given an list', () => {
    const choice = choose(
      'fruit',
      channel()()('orange', /orange/y)(),
      channel()()('apple', /apple/y)(),
      channel()()('watermelon', /watermelon/y)()
    )()

    const result = choice('orange', 0)

    expect(result).to.deep.eql({
      found: true,
      from: 0,
      to: 6,
      type: 'fruit',
      data: {
        found: true,
        from: 0,
        to: 6,
        type: 'orange',
        data: 'orange'
      }
    })
  })

  test('fail to peek an option', () => {
    const choice = choose(
      'fruit',
      channel()()('orange', /orange/y)(),
      channel()()('apple', /apple/y)(),
      channel()()('watermelon', /watermelon/y)()
    )()

    const result = choice('strawberry', 0)

    expect(result).to.deep.eql({
      found: false,
      from: 0,
      to: 0,
      type: 'fruit',
      data: {}
    })
  })

  test('transformation on both success and fail', () => {
    const choice = choose(
      'fruit',
      channel()()('orange', /orange/y)(),
      channel()()('apple', /apple/y)(),
      channel()()('watermelon', /watermelon/y)()
    )(({ data }, { found }) => found ? data : 'banana')

    expect(
      choice('orange', 0)
    ).to.deep.eql({
      found: true,
      from: 0,
      to: 6,
      type: 'fruit',
      data: 'orange'
    })

    expect(
      choice('strawberry', 0)
    ).to.deep.eql({
      found: false,
      from: 0,
      to: 0,
      type: 'fruit',
      data: 'banana'
    })
  })
})
