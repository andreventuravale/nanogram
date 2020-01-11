const chai = require('chai')
chai.use(require('chai-subset'))
const { expect } = chai

const { compose, token } = require('../src')

suite('compose', () => {
  test('true - happy case', () => {
    const number = token('num', /\d+/)

    const expr = compose('calc',
      number,
      token('op', /\+/),
      number,
      token('op', /=/),
      number
    )

    const result = expr('1+22=333', 0)

    expect(result).to.containSubset(
      {
        found: true,
        from: 0,
        to: 8,
        type: 'calc',
        data: [
          { found: true, from: 0, to: 1, type: 'num', data: ['1'] },
          { found: true, from: 1, to: 2, type: 'op', data: ['+'] },
          { found: true, from: 2, to: 4, type: 'num', data: ['22'] },
          { found: true, from: 4, to: 5, type: 'op', data: ['='] },
          { found: true, from: 5, to: 8, type: 'num', data: ['333'] }
        ]
      }
    )
  })

  test('elements named with symbols are also key accessible by key indexing', () => {
    const number = token(Symbol.for('num'), /\d+/)

    const expr = compose('calc',
      number,
      token('plus', /\+/),
      number,
      token('equals', /=/),
      number
    )

    const result = expr('1+22=333', 0)

    expect(result[Symbol.for('num')]).to.eql([
      { found: true, from: 0, to: 1, type: Symbol.for('num'), data: ['1'] },
      { found: true, from: 2, to: 4, type: Symbol.for('num'), data: ['22'] },
      { found: true, from: 5, to: 8, type: Symbol.for('num'), data: ['333'] }
    ])

    expect(result['plus']).to.eql(undefined)

    expect(result['equals']).to.eql(undefined)
  })

  test('false - incomplete', () => {
    const digit = token('digit', /\d/)
    const letter = token('letter', /[a-z]/i)

    const expr = compose('expr',
      digit,
      letter,
      digit
    )

    const result = expr('123', 0)

    expect(result).to.containSubset(
      {
        found: false,
        from: 0,
        to: 1,
        type: 'expr',
        data: [
          { found: true, from: 0, to: 1, type: 'digit', data: ['1'] }
        ]
      }
    )
  })

  test('false - empty composition', () => {
    const expr = compose('foo')

    const result = expr('1', 1)

    expect(result).to.eql(
      {
        found: false,
        from: 1,
        to: 1,
        type: 'foo',
        data: []
      }
    )
  })

  test('false - empty input', () => {
    const number = token('digit', /\d/)

    const expr = compose('expr',
      number()
    )

    const result = expr('', 1)

    expect(result).to.eql(
      {
        found: false,
        from: 1,
        to: 1,
        type: 'expr',
        data: []
      }
    )
  })

  test('false - empth composition with empty input', () => {
    const expr = compose('expr')

    const result = expr('', 1)

    expect(result).to.eql(
      {
        found: false,
        from: 1,
        to: 1,
        type: 'expr',
        data: []
      }
    )
  })
})
