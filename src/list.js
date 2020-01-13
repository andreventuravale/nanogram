module.exports = function (type, element, separator) {
  return (transform = data => data) =>
    (input, offset) => {
      const elems = []
      let elem = element(input, offset)

      if (elem.found) {
        const first = elem
        let last = elem
        let sep

        elems.push(first)

        do {
          sep = separator(input, last.to)

          if (sep.found) {
            elem = element(input, sep.to)

            if (elem.found) {
              last = elem
              elems.push(last)
            }
          }
        } while (sep.found && elem.found)

        const result = { found: true, from: first.from, to: last.to, type, data: elems }

        if (typeof elem.type === 'symbol') {
          result[elem.type] = elems
        }

        return result
      }

      return { found: false, from: offset, to: offset, type, data: [] }
    }
}
