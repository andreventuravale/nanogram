const curry = require('./curry')

module.exports = function (type, ...list) {
  if (list.length === 0) {
    return curry(
      (transform = result => result) =>
        (input, offset) =>
          transform({
            found: false,
            from: offset,
            to: offset,
            type,
            data: []
          })
    )
  }

  return curry(
    (transform = (data, info) => [data, info]) =>
      (input, offset) => {
        let i = offset
        let currentResult = { found: true }
        const composedData = {}
        const composedInfo = {
          found: true,
          from: offset,
          to: i,
          type
        }
        const stat = {}

        for (let index = 0; currentResult.found && index < list.length; index++) {
          const element = list[index]

          currentResult = element(input, i)

          if (currentResult.found) {
            i = currentResult.to

            stat[currentResult.type] = stat[currentResult.type] || { count: 0 }
            stat[currentResult.type].count++

            if (stat[currentResult.type].count === 2) {
              composedData[`${currentResult.type}0`] = composedData[currentResult.type]
              delete composedData[currentResult.type]
              composedData[`${currentResult.type}${stat[currentResult.type].count - 1}`] = currentResult.data
            } else if (stat[currentResult.type].count > 1) {
              composedData[`${currentResult.type}${stat[currentResult.type].count - 1}`] = currentResult.data
            } else {
              composedData[currentResult.type] = currentResult.data
            }
          }
        }

        composedInfo.found = !!(currentResult && currentResult.found)
        composedInfo.from = offset
        composedInfo.to = i

        return transform(composedData, composedInfo)
      }
  )
}
