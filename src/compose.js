module.exports = function (type, ...list) {
  if (typeof type !== 'string' || !/^[\w^\d]\w+$/.test(type)) {
    throw new Error('The type must be a string and satisfy the following regex: /^[\\w^\\d]\\w+$/.')
  }
  if (list.length === 0) {
    throw new Error('A composition must have at least one element.')
  }

  return ({
    [type]: (transform = data => data) =>
      ({
        [type]: (input, offset) => {
          let i = offset
          let currentResult = { ignored: true }
          const composedData = {}
          const composedInfo = {
            found: true,
            from: offset,
            to: i,
            type
          }
          const stat = {}

          let lastElement

          for (let index = 0; (currentResult.ignored || currentResult.found) && index < list.length; index++) {
            lastElement = list[index]

            currentResult = lastElement(input, i)

            if (currentResult.found) {
              i = currentResult.to

              if (!currentResult.hidden) {
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
          }

          composedInfo.found = !!(currentResult && (currentResult.ignored || currentResult.found))
          composedInfo.from = offset
          composedInfo.to = i

          composedInfo.data = transform(composedData, composedInfo)

          if (!composedInfo.ignored && !composedInfo.found) {
            const lines = input.slice(0, i).split('\n')
            const line = lines.length
            const column = lines.pop().length + 1

            composedInfo.errors = [
              {
                line,
                column,
                message: `${line}:${column}: expected element not found: "${lastElement.name}"`
              }
            ]
          }

          return composedInfo
        }
      })[type]
  })[type]
}
