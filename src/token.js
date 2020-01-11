const curry = require('./curry')

module.exports = curry(
  function (type, regex) {
    const $regex = new RegExp(
      regex.source,
      /[yg]/.test(regex.flags) ? regex.flags : `g${regex.flags}`
    )

    return (transform = (...results) => results) =>
      curry(
        (input, offset) => {
          $regex.lastIndex = offset

          const match = $regex.exec(input)

          return match !== null
            ? transform(match.reduce((data, val, i) => { data[`$${i}`] = val; return data }, {}), { found: true, from: match.index, to: match.index + match[0].length, type })
            : transform({}, { found: false, from: offset, to: offset, type })
        }
      )
  }
)
