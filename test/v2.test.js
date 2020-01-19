const { expect } = require('chai')

const sequence = (...args) => {
  return (input, offset) => {
    const sequence = args.slice(0)
    const data = []

    let result = sequence.shift()(input, offset)

    while (result.found && sequence.length) {
      data.push(result)
      result = sequence.shift()(input, result.to)
    }

    data.push(result)

    return {
      found: result.found && sequence.length === 0,
      from: offset,
      to: result.to,
      data
    }
  }
}

const match = (regex) => {
  regex = /[yg]/.test(regex.flags) ? regex : new RegExp(regex.source, `y${regex.flags}`)

  return (input, offset) => {
    regex.lastIndex = offset

    const result = input.match(regex)

    if (result) {
      return { found: true, from: offset, to: offset + result[0].length, data: result[0] }
    }

    return { found: false, from: offset, to: offset, data: '' }
  }
}

const list = (element, separator) => {
  return (input, offset) => {
    const data = []
    const first = element(input, offset)
    let last = first
    let tail = first

    while (last.found) {
      tail = last

      data.push(tail)

      const sep = separator(input, last.to)

      if (sep.found) {
        last = element(input, sep.to)
      } else {
        break
      }
    }

    return { found: data.length > 0, from: offset, to: tail.to, data }
  }
}

suite('v2', () => {
  test('match: finds an input', () => {
    const ws = match(/\s+/)

    const result = ws(' ', 0)

    expect(result).to.eql({ found: true, from: 0, to: 1, data: ' ' })
  })

  test.only('match: finds an input larger than 1', () => {
    const ws = match(/\s+/)

    const result = ws('  ', 0)

    expect(result).to.eql({ found: true, from: 0, to: 2, data: '  ' })
  })

  test('match: stateless regex does not loop indefinitely', () => {
    const digit = match(/\d/)

    const result = digit('111', 0)

    expect(result).to.eql({ found: true, from: 0, to: 1, data: '1' })
  })

  test('match: does not find an input', () => {
    const ws = match(/\s+/)

    const result = ws('a', 0)

    expect(result).to.eql({ found: false, from: 0, to: 0, data: '' })
  })

  test.only('sequence: finds a match', () => {
    const name = match(/\w+/)
    const ws = match(/\s+/)
    const age = match(/\d+/)
    const result = sequence(name, ws, age)('foo 30', 0)

    expect(result).to.eql({
      found: true,
      from: 0,
      to: 6,
      data: [
        { found: true, from: 0, to: 3, data: 'foo' },
        { found: true, from: 3, to: 4, data: ' ' },
        { found: true, from: 4, to: 6, data: '30' }
      ]
    })
  })

  test.only('sequence: does not find the first match', () => {
    const name = match(/\w+/)
    const ws = match(/\s+/)
    const age = match(/\d+/)
    const result = sequence(name, ws, age)(' 30', 0)

    expect(result).to.eql({
      found: false,
      from: 0,
      to: 0,
      data: [
        { found: false, from: 0, to: 0, data: '' }
      ]
    })
  })

  test.only('sequence: does not find the last match', () => {
    const name = match(/\w+/)
    const ws = match(/\s+/)
    const age = match(/\d+/)
    const result = sequence(name, ws, age)('foo ', 0)

    expect(result).to.eql({
      found: false,
      from: 0,
      to: 4,
      data: [
        { found: true, from: 0, to: 3, data: 'foo' },
        { found: true, from: 3, to: 4, data: ' ' },
        { found: false, from: 4, to: 4, data: '' }
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
        { found: true, from: 0, to: 1, data: '1' },
        { found: true, from: 2, to: 3, data: '2' },
        { found: true, from: 4, to: 5, data: '3' }
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
        { found: true, from: 0, to: 1, data: '1' },
        { found: true, from: 2, to: 3, data: '2' },
        { found: true, from: 4, to: 5, data: '3' }
      ]
    })
  })
})
