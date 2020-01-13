module.exports = function (type, element, separator) {
  return (transform = data => data) =>
    (input, offset) => {
      const elems = []
      let elem = element(input, offset)

      if (elem.found) {
        const first = elem
        let last = elem
        let sep

        first.data = transform(first.data, first)
        elems.push(first)

        do {
          sep = separator(input, last.to)

          if (sep.found) {
            elem = element(input, sep.to)

            if (elem.found) {
              last = elem
              last.data = transform(last.data, last)
              elems.push(last)
            }
          }
        } while (sep.found && elem.found)

        return { found: true, from: first.from, to: last.to, type, data: elems }
      }

      const lines = input.slice(0, offset).split('\n')
      const line = lines.length
      const column = lines.pop().length + 1

      const errors = [
        {
          line,
          column,
          message: `${line}:${column}: expected element not found: "${type} > ${element.name}"`
        }
      ]

      return { found: false, from: offset, to: offset, type, data: [], errors }
    }
}
