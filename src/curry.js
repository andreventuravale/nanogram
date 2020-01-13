
module.exports = function (original) {
  const name = original.name

  const context = {
    [name]: function (...currentArgs) {
      if (currentArgs.length >= original.length) {
        return original.apply(this, currentArgs)
      } else {
        return ({
          [name]: function (...newArgs) {
            return context[name].call(this, ...currentArgs, ...newArgs)
          }
        })[name]
      }
    }
  }

  return context[name]
}
