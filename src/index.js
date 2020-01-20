const feature = custom => {
  return (...args) => {
    let featureArgs
    let processor
    let transformer = data => data

    const step1 = (...args1) => {
      const step2 = (...args2) => {
        const step3 = (...args3) => {
          const input = args3[0]
          let offset = args3[1]

          if (processor && processor.pre && processor.pre.offset) {
            offset = processor.pre.offset(input, offset)
          }

          const result = custom(input, offset, ...featureArgs)

          result.data = transformer(result.data, result)

          return result
        }

        if (args2.length === 1 && typeof args2[0] === 'function') {
          transformer = args2[0]
          return step3
        } else {
          return step3(...args2)
        }
      }

      if (args1.length === 1 && ((typeof args1[0] === 'object') && !(args1[0] instanceof RegExp))) {
        processor = args1[0]
        return step1
      } else {
        featureArgs = args1
        return step2
      }
    }

    return step1(...args)
  }
}

const sequence = feature(
  (input, offset, ...sequence) => {
    const data = []
    let itemResult = sequence.shift()(input, offset)

    while (itemResult.found && sequence.length) {
      data.push(itemResult)
      itemResult = sequence.shift()(input, itemResult.to)
    }

    data.push(itemResult)

    return {
      found: itemResult.found && sequence.length === 0,
      from: offset,
      to: itemResult.to,
      data
    }
  }
)

const match = feature(
  (input, offset, regex) => {
    regex = /[yg]/.test(regex.flags) ? regex : new RegExp(regex.source, `y${regex.flags}`)

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
)

const repeat = feature(
  (input, offset, element) => {
    const data = []
    const first = element(input, offset)
    let last = first

    while (last.found) {
      data.push(last)
      last = element(input, last.to)
    }

    return {
      found: data.length > 0,
      from: offset,
      to: last.to,
      data
    }
  }
)

const list = feature(
  (input, offset, element, separator) => {
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
)

const optional = feature(
  (input, offset, element) => {
    const data = element(input, offset)

    data.found = true

    return data
  }
)

const choose = feature(
  (input, offset, ...args) => {
    const options = args.slice(0)

    let result = { found: false, to: offset }

    do {
      result = options.shift()(input, result.to)
    } while (!result.found && options.length)

    if (!result.found) {
      result.data = undefined
    }

    return result
  }
)

module.exports = {
  choose,
  match,
  optional,
  repeat,
  sequence,

  list
}
