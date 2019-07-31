module.exports = function (...list) {
  return (input, offset) => {
    let i = offset
    let result
    const results = []
    for (let index = 0; index < list.length; index++) {
      const element = list[index]
      result = element(input, i)
      i = result[2]
      results.push(result)
    }
    if (result && result[0]) {
      return [true, offset, i, results]
    } else {
      return [false]
    }
  }
}
