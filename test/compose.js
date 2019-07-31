const { expect } = require('chai')

const { compose, token } = require('../src')

suite('compose', () => {
  test('proof of concept', () => {
    const number = token(/\d+/)

    const expr = compose(
      number,
      token(/\+/),
      number,
      token(/=/),
      number
    )

    const result = expr('1+22=333', 0)

    expect(result).to.eql([
      true,
      0,
      8,
      [
        [true, 0, 1, ['1']],
        [true, 1, 2, ['+']],
        [true, 2, 4, ['22']],
        [true, 4, 5, ['=']],
        [true, 5, 8, ['333']]
      ]
    ])
  })

  test('true - happy case', () => {
    const number = token(/\d/)

    const expr = compose(
      number(),
      token(/\+/),
      number(),
      token(/=/),
      number()
    )

    const result = expr('1+2=3', 0)

    expect(result).to.eql([
      true,
      0,
      5,
      [
        [true, 0, 1, ['1']],
        [true, 1, 2, ['+']],
        [true, 2, 3, ['2']],
        [true, 3, 4, ['=']],
        [true, 4, 5, ['3']]
      ]
    ])
  })

  test('false - empty composition', () => {
    const expr = compose()

    const result = expr('1', 0)

    expect(result).to.eql([false])
  })

  test('false - empty input', () => {
    const number = token(/\d/)

    const expr = compose(
      number()
    )

    const result = expr('', 0)

    expect(result).to.eql([false])
  })

  test('false - empth composition with empty input', () => {
    const expr = compose()

    const result = expr('', 0)

    expect(result).to.eql([false])
  })
})
