module.exports = function (type, regex, input, offset) {
  const $regex = new RegExp(
    regex.source,
    /[yg]/.test(regex.flags) ? regex.flags : `g${regex.flags}`
  )

  $regex.lastIndex = offset

  const match = $regex.exec(input)

  return match !== null
    ? [true, match.index, match.index + match[0].length, type, match.slice(0)]
    : [false, offset, offset, type, []]
}
