const { expect } = require('chai')

const {
  choose, list, match, optional, repeat, sequence
} = require('../src')

suite('v2', () => {
  test('match: finds an input', () => {
    const ws = match(/\s+/)

    const result = ws(' ', 0)

    expect(result).to.eql({
      found: true, from: 0, to: 1, data: ' '
    })
  })

  test('match: finds an input larger than 1', () => {
    const ws = match(/\s+/)

    const result = ws('  ', 0)

    expect(result).to.eql({
      found: true, from: 0, to: 2, data: '  '
    })
  })

  test('match: stateless regex does not loop indefinitely', () => {
    const digit = match(/\d/)

    const result = digit('111', 0)

    expect(result).to.eql({
      found: true, from: 0, to: 1, data: '1'
    })
  })

  test('match: does not find an input', () => {
    const ws = match(/\s+/)

    const result = ws('a', 0)

    expect(result).to.eql({
      found: false, from: 0, to: 0, data: ''
    })
  })

  test('repeat: finds many inputs', () => {
    const digit = match(/\d/)

    const digits = repeat(digit)

    const result = digits('123', 0)

    expect(result).to.eql({
      found: true,
      from: 0,
      to: 3,
      data: [
        {
          found: true, from: 0, to: 1, data: '1'
        },
        {
          found: true, from: 1, to: 2, data: '2'
        },
        {
          found: true, from: 2, to: 3, data: '3'
        }
      ]
    })
  })

  test('repeat: finds a single input', () => {
    const digit = match(/\d/)

    const digits = repeat(digit)

    const result = digits('1', 0)

    expect(result).to.eql({
      found: true,
      from: 0,
      to: 1,
      data: [
        {
          found: true, from: 0, to: 1, data: '1'
        }
      ]
    })
  })

  test('repeat: does not find any input', () => {
    const digit = match(/\d/)

    const digits = repeat(digit)

    const result = digits('', 0)

    expect(result).to.eql({
      found: false,
      from: 0,
      to: 0,
      data: []
    })
  })

  test('sequence: finds a match', () => {
    const name = match(/\w+/)
    const ws = match(/\s+/)
    const age = match(/\d+/)
    const result = sequence(name, ws, age)('foo 30', 0)

    expect(result).to.eql({
      found: true,
      from: 0,
      to: 6,
      data: [
        {
          found: true, from: 0, to: 3, data: 'foo'
        },
        {
          found: true, from: 3, to: 4, data: ' '
        },
        {
          found: true, from: 4, to: 6, data: '30'
        }
      ]
    })
  })

  test('sequence: does not find the first match', () => {
    const name = match(/\w+/)
    const ws = match(/\s+/)
    const age = match(/\d+/)
    const result = sequence(name, ws, age)(' 30', 0)

    expect(result).to.eql({
      found: false,
      from: 0,
      to: 0,
      data: [
        {
          found: false, from: 0, to: 0, data: ''
        }
      ]
    })
  })

  test('sequence: does not find the last match', () => {
    const name = match(/\w+/)
    const ws = match(/\s+/)
    const age = match(/\d+/)
    const result = sequence(name, ws, age)('foo ', 0)

    expect(result).to.eql({
      found: false,
      from: 0,
      to: 4,
      data: [
        {
          found: true, from: 0, to: 3, data: 'foo'
        },
        {
          found: true, from: 3, to: 4, data: ' '
        },
        {
          found: false, from: 4, to: 4, data: ''
        }
      ]
    })
  })

  test('list: finds a match', () => {
    const digits = match(/\d+/)
    const comma = match(/,/)
    const digitList = list(digits, comma)
    const result = digitList('1,2,3', 0)

    expect(result).to.eql({
      found: true,
      from: 0,
      to: 5,
      data: [
        {
          found: true, from: 0, to: 1, data: '1'
        },
        {
          found: true, from: 2, to: 3, data: '2'
        },
        {
          found: true, from: 4, to: 5, data: '3'
        }
      ]
    })
  })

  test('list: does not find a match', () => {
    const digits = match(/\d+/)
    const comma = match(/,/)
    const digitList = list(digits, comma)
    const result = digitList('a,b,c', 0)

    expect(result).to.eql({
      found: false,
      from: 0,
      to: 0,
      data: []
    })
  })

  test('list: ignores the last separator', () => {
    const digits = match(/\d+/)
    const comma = match(/,/)
    const digitList = list(digits, comma)
    const result = digitList('1,2,3,', 0)

    expect(result).to.eql({
      found: true,
      from: 0,
      to: 5,
      data: [
        {
          found: true, from: 0, to: 1, data: '1'
        },
        {
          found: true, from: 2, to: 3, data: '2'
        },
        {
          found: true, from: 4, to: 5, data: '3'
        }
      ]
    })
  })

  test('optional: finds an input', () => {
    const ws = match(/\s+/)

    const optWs = optional(ws)

    const result = optWs(' ', 0)

    expect(result).to.eql({
      found: true, from: 0, to: 1, data: ' '
    })
  })

  test('optional: does not find an input', () => {
    const ws = match(/\s+/)

    const optWs = optional(ws)

    const result = optWs('', 0)

    expect(result).to.eql({
      found: true, from: 0, to: 0, data: ''
    })
  })

  test('choose: finds an input for the first option', () => {
    const digit = match(/\d/)
    const word = match(/\w/)

    const options = choose(digit, word)

    const result = options('1', 0)

    expect(result).to.eql({
      found: true, from: 0, to: 1, data: '1'
    })
  })

  test('choose: finds an input for the last option', () => {
    const digit = match(/\d/)
    const word = match(/\w/)

    const options = choose(digit, word)

    const result = options('a', 0)

    expect(result).to.eql({
      found: true, from: 0, to: 1, data: 'a'
    })
  })

  test('choose: does not find an input at all', () => {
    const digit = match(/\d/)
    const word = match(/\w/)

    const options = choose(digit, word)

    const result = options(';', 0)

    expect(result).to.eql({
      found: false, from: 0, to: 0, data: undefined
    })
  })

  test.only('sequence: adds a preprocessor to skip whitespace characters', () => {
    const name = match(/\w+/)
    const ws = match(/\s+/)
    const age = match(/\d+/)

    const whitespaceSkipper = (input, offset) => {
      while (/\s/.test(input[offset])) {
        offset++
      }
      return offset
    }

    const nameAndAge = sequence(name, ws, age)({
      pre: {
        offset: whitespaceSkipper
      }
    })

    const result = nameAndAge(' foo 30', 0)

    expect(result).to.eql({
      found: true,
      from: 1,
      to: 7,
      data: [
        {
          found: true, from: 1, to: 4, data: 'foo'
        },
        {
          found: true, from: 4, to: 5, data: ' '
        },
        {
          found: true, from: 5, to: 7, data: '30'
        }
      ]
    })
  })
})
