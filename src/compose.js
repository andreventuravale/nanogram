module.exports = function (type, ...list) {
  if (list.length === 0) {
    return (input, offset) => ({
      found: false,
      from: offset,
      to: offset,
      type,
      data: []
    })
  }

  return (input, offset) => {
    let i = offset
    let currentResult = { found: true }
    const composedData = []
    const composedResults = {
      found: true,
      from: offset,
      to: i,
      type,
      data: composedData
    }

    for (let index = 0; currentResult.found && index < list.length; index++) {
      const element = list[index]

      currentResult = element(input, i)

      if (currentResult.found) {
        i = currentResult.to
        composedData.push(currentResult)

        const currentType = currentResult.type
        composedResults[currentType] = composedResults[currentType] || []
        composedResults[currentType].push(currentResult)
      }
    }

    composedResults.found = !!(currentResult && currentResult.found)
    composedResults.from = offset
    composedResults.to = i

    return composedResults
  }
}
