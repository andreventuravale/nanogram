const chai = require('chai')
chai.use(require('chai-subset'))
const { expect } = chai

const compose = require('../src/compose')
const token = require('../src/token')

suite('compose', () => {
  suite('success cases', () => {
    test.only('two occurrences on same item are indexed', () => {
      const number = token('num', /\d+/y)()

      const expr = compose('expr',
        number,
        token('op', /\+/y)(),
        number
      )()

      const result = expr('1+2', 0)

      expect(result).to.deep.eql({
        found: true,
        from: 0,
        to: 3,
        type: 'expr',
        data: {
          op: '+',
          num0: '1',
          num1: '2'
        }
      })
    })

    // TODO: compose name equals type ( and curried intermediates )

    test('more than two occurrences on same item are indexed', () => {
      const number = token('num', /\d+/y)()

      const expr = compose('expr',
        number,
        token('op', /\+/y)(),
        number,
        token('op', /=/y)(),
        number
      )()

      const result = expr('1+2=3', 0)

      expect(result).to.deep.eql({
        found: true,
        from: 0,
        to: 5,
        type: 'expr',
        data: {
          num0: '1',
          num1: '2',
          op0: '+',
          op1: '=',
          num2: '3'
        }
      })
    })

    test('single occurrence of an item is not indexed', () => {
      const name = token('name', /\w+/y)()
      const ws = token('ws', / +/y)()
      const surname = token('surname', /\w+/y)()

      const fullName = compose('fullName',
        name,
        ws,
        surname
      )()

      const result = fullName('foo bar', 0)

      expect(result).to.deep.eql({
        found: true,
        from: 0,
        to: 7,
        type: 'fullName',
        data: {
          name: 'foo',
          ws: ' ',
          surname: 'bar'
        }
      })
    })

    test('custom transformation', () => {
      const number = token('num', /\d+/y)(num => Number(num))

      const parse = compose('sum',
        number,
        token('op', /\+/y)(),
        number
      )

      const sum = parse(({ num0, num1 }) => num0 + num1)

      const result = sum('1+2', 0)

      expect(result).to.eql({
        found: true,
        from: 0,
        to: 3,
        type: 'sum',
        data: 3
      })
    })
  })

  suite.only('fail cases', () => {
    test('partial match', () => {
      const ws = token('ws', /\s*/y)()

      const digit = token('digit', /\d/y)()

      const letter = token('letter', /[a-z]/yi)()

      const expr = compose('expr',
        ws,
        digit,
        ws,
        letter,
        ws,
        digit,
        ws
      )()

      const result = expr([
        '',
        '1',
        '  2',
        '    3'
      ].join('\n'), 0)

      expect(result).to.eql({
        found: false,
        from: 0,
        to: 5,
        type: 'expr',
        data: {
          digit: '1',
          ws0: '\n',
          ws1: '\n  '
        },
        errors: [
          {
            line: 3,
            column: 3,
            message: '3:3: expected element not found: "letter"'
          }
        ]
      })
    })
  })

  test('false - empty composition', () => {
    const expr = compose('foo')()

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
    const number = token('digit', /\d/)()

    const expr = compose('expr',
      number()
    )()

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
    const expr = compose('expr')()

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

  test('false - transform', () => {
    const number = token('num', /\d+/)()

    const parse = compose('sum',
      number,
      token('op', /\+/)(),
      number
    )

    const sum = parse(() => NaN)

    const result = sum('1-2', 0)

    expect(result).to.eql(NaN)
  })
})
