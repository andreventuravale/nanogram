const chai = require('chai')
chai.use(require('chai-subset'))
const { expect } = chai

const { optional, compose, token } = require('../src')

suite('optional', () => {
  test('when missing it returns true having both start and end offsets at same point and empty results', () => {
    const expr = compose('program',
      token('subject', /\w+/),
      token('space', /\s+/),
      optional(
        compose('op',
          token('is', /is/),
          token('space', /\s+/)
        )
      ),
      token('predicate', /\w+/)
    )

    const result = expr('foo bar', 0)

    expect(result).to.containSubset(
      {
        found: true,
        from: 0,
        to: 7,
        type: 'program',
        data: [
          { found: true, from: 0, to: 3, type: 'subject', data: ['foo'] },
          { found: true, from: 3, to: 4, type: 'space', data: [' '] },
          { found: true, from: 4, to: 4, type: 'op', data: [] },
          { found: true, from: 4, to: 7, type: 'predicate', data: ['bar'] }
        ]
      }
    )
  })

  test('found', () => {
    const expr = compose('program',
      token('subject', /\w+/),
      token('space', /\s+/),
      optional(
        compose('op',
          token('is', /is/),
          token('space', /\s+/)
        )
      ),
      token('predicate', /\w+/)
    )

    const result = expr('foo is bar', 0)

    expect(result).to.containSubset(
      {
        found: true,
        from: 0,
        to: 10,
        type: 'program',
        data: [
          { found: true, from: 0, to: 3, type: 'subject', data: ['foo'] },
          { found: true, from: 3, to: 4, type: 'space', data: [' '] },
          { found: true,
            from: 4,
            to: 7,
            type: 'op',
            data: [
              { found: true, from: 4, to: 6, type: 'is', data: ['is'] },
              { found: true, from: 6, to: 7, type: 'space', data: [' '] }
            ]
          },
          { found: true, from: 7, to: 10, type: 'predicate', data: ['bar'] }
        ]
      }
    )
  })
})
