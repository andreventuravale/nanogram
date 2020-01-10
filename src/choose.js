
module.exports = function (type, ...options) {
  return (input, offset) => {
    for (const option of options) {
      const result = option(input, offset)

      if (result.found) {
        return { found: true, from: result.from, to: result.to, type, data: [result] }
      }
    }

    return { found: false, from: offset, to: offset, type, data: [] }
  }
}
