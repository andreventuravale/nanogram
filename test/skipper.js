module.exports = regex => (input, offset) => {
  while (regex.test(input[offset])) offset++

  return offset
}
