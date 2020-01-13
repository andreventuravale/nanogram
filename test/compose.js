const chai = require('chai')
chai.use(require('chai-subset'))
const { expect } = chai

const compose = require('../src/compose')
const token = require('../src/token')

suite.only('compose', () => {
  suite('fail fast validation', () => {
    test('empty composition is not valid', () => {
      expect(() => compose('foo')).to.throw(`A composition must have at least one element.`)
    })
  })

  suite('success cases', () => {
    test('two occurrences on same item are indexed', () => {
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

  suite('fail cases', () => {
    test('partial matching should generate an error', () => {
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

    test('empty input should generate an error', () => {
      const number = token('digit', /\d/y)()

      const expr = compose('expr',
        number
      )()

      const result = expr('', 1)

      expect(result).to.eql(
        {
          found: false,
          from: 1,
          to: 1,
          type: 'expr',
          data: {},
          errors: [
            {
              line: 1,
              column: 1,
              message: '1:1: expected element not found: "digit"'
            }
          ]
        })
    })

    test('custom transformation', () => {
      const number = token('num', /\d+/y)()

      const parse = compose('sum',
        number,
        token('op', /\+/y)(),
        number
      )

      const sum = parse((data, { found }) => found ? 0 : NaN)

      const result = sum('1-2', 0)

      expect(result).to.eql({
        found: false,
        from: 0,
        to: 1,
        type: 'sum',
        data: NaN,
        errors: [
          {
            line: 1,
            column: 2,
            message: '1:2: expected element not found: "op"'
          }
        ]
      })
    })
  })

  test('type resulting function name is equal to the type', () => {
    const untransformed = compose('num',
      token('num', /(\d+)/y)()
    )

    expect(untransformed.name).to.eql('num')

    const transformed = untransformed(({ num }) => num)

    expect(transformed.name).to.eql('num')
  })

  test('the compose function can be curried', () => {
    const untransformed = compose('num', token('num', /\d+/y)())

    expect(
      untransformed()('1', 0)
    ).to.deep.eql(
      { found: true, from: 0, to: 1, type: 'num', data: { num: '1' } }
    )

    expect(
      untransformed()('1')(0)
    ).to.deep.eql(
      { found: true, from: 0, to: 1, type: 'num', data: { num: '1' } }
    )

    expect(
      untransformed()()('1')(0)
    ).to.deep.eql(
      { found: true, from: 0, to: 1, type: 'num', data: { num: '1' } }
    )

    expect(
      untransformed()('1')()(0)
    ).to.deep.eql(
      { found: true, from: 0, to: 1, type: 'num', data: { num: '1' } }
    )
  })
})
