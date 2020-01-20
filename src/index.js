const feature = custom => {
  return (processor, ...args) => {
    if (typeof processor === 'object' && !(processor instanceof RegExp) && args.length === 0) {
      return (...args1) => {
        return (transformer, ...args2) => {
          if (typeof transformer === 'function' && args2.length === 0) {
            return (input, offset) => {
              if (processor.pre && processor.pre.offset) {
                offset = processor.pre.offset(input, offset)
              }

              const result = custom(input, offset, ...args1)

              result.data = transformer(result.data, result)

              return result
            }
          } else {
            const input = transformer
            let offset = args2[0]

            if (processor.pre && processor.pre.offset) {
              offset = processor.pre.offset(input, offset)
            }

            const result = custom(input, offset, ...args1)

            return result
          }
        }
      }
    } else {
      return (transformer, ...args2) => {
        if (typeof transformer === 'function' && args2.length === 0) {
          return (input, offset) => {
            const result = custom(input, offset, processor, ...args)

            result.data = transformer(result.data, result)

            return result
          }
        } else {
          const input = transformer
          const offset = args2[0]

          const result = custom(input, offset, processor, ...args)

          return result
        }
      }
    }
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
  (input, offset, element, separator, options) => {
    const data = []
    const first = element(input, offset)
    let last = first
    let tail = first
    let sep

    while (last.found) {
      tail = last

      data.push(tail)

      sep = separator(input, last.to)

      if (sep.found) {
        last = element(input, sep.to)
      } else {
        break
      }
    }

    const hasTrailingSep = sep && sep.found && sep.from >= tail.to
    const consumeTrailingSep = options && options.trailingSeparator

    return {
      found: data.length > 0, from: offset, to: hasTrailingSep && consumeTrailingSep ? sep.to : tail.to, data
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
  list,
  match,
  optional,
  repeat,
  sequence
}
