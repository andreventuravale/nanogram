module.exports = function (type, regex, input, offset) {
  const $regex = new RegExp(
    regex.source,
    /[yg]/.test(regex.flags) ? regex.flags : `g${regex.flags}`
  )

  $regex.lastIndex = offset

  const match = $regex.exec(input)

  return match !== null
    ? { found: true, from: match.index, to: match.index + match[0].length, type, data: match.slice(0) }
    : { found: false, from: offset, to: offset, type, data: [] }
}
