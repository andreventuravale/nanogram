const compose = require('./compose')
const curry = require('./curry')
const list = require('./list')
const optional = require('./optional')
const token = require('./token')
const choose = require('./choose')

module.exports = {
  choose,
  compose: curry(compose),
  list: curry(list),
  optional,
  token: curry(token)
}
