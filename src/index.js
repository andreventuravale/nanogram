const compose = require('./compose')
const curry = require('./curry')
const list = require('./list')
const token = require('./token')

module.exports = {
  compose: curry(compose),
  list: curry(list),
  token: curry(token)
}
