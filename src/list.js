module.exports = function (type, element, separator) {
  return ({
    [type]: (transform = data => data) => ({
      [type]: (input, offset) => {
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

          const result = { found: true, from: first.from, to: last.to, type }

          result.data = transform(elems, result)

          return result
        }

        const lines = input.slice(0, offset).split('\n')
        const line = lines.length
        const column = lines.pop().length + 1

        const result = { found: false, from: offset, to: offset, type }

        result.data = transform([], result)

        result.errors = [
          {
            line,
            column,
            message: `${line}:${column}: expected element not found: "${type} > ${element.name}"`
          }
        ]

        return result
      }
    })[type]
  })[type]
}
