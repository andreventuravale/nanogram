const { expect } = require('chai')
const list = require('../src/list')
const token = require('../src/token')

suite.only('list', () => {
  suite('success cases', () => {
    test('finds a comma separated list of numbers', () => {
      const number = token('num', /\d/y)()
      const comma = token('comma', /,/y)()

      const numberList = list('list', number, comma)()

      const result = numberList('1,2,3', 0)

      expect(result).to.eql({
        found: true,
        from: 0,
        to: 5,
        type: 'list',
        data: [
          {
            found: true,
            from: 0,
            to: 1,
            type: 'num',
            data: '1'
          },
          {
            found: true,
            from: 2,
            to: 3,
            type: 'num',
            data: '2'
          },
          {
            found: true,
            from: 4,
            to: 5,
            type: 'num',
            data: '3'
          }
        ]
      })
    })

    test('finds two numbers separated by a comma', () => {
      const number = token('num', /\d/y)()
      const comma = token('comma', /,/y)()

      const numberList = list('list', number, comma)()

      const result = numberList('1,2', 0)

      expect(result).to.eql({
        found: true,
        from: 0,
        to: 3,
        type: 'list',
        data: [
          {
            found: true,
            from: 0,
            to: 1,
            type: 'num',
            data: '1'
          },
          {
            found: true,
            from: 2,
            to: 3,
            type: 'num',
            data: '2'
          }
        ]
      })
    })

    test('finds a single number without the need of a separator', () => {
      const number = token('num', /\d/y)()
      const comma = token('comma', /,/y)()

      const numberList = list('list', number, comma)()

      const result = numberList('1', 0)

      expect(result).to.eql({
        found: true,
        from: 0,
        to: 1,
        type: 'list',
        data: [
          {
            found: true,
            from: 0,
            to: 1,
            type: 'num',
            data: '1'
          }
        ]
      })
    })

    test('ignores the last separator with no subsequent element', () => {
      const number = token('num', /\d/y)()
      const comma = token('comma', /,/y)()

      const numberList = list('list', number, comma)()

      const result = numberList('1,2,', 0)

      expect(result).to.eql({
        found: true,
        from: 0,
        to: 3,
        type: 'list',
        data: [
          {
            found: true,
            from: 0,
            to: 1,
            type: 'num',
            data: '1'
          },
          {
            found: true,
            from: 2,
            to: 3,
            type: 'num',
            data: '2'
          }
        ]
      })
    })

    test('custom transformation', () => {
      const number = token('num', /\d/y)()
      const comma = token('comma', /,/y)()

      const numberList = list('list', number, comma)(num => Number(num))

      const result = numberList('1,2,3', 0)

      expect(result).to.eql({
        found: true,
        from: 0,
        to: 5,
        type: 'list',
        data: [
          {
            found: true,
            from: 0,
            to: 1,
            type: 'num',
            data: 1
          },
          {
            found: true,
            from: 2,
            to: 3,
            type: 'num',
            data: 2
          },
          {
            found: true,
            from: 4,
            to: 5,
            type: 'num',
            data: 3
          }
        ]
      })
    })
  })

  suite('fail cases', () => {
    test('empty input is considered not found', () => {
      const number = token('num', /\d/y)()
      const comma = token('comma', /,/y)()

      const numberList = list('list', number, comma)()

      expect(
        numberList('1', 0)
      ).to.eql({
        found: true,
        from: 0,
        to: 1,
        type: 'list',
        data: [
          {
            found: true,
            from: 0,
            to: 1,
            type: 'num',
            data: '1'
          }
        ]
      })

      expect(
        numberList('', 0)
      ).to.eql({
        found: false,
        from: 0,
        to: 0,
        type: 'list',
        data: []
      })
    })
  })
})
