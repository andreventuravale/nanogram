module.exports = function (regex, input, offset) {
  const $regex = new RegExp(
    regex.source,
    /[yg]/.test(regex.flags) ? regex.flags : `g${regex.flags}`
  )

  $regex.lastIndex = offset

  const match = $regex.exec(input)

  return match !== null
    ? [true, match.index, match.index + match[0].length, match.slice(0)]
    : [false]
}
