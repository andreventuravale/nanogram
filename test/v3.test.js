const { expect } = require('chai')

const grammar = function (build) {
  const result = []

  const item = value => {
    if (value instanceof RegExp) {
      return value
    } else if (typeof value === 'string') {
      return value
    } else {
      throw new Error(`Invalid value: ${value}`)
    }
  }
  const choose = (...list) => [list.map(item), '|']
  const concat = (...list) => [list.map(item), ',']
  const define = (name, value) => {
    if (!(
      value instanceof RegExp ||
      typeof value === 'string' ||
      (value instanceof Array && value.length === 2 && /^[,?*+|]$/.test(value[1]))
    )) {
      throw new Error(`Unknow value: ${value}`)
    }

    result.push([name, value])
  }
  const optional = (...list) => [list.map(item), '?']
  const repeat = (...list) => [list.map(item), '+']

  build({ choose, concat, define, optional, repeat })

  return result
}

const factor = grammar => {
  const hash = {}
  const r = []
  for (const [key, value] of grammar) {
    if (!hash[key]) {
      hash[key] = []
      r.push([key, hash[key]])
    }
    hash[key].push(value)
  }
  return r.map(([key, value]) => {
    return [key, value.length === 1 ? value[0] : value]
  })
}

suite('v3', () => {
  test('grammar', () => {
    const result = grammar(({ define, choose, optional, repeat, concat }) => {
      define('asterisk', /\*/)
      define('digit', /\d/)
      define('id', /\w/)
      define('minus', /-/)
      define('parclose', /\)/)
      define('paropen', /\(/)
      define('plus', /\+/)

      define('expr', concat('expr', 'minus', 'term'))
      define('expr', concat('term'))

      define('factor', choose('id', 'digit'))
      define('factor', concat('paropen', 'expr', 'parclose'))

      define('term', 'factor')
      define('term', concat('term', 'asterisk', 'factor'))
    })

    require('clipboardy').writeSync(JSON.stringify(result, 0, 2))

    expect(result).to.eql([
      ['asterisk', /\*/],
      ['digit', /\d/],
      ['id', /\w/],
      ['minus', /-/],
      ['parclose', /\)/],
      ['paropen', /\(/],
      ['plus', /\+/],
      ['expr', [['expr', 'minus', 'term'], ',']],
      ['expr', [['term'], ',']],
      ['factor', [['id', 'digit'], '|']],
      ['factor', [['paropen', 'expr', 'parclose'], ',']],
      ['term', 'factor'],
      ['term', [['term', 'asterisk', 'factor'], ',']]
    ])
  })

  test('factor', () => {
    const result = factor(grammar(({ define, choose, optional, repeat, concat }) => {
      define('asterisk', /\*/)
      define('digit', /\d/)
      define('id', /\w/)
      define('minus', /-/)
      define('parclose', /\)/)
      define('paropen', /\(/)
      define('plus', /\+/)

      define('expr', concat('expr', 'minus', 'term'))
      define('expr', concat('term'))

      define('factor', choose('id', 'digit'))
      define('factor', concat('paropen', 'expr', 'parclose'))

      define('term', 'factor')
      define('term', concat('term', 'asterisk', 'factor'))
    }))

    require('clipboardy').writeSync(JSON.stringify(result, 0, 2))

    expect(result).to.eql([
      ['asterisk', /\*/],
      ['digit', /\d/],
      ['id', /\w/],
      ['minus', /-/],
      ['parclose', /\)/],
      ['paropen', /\(/],
      ['plus', /\+/],
      ['expr', [
        [['expr', 'minus', 'term'], ','],
        [['term'], ',']
      ]],
      ['factor', [
        [['id', 'digit'], '|'],
        [['paropen', 'expr', 'parclose'], ',']
      ]],
      ['term', [
        'factor',
        [['term', 'asterisk', 'factor'], ',']
      ]]
    ])
  })
})