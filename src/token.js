const curry = require('./curry')

module.exports = function (type, regex) {
  if (typeof type !== 'string' || !/^[\w^\d]\w+$/.test(type)) {
    throw new Error('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
  }
  if (!(regex instanceof RegExp)) {
    throw new Error(`The regex is not instance of RegExp.`)
  }
  if (/[g]/.test(regex.flags)) {
    throw new Error(`The regex g flag is not accepted.`)
  }
  if (!/[y]/.test(regex.flags)) {
    throw new Error(`The regex must always have the y flag ( sticky ).`)
  }

  return ({
    [type]: (transform = data => data) =>
      curry(({
        [type]: (input, offset) => {
          regex.lastIndex = offset

          const match = regex.exec(input)

          if (match === null) {
            const info = { found: false, from: offset, to: offset, type }

            info.data = transform({}, info)

            return info
          }

          const info = { found: true, from: match.index, to: match.index + match[0].length, type }

          info.data = transform(
            match.length === 1
              ? match[0]
              : match.reduce((data, val, i) => { data[`$${i}`] = val; return data }, {})
          )

          return info
        }
      })[type])
  })[type]
}
