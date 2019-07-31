
module.exports = function (fn) {
  const seed = (...currentArgs) => {
    if (currentArgs.length >= fn.length) {
      return fn.apply(this, currentArgs)
    } else {
      return function (...newArgs) {
        return seed.call(this, ...currentArgs, ...newArgs)
      }
    }
  }

  return seed
}
