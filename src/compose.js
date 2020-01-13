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
        let currentData = {}
        let currentInfo = { found: true }
        let currentResult = [currentData, currentInfo]
        const composedData = {}
        const composedInfo = {
          found: true,
          from: offset,
          to: i,
          type
        }
        const stat = {}

        for (let index = 0; currentInfo.found && index < list.length; index++) {
          const element = list[index]

          currentResult = element(input, i)
          ;[currentData, currentInfo] = currentResult

          if (currentInfo.found) {
            i = currentInfo.to
            stat[currentInfo.type] = stat[currentInfo.type] || { count: -1 }
            stat[currentInfo.type].count++
            composedData[`${currentInfo.type}${stat[currentInfo.type].count}`] = currentData

            // if (typeof currentInfo.type === 'symbol') {
            //   const currentType = currentInfo.type
            //   composedData[currentType] = composedData[currentType] || []
            //   composedData[currentType].push(currentResult)
            // }
          }
        }

        composedInfo.found = !!(currentInfo && currentInfo.found)
        composedInfo.from = offset
        composedInfo.to = i

        return transform(composedData, composedInfo)
      }
  )
}
