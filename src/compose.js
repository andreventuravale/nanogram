module.exports = function (type, ...list) {
  if (list.length === 0) {
    return (input, offset) => ([false, offset, offset, type, []])
  }

  return (input, offset) => {
    let i = offset
    let currentResult = [true]
    const composedData = []
    const composedResults = [true, offset, i, type, composedData]

    for (let index = 0; currentResult[0] && index < list.length; index++) {
      const element = list[index]

      currentResult = element(input, i)

      if (currentResult[0]) {
        i = currentResult[2]
        composedData.push(currentResult)

        const currentId = currentResult[3]
        composedResults[currentId] = composedResults[currentId] || []
        composedResults[currentId].push(currentResult)
      }
    }

    composedResults[0] = !!(currentResult && currentResult[0])
    composedResults[1] = offset
    composedResults[2] = i

    return composedResults
  }
}
