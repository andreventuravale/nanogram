module.exports = function (regex) {
  return (input, offset) => {
    regex.lastIndex = offset

    const match = regex.exec(input)

    return match.index + match[0].length
  }
}
