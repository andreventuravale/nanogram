
module.exports = function (something) {
  return (input, offset) => {
    const result = something(input, offset)

    result.found = true

    return result
  }
}
