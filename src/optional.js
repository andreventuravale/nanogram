
module.exports = function (something) {
  return (input, offset) => {
    const result = something(input, offset)

    result[0] = true

    return result
  }
}
