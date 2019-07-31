const { expect } = require('chai')

const { optional, compose, token } = require('../src')

suite('optional', () => {
  test('when missing it returns true having both start and end offsets at same point and empty results', () => {
    const expr = compose('program',
      token('subject', /\w+/),
      token('s', /\s+/),
      optional(
        compose('op',
          token('is', /is/),
          token('s', /\s+/)
        )
      ),
      token('predicate', /\w+/)
    )

    const result = expr('foo bar', 0)

    expect(result).to.eql(
      [
        true,
        0,
        7,
        'program',
        [
          [true, 0, 3, 'subject', ['foo']],
          [true, 3, 4, 's', [' ']],
          [true, 4, 4, 'op', []],
          [true, 4, 7, 'predicate', ['bar']]
        ]
      ]
    )
  })

  test('found', () => {
    const expr = compose('program',
      token('subject', /\w+/),
      token('s', /\s+/),
      optional(
        compose('op',
          token('is', /is/),
          token('s', /\s+/)
        )
      ),
      token('predicate', /\w+/)
    )

    const result = expr('foo is bar', 0)

    expect(result).to.eql(
      [
        true,
        0,
        10,
        'program',
        [
          [true, 0, 3, 'subject', ['foo']],
          [true, 3, 4, 's', [' ']],
          [true, 4, 7, 'op',
            [
              [true, 4, 6, 'is', ['is']],
              [true, 6, 7, 's', [' ']]
            ]
          ],
          [true, 7, 10, 'predicate', ['bar']]
        ]
      ]
    )
  })
})
