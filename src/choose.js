
module.exports = function (type, ...options) {
  return (transform = data => data) => (input, offset) => {
    for (const option of options) {
      const optionResult = option(input, offset)

      if (optionResult.found) {
        const result = { found: true, from: optionResult.from, to: optionResult.to, type }

        result.data = transform(optionResult, result)

        return result
      }
    }

    const result = { found: false, from: offset, to: offset, type }

    result.data = transform({}, result)

    return result
  }
  // TODO: make it curriable
  // TODO: fail fast validations : type, no options, option are functions, etc
}
