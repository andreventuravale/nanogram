const { choose, list, match, optional, repeat, sequence } = require('../src')
const { expect } = require('chai')
const { skipper } = require('../src/helpers')

const whitespaceSkipper = skipper(/\s/)

const processor = { pre: { offset: whitespaceSkipper } }

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

  test('match: sticky regex does not loop indefinitely', () => {
    const digit = match(/\d/y)

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

  test('match: adds a preprocessor to skip whitespace characters', () => {
    const digit = match(processor)(/\d/)

    const result = digit('  1', 0)

    expect(result).to.eql({
      found: true, from: 2, to: 3, data: '1'
    })
  })

  test('match: transforms the result into a typed number', () => {
    const digit = match(processor)(/\d/)

    const typedDigit = digit((digit) => Number(digit))

    const result = typedDigit('  1', 0)

    expect(result).to.eql({
      found: true, from: 2, to: 3, data: 1
    })
  })

  test('match: transforms a not-found result', () => {
    const digit = match(/\d/)

    const typedDigit = digit((data, { found }) => !found && 'not_found')

    const result = typedDigit('a', 0)

    expect(result).to.eql({
      found: false, from: 0, to: 0, data: 'not_found'
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

  test('repeat: adds a preprocessor to skip whitespace characters', () => {
    const digit = match(/\d/)

    const digits = repeat(processor)(digit)

    const result = digits('  123', 0)

    expect(result).to.eql({
      found: true,
      from: 2,
      to: 5,
      data: [
        {
          found: true, from: 2, to: 3, data: '1'
        },
        {
          found: true, from: 3, to: 4, data: '2'
        },
        {
          found: true, from: 4, to: 5, data: '3'
        }
      ]
    })
  })

  test('repeat: transforms the result by summing the digits', () => {
    const digit = match(/\d/)

    const sum = repeat(digit)(list => list.reduce((sum, item) => sum + Number(item.data), 0))

    const result = sum('12345', 0)

    expect(result).to.eql({
      found: true,
      from: 0,
      to: 5,
      data: 15
    })
  })

  test('repeat: transforms a not-found result', () => {
    const digit = match(/\d/)

    const sum = repeat(digit)((list, { found }) => !found && 'not_found')

    const result = sum('abcde', 0)

    expect(result).to.eql({
      found: false,
      from: 0,
      to: 0,
      data: 'not_found'
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

  test('sequence: finds a match with more than 2 items', () => {
    const name = match(/\w+/)
    const ws = match(/\s+/)
    const code = match(/[a-zA-Z_]\w*/)
    const result = sequence(name, ws, code)('foo a1', 0)

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
          found: true, from: 4, to: 6, data: 'a1'
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

  test('sequence: adds a preprocessor to skip whitespace characters', () => {
    const name = match(/\w+/)
    const ws = match(/\s+/)
    const age = match(/\d+/)

    const nameAndAge = sequence(processor)(name, ws, age)

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

  test('sequence: transforms the result by inverting name and age', () => {
    const name = match(/\w+/)
    const ws = match(/\s+/)
    const age = match(/\d+/)

    const nameAndAge = sequence(name, ws, age)(
      ([name, ws, age], { found }) => {
        return found && `${age.data}${ws.data}${name.data}`
      }
    )

    const result = nameAndAge('foo 30', 0)

    expect(result).to.eql({
      found: true,
      from: 0,
      to: 6,
      data: `30 foo`
    })
  })

  test('sequence: transforms a not-found result', () => {
    const name = match(/\w+/)
    const ws = match(/\s+/)
    const age = match(/\d+/)

    const nameAndAge = sequence(name, ws, age)(
      (data, { found }) => {
        return !found && 'not_found'
      }
    )

    const result = nameAndAge('', 0)

    expect(result).to.eql({
      found: false,
      from: 0,
      to: 0,
      data: 'not_found'
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

  test('list: configured to not consume an eventual trailing separator left alone', () => {
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

  test('list: configured to consume an eventual trailing separator left alone', () => {
    const digits = match(/\d+/)
    const comma = match(/,/)
    const digitList = list(digits, comma, { trailingSeparator: true })
    const result = digitList('1,2,3,', 0)

    expect(result).to.eql({
      found: true,
      from: 0,
      to: 6,
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

  test('list: adds a preprocessor to skip whitespace characters', () => {
    const digits = match(/\d+/)
    const comma = match(/,/)
    const digitList = list(processor)(digits, comma)
    const result = digitList('  1,2,3', 0)

    expect(result).to.eql({
      found: true,
      from: 2,
      to: 7,
      data: [
        {
          found: true, from: 2, to: 3, data: '1'
        },
        {
          found: true, from: 4, to: 5, data: '2'
        },
        {
          found: true, from: 6, to: 7, data: '3'
        }
      ]
    })
  })

  test('list: transforms the results by summing the digits', () => {
    const digits = match(/\d+/)
    const comma = match(/,/)
    const digitList = list(digits, comma)(list => list.reduce((sum, item) => sum + Number(item.data), 0))
    const result = digitList('1,2,3,4,5', 0)

    expect(result).to.eql({
      found: true,
      from: 0,
      to: 9,
      data: 15
    })
  })

  test('list: transforms a not-found result', () => {
    const names = match(/[a-z]+/)
    const comma = match(/,/)
    const digitList = list(names, comma)((list, { found }) => !found && 'not_found')
    const result = digitList('1,2,3,4,5', 0)

    expect(result).to.eql({
      found: false,
      from: 0,
      to: 0,
      data: 'not_found'
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

  test('optional: adds a preprocessor to skip whitespace characters', () => {
    const digit = match(/\d+/)

    const optDigit = optional(processor)(digit)

    const result = optDigit('  1', 0)

    expect(result).to.eql({
      found: true,
      from: 2,
      to: 3,
      data: '1'
    })
  })

  test('optional: transforms the result by converting it to a typed number', () => {
    const digit = match(/\d+/)

    const optDigit = optional(digit)

    const typedOptDigit = optDigit((data, { found }) => found && Number(data))

    const result = typedOptDigit('1', 0)

    expect(result).to.eql({
      found: true,
      from: 0,
      to: 1,
      data: 1
    })
  })

  test('optional: transforms a not-found result', () => {
    const digit = match(/\d+/)

    const optDigit = optional(digit)

    const typedOptDigit = optDigit((data) => data || NaN)

    expect(typedOptDigit('1', 0)).to.eql({ found: true, from: 0, to: 1, data: '1' })

    expect(typedOptDigit('', 0)).to.eql({ found: true, from: 0, to: 0, data: NaN })
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

  test('choose: adds a preprocessor to skip whitespace characters', () => {
    const digit = match(/\d/)
    const word = match(/\w/)

    const options = choose(processor)(digit, word)

    const result = options('  1', 0)

    expect(result).to.eql({
      found: true, from: 2, to: 3, data: '1'
    })
  })

  test('choose: transforms the result into a typed number', () => {
    const digit = match(/\d+/)
    const word = match(/\w/)

    const options = choose(digit, word)(digit => Number(digit))

    const result = options('123', 0)

    expect(result).to.eql({ found: true, from: 0, to: 3, data: 123 })
  })

  test('choose: transforms a not-found result', () => {
    const digit = match(/\d+/)
    const word = match(/\w+/)

    const options = choose(digit, word)((data, { found }) => found ? data : 'not_found')

    const result = options('#$%', 0)

    expect(result).to.eql({ found: false, from: 0, to: 0, data: 'not_found' })
  })

  test('skipper: a whitespace skipper', () => {
    const name = match(processor)(/\w+/)

    const result = name(' 123', 0)

    expect(result).to.eql({
      found: true,
      from: 1,
      to: 4,
      data: '123'
    })
  })

  test(`skipper: does nothing when it isn't needed`, () => {
    const name = match(processor)(/\w+/)

    const result = name('   1', 3)

    expect(result).to.eql({
      found: true,
      from: 3,
      to: 4,
      data: '1'
    })
  })
})
