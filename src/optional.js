
module.exports = function (something) {
  return (input, offset) => {
    const result = something(input, offset)

    if (!result.found) {
      result.ignored = true
    }

    return result
  }
}
