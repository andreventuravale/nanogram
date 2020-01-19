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

const repeat = (element) => {
  return (input, offset) => {
    const data = []
    const first = element(input, offset)
    let last = first

    while (last.found) {
      data.push(last)
      last = element(input, last.to)
    }

    return { found: data.length > 0, from: offset, to: last.to, data }
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

const optional = (element) => {
  return (input, offset) => {
    const data = element(input, offset)

    data.found = true

    return data
  }
}

const choose = (...args) => {
  return (input, offset) => {
    const sequence = args.slice(0)

    let result = { found: false, to: offset }

    do {
      result = sequence.shift()(input, result.to)
    } while (!result.found && sequence.length)

    if (!result.found) {
      result.data = undefined
    }

    return result
  }
}

module.exports = {
  choose,
  list,
  match,
  optional,
  repeat,
  sequence
}
