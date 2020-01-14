const noOffset = require('../src/offsetter/noOffset')
const chai = require('chai')
const compose = require('../src/compose')
const hidden = require('../src/decorator/hidden')
const list = require('../src/list')
const optional = require('../src/optional')
const token = require('../src/token')
const noWhitespace = require('../src/offsetter/noWhitespace')

const { expect } = chai

suite('compose', () => {
  suite('success cases', () => {
    test('two occurrences on same item are indexed', () => {
      const number = token(noOffset)()('num', /\d+/y)()

      const expr = compose('expr',
        number,
        token(noOffset)()('op', /\+/y)(),
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
      const number = token(noOffset)()('num', /\d+/y)()

      const expr = compose('expr',
        number,
        token(noOffset)()('op', /\+/y)(),
        number,
        token(noOffset)()('op', /=/y)(),
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
      const name = token(noOffset)()('name', /\w+/y)()
      const ws = token(noOffset)()('ws', / +/y)()
      const surname = token(noOffset)()('surname', /\w+/y)()

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

    suite('does not stop on a item marked as ignored', () => {
      test('in begin', () => {
        const name = token(noOffset)()('name', /\w+/y)()
        const space = token(noOffset)()('space', / /y)()
        const surname = token(noOffset)()('surname', /\w+/y)()

        const fullName = compose('fullName',
          optional(name),
          space,
          surname
        )()

        const result = fullName(' bar', 0)

        expect(result).to.deep.eql({
          found: true,
          from: 0,
          to: 4,
          type: 'fullName',
          data: {
            space: ' ',
            surname: 'bar'
          }
        })
      })

      test('in the middle', () => {
        const name = token(noOffset)()('name', /\w+/y)()
        const colon = token(noOffset)()('colon', /:/y)()
        const space = token(noOffset)()('space', / */y)()
        const surname = token(noOffset)()('surname', /\w+/y)()

        const fullName = compose('fullName',
          name,
          optional(colon),
          space,
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
            space: ' ',
            surname: 'bar'
          }
        })
      })

      test('in the end', () => {
        const name = token(noOffset)()('name', /\w+/y)()
        const space = token(noOffset)()('space', / /y)()
        const surname = token(noOffset)()('surname', /\w+/y)()

        const fullName = compose('fullName',
          name,
          space,
          optional(surname)
        )()

        const result = fullName('foo ', 0)

        expect(result).to.deep.eql({
          found: true,
          from: 0,
          to: 4,
          type: 'fullName',
          data: {
            name: 'foo',
            space: ' '
          }
        })
      })
    })

    test('many successed ignorables at end', () => {
      const name = token(noOffset)()('name', /\w+/y)()
      const space = token(noOffset)()('space', / /y)()
      const surname = list('surname', name, space)()

      const fullName = compose('fullName',
        name,
        optional(space),
        optional(surname)
      )()

      const result = fullName('foo bar', 0)

      expect(result).to.deep.eql({
        found: true,
        from: 0,
        to: 7,
        type: 'fullName',
        data: {
          name: 'foo',
          space: ' ',
          surname: [
            {
              found: true,
              from: 4,
              to: 7,
              type: 'name',
              data: 'bar'
            }
          ]
        }
      })
    })

    test('custom transformation', () => {
      const number = token(noOffset)()('num', /\d+/y)(num => Number(num))

      const untransformed = compose('sum',
        number,
        token(noOffset)()('op', /\+/y)(),
        number
      )

      const sum = untransformed(({ num0, num1 }) => num0 + num1)

      const result = sum('1+2', 0)

      expect(result).to.deep.eql({
        found: true,
        from: 0,
        to: 3,
        type: 'sum',
        data: 3
      })
    })

    test('custom transformation', () => {
      const number = token(noOffset)()('num', /\d+/y)(num => Number(num))
      const ws = token(noOffset)()('ws', / +/y)()
      const numberList = list('numList', number, ws)
      const oddNumberList = numberList(list => list.filter(num => num.data % 2))

      const sumOdds = compose('sumOdds',
        oddNumberList
      )(({ numList }) => numList.reduce((sum, { data }) => sum + data, 0))

      const result = sumOdds('1 2 3', 0)

      expect(result).to.deep.eql({
        found: true,
        from: 0,
        to: 5,
        type: 'sumOdds',
        data: 4
      })
    })

    test(`items flagged as hidden are considered found but their data won't be captured on composed data results`, () => {
      const digit = token(noWhitespace)()('digit', /\d/y)()
      const letter = token(noWhitespace)()('letter', /[a-z]/yi)()
      const ws = token(noOffset)(hidden)('ws', /\s*/y)()

      const expr = compose('expr',
        digit,
        ws,
        letter,
        ws,
        digit
      )()

      const result = expr([
        '',
        '1',
        '  2',
        '    3'
      ].join('\n'), 0)

      expect(result).to.deep.eql({
        found: false,
        from: 0,
        to: 5,
        type: 'expr',
        data: {
          digit: '1'
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

  suite('fail cases', () => {
    test('partial matching should generate an error', () => {
      const ws = token(noOffset)()('ws', /\s*/y)()

      const digit = token(noOffset)()('digit', /\d/y)()

      const letter = token(noOffset)()('letter', /[a-z]/yi)()

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

      expect(result).to.deep.eql({
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
      const number = token(noOffset)()('digit', /\d/y)()

      const expr = compose('expr',
        number
      )()

      const result = expr('', 1)

      expect(result).to.deep.eql(
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
      const number = token(noOffset)()('num', /\d+/y)()

      const untransformed = compose('sum',
        number,
        token(noOffset)()('op', /\+/y)(),
        number
      )

      const sum = untransformed((data, { found }) => found ? 0 : NaN)

      const result = sum('1-2', 0)

      expect(result).to.deep.eql({
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
      token(noOffset)()('num', /(\d+)/y)()
    )

    expect(untransformed.name).to.deep.eql('num')

    const transformed = untransformed(({ num }) => num)

    expect(transformed.name).to.deep.eql('num')
  })

  // test('is curriable', () => {
  //   const untransformed = compose('num', token(allInput)('num', /\d+/y)())

  //   expect(
  //     untransformed()('1', 0)
  //   ).to.deep.eql(
  //     { found: true, from: 0, to: 1, type: 'num', data: { num: '1' } }
  //   )

  //   expect(
  //     untransformed()('1')(0)
  //   ).to.deep.eql(
  //     { found: true, from: 0, to: 1, type: 'num', data: { num: '1' } }
  //   )

  //   expect(
  //     untransformed()()('1')(0)
  //   ).to.deep.eql(
  //     { found: true, from: 0, to: 1, type: 'num', data: { num: '1' } }
  //   )

  //   expect(
  //     untransformed()('1')()(0)
  //   ).to.deep.eql(
  //     { found: true, from: 0, to: 1, type: 'num', data: { num: '1' } }
  //   )
  // })

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
