function compose () {

}

function many (input, offset, element, separator) {
  let e = element(input, offset)
  if (e[0]) {
    const f = e
    let l = e
    let s
    do {
      s = separator(input, l[2])
      if (s[0]) {
        e = element(input, s[2])
        if (e[0]) { l = e }
      }
    } while (s[0] && e[0])
    return [true, f[1], l[2]]
  }
  return [false]
}

function regex (input, offset, regex) {
  const i = offset
  let j = offset
  const k = regex.lastIndex
  while (regex.test(input[j])) {
    j++
    regex.lastIndex = k // restore the last index for global expressions
  }
  return j > i ? [true, i, j] : [false]
}

function text (input, offset, value) {
  let i = offset
  let j = 0
  while (input[i] && input[i] === value[j]) {
    i++
    j++
  }
  return j === value.length ? [true, offset, i] : [false]
}

module.exports = {
  compose,
  many,
  regex,
  text
}
