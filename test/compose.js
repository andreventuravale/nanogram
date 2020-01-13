const chai = require('chai')
chai.use(require('chai-subset'))
const { expect } = chai

const compose = require('../src/compose')
const token = require('../src/token')

suite('compose', () => {
  suite('success cases', () => {
    test('two occurrences on same item are indexed', () => {
      const number = token('num', /\d+/y)()

      const expr = compose('expr',
        number,
        token('op', /\+/y)(),
        number
      )()

      const result = expr('1+2', 0)

      expect(result[0]).to.deep.eql({
        num0: '1',
        op: '+',
        num1: '2'
      })

      expect(result[1]).to.deep.eql({
        found: true,
        from: 0,
        to: 3,
        type: 'expr'
      })
    })

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

      expect(result[0]).to.deep.eql({
        num0: '1',
        op0: '+',
        num1: '2',
        op1: '=',
        num2: '3'
      })

      expect(result[1]).to.deep.eql({
        found: true,
        from: 0,
        to: 5,
        type: 'expr'
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

      expect(result[0]).to.deep.eql({
        name: 'foo',
        ws: ' ',
        surname: 'bar'
      })

      expect(result[1]).to.deep.eql({
        found: true,
        from: 0,
        to: 7,
        type: 'fullName'
      })
    })

    test.only('custom transformation', () => {
      const number = token('num', /\d+/y)(num => Number(num))

      const parse = compose('sum',
        number,
        token('op', /\+/y)(),
        number
      )

      const sum = parse(({ num0, num1 }) => num0 + num1)

      const result = sum('1+2', 0)

      expect(result).to.eql(3)
    })
  })

  suite('fail cases', () => {
  })

  test('false - incomplete', () => {
    const digit = token('digit', /\d/)()
    const letter = token('letter', /[a-z]/i)()

    const expr = compose('expr',
      digit,
      letter,
      digit
    )()

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
