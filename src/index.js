const sequence = (...args) => {
  let processor
  let sequence
  let transformer = data => data

  const step1 = (...args1) => {
    const step2 = (...args2) => {
      const step3 = (...args3) => {
        const data = []
        const input = args3[0]
        let offset = args3[1]

        if (processor && processor.pre && processor.pre.offset) {
          offset = processor.pre.offset(input, offset)
        }

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
          data: transformer(data)
        }
      }

      if (args2.length === 1 && typeof args2[0] === 'function') {
        transformer = args2[0]
        return step3
      } else {
        return step3(...args2)
      }
    }

    if (args1.length === 1 && typeof args1[0] === 'object') {
      processor = args1[0]
      return step1
    } else {
      sequence = args1
      return step2
    }
  }

  return step1(...args)
}

const match = (regex) => {
  regex = /[yg]/.test(regex.flags) ? regex : new RegExp(regex.source, `y${regex.flags}`)

  return (input, offset) => {
    regex.lastIndex = offset

    const result = input.match(regex)

    if (result) {
      return {
        found: true, from: offset, to: offset + result[0].length, data: result[0]
      }
    }

    return {
      found: false, from: offset, to: offset, data: ''
    }
  }
}

const repeat = element => (input, offset) => {
  const data = []
  const first = element(input, offset)
  let last = first

  while (last.found) {
    data.push(last)
    last = element(input, last.to)
  }

  return {
    found: data.length > 0, from: offset, to: last.to, data
  }
}

const list = (element, separator) => (input, offset) => {
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

  return {
    found: data.length > 0, from: offset, to: tail.to, data
  }
}

const optional = element => (input, offset) => {
  const data = element(input, offset)

  data.found = true

  return data
}

const choose = (...args) => (input, offset) => {
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

module.exports = {
  choose,
  list,
  match,
  optional,
  repeat,
  sequence
}
