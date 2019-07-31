module.exports = function (element, separator, input, offset) {
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
