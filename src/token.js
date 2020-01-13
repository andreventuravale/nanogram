const curry = require('./curry')

module.exports = curry(
  function (type, regex) {
    if (!(regex instanceof RegExp)) {
      throw new Error(`The regex is not instance of RegExp.`)
    }
    if (/[g]/.test(regex.flags)) {
      throw new Error(`The regex g flag is not accepted.`)
    }
    if (!/[y]/.test(regex.flags)) {
      throw new Error(`The regex should always have the y flag ( sticky ).`)
    }

    return (transform = (...results) => results) =>
      curry(
        (input, offset) => {
          regex.lastIndex = offset

          const match = regex.exec(input)

          return match !== null
            ? transform(
              match.length === 1
                ? match[0]
                : match.reduce((data, val, i) => { data[`$${i}`] = val; return data }, {}),
              { found: true, from: match.index, to: match.index + match[0].length, type }
            )
            : transform({}, { found: false, from: offset, to: offset, type })
        }
      )
  }
)
