
const log = a => require('util').inspect(a, true, 100, true)

function curry (fn) {
  const seed = (...currentArgs) => {
    if (currentArgs.length >= fn.length) {
      return fn.apply(this, currentArgs)
    } else {
      return function (...newArgs) {
        return seed.call(this, ...currentArgs, ...newArgs)
      }
    }
  }

  return seed
}

function compose (...list) {
  return (input, offset) => {
    let i = offset
    let r
    const results = []
    for (let index = 0; index < list.length; index++) {
      const element = list[index]
      r = element(input, i)
      i = r[2]
      results.push(r)
    }
    if (r && r[0]) {
      return [true, offset, i, results]
    } else {
      return [false]
    }
  }
}

function list (element, separator, input, offset) {
  const elems = []
  let elem = element(input, offset)
  if (elem[0]) {
    const first = elem
    let last = elem
    let sep
    elems.push(first)
    do {
      sep = separator(input, last[2])
      if (sep[0]) {
        elem = element(input, sep[2])
        if (elem[0]) {
          last = elem
          elems.push(last)
        }
      }
    } while (sep[0] && elem[0])
    return [true, first[1], last[2], elems]
  }
  return [false]
}

function one (regex, input, offset) {
  const $regex = new RegExp(
    regex.source,
    /[yg]/.test(regex.flags) ? regex.flags : `g${regex.flags}`
  )
  $regex.lastIndex = offset
  const match = $regex.exec(input)
  return match !== null
    ? [true, match.index, match.index + match[0].length, match.slice(0)]
    : [false]
}

module.exports = {
  compose,
  list: curry(list),
  one: curry(one)
}
