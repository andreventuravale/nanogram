const { expect } = require('chai')

const { compose, token } = require('../src')

suite('compose', () => {
  test('true - happy case', () => {
    const number = token('num', /\d+/)

    const expr = compose(
      'calc',
      number,
      token('op', /\+/),
      number,
      token('op', /=/),
      number
    )

    const result = expr('1+22=333', 0)

    expect(result).to.eql([
      true,
      0,
      8,
      'calc',
      [
        [true, 0, 1, 'num', ['1']],
        [true, 1, 2, 'op', ['+']],
        [true, 2, 4, 'num', ['22']],
        [true, 4, 5, 'op', ['=']],
        [true, 5, 8, 'num', ['333']]
      ]
    ])
  })

  test('true - keyed results', () => {
    const number = token('num', /\d+/)

    const expr = compose(
      'calc',
      number,
      token('plus', /\+/),
      number,
      token('equals', /=/),
      number
    )

    const result = expr('1+22=333', 0)

    expect(result.num).to.eql([
      [true, 0, 1, 'num', ['1']],
      [true, 2, 4, 'num', ['22']],
      [true, 5, 8, 'num', ['333']]
    ])

    expect(result.plus).to.eql([
      [true, 1, 2, 'plus', ['+']]
    ])

    expect(result.equals).to.eql([
      [true, 4, 5, 'equals', ['=']]
    ])
  })

  test('false - incomplete', () => {
    const digit = token('digit', /\d/)
    const letter = token('letter', /[a-z]/i)

    const expr = compose(
      'expr',
      digit,
      letter,
      digit
    )

    const result = expr('123', 0)

    expect(result).to.eql(
      [
        false,
        0,
        1,
        'expr',
        [
          [true, 0, 1, 'digit', ['1']]
        ]
      ]
    )
  })

  test('false - empty composition', () => {
    const expr = compose('foo')

    const result = expr('1', 1)

    expect(result).to.eql([false, 1, 1, 'foo', []])
  })

  test('false - empty input', () => {
    const number = token('digit', /\d/)

    const expr = compose(
      'expr',
      number()
    )

    const result = expr('', 1)

    expect(result).to.eql([false, 1, 1, 'expr', []])
  })

  test('false - empth composition with empty input', () => {
    const expr = compose('expr')

    const result = expr('', 1)

    expect(result).to.eql([false, 1, 1, 'expr', []])
  })
})
