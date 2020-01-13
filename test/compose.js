const chai = require('chai')
const compose = require('../src/compose')
const list = require('../src/list')
const token = require('../src/token')

const { expect } = chai

suite.only('compose', () => {
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

    test('custom transformation', () => {
      const number = token('num', /\d+/y)(num => Number(num))
      const ws = token('ws', / +/y)()
      const numberList = list('numList', number, ws)
      const oddNumberList = numberList(num => num % 2 ? num : 0)

      const parse = compose('sum',
        oddNumberList
      )

      const sum = parse(({ numList }) => numList.reduce((sum, { data }) => sum + data, 0))

      const result = sum('1 2 3', 0)

      require('clipboardy').writeSync(JSON.stringify(result, 0, 2))

      expect(result).to.eql({
        found: true,
        from: 0,
        to: 5,
        type: 'sum',
        data: 4
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

  test('is curriable', () => {
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

  suite('fail fast validation', () => {
    test('invalid types', () => {
      expect(() => compose(_ => _)).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => compose('')).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => compose('$')).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => compose('1')).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => compose([])).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => compose({})).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => compose(1)).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => compose(NaN)).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => compose(new Date())).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => compose(null)).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => compose(Number(0))).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => compose(true)).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
      expect(() => compose(undefined)).to.throw('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
    })

    test('empty composition is not valid', () => {
      expect(() => compose('foo')).to.throw('A composition must have at least one element.')
    })
  })
})
