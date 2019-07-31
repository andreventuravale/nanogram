module.exports = function (type, ...list) {
  if (list.length === 0) {
    return (input, offset) => ([false, offset, offset, type, []])
  }

  return (input, offset) => {
    let i = offset
    let result = [true]
    const results = []

    for (let index = 0; result[0] && index < list.length; index++) {
      const element = list[index]

      result = element(input, i)

      if (result[0]) {
        i = result[2]
        results.push(result)
      }
    }

    if (result && result[0]) {
      return [true, offset, i, type, results]
    } else {
      return [false, offset, i, type, results]
    }
  }
}
