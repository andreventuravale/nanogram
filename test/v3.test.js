const { expect } = require('chai')

const grammar = function (build) {
  const result = []

  const item = value => {
    if (value instanceof Array && value.length === 2 && value[0] instanceof Array && typeof value[1] === 'string') {
      return value
    } else if (value instanceof RegExp) {
      return value
    } else if (typeof value === 'symbol') {
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
    return [key, value.length === 1 ? value[0] : [value, '|']]
  })
}

const optimize = grammar => {
  grammar = factor(grammar)

  function visitLeaf (grammar, rule, leaf, sumOfIndexesAlong, fix) {
    // console.log('entering leaf')

    if (leaf instanceof Array) {
      if (leaf.length === 2 && leaf[0] instanceof Array && typeof leaf[1] === 'string') {
        visitBranch(grammar, rule, leaf[0], sumOfIndexesAlong, fix)
      } else {
        throw new Error('Unexpected scenario: ' + leaf)
      }
    } else if (typeof leaf === 'string') {
      if (rule === leaf) {
        if (sumOfIndexesAlong === 0) {
          // console.log('recursion of', leaf, sumOfIndexesAlong)
          fix(leaf, sumOfIndexesAlong)
        }
      }
    } else if (!(leaf instanceof RegExp)) {
      throw new Error('Unexpected scenario: ' + leaf)
    }
  }

  function visitBranch (grammar, rule, branch, branchIndex, fix) {
    // console.log('entering branch')
    let leafIndex = 0

    for (const leaf of branch) {
      // console.log('def', leaf)

      visitLeaf(grammar, rule, leaf, branchIndex + leafIndex, () => fix(leaf, leafIndex))

      leafIndex++
    }
  }

  let ruleIndex = 0

  for (let [rule, def] of grammar.slice(0)) {
    // console.log(rule, 'def', def)

    visitLeaf(grammar, rule, def, 0, function (defToFix, defToFixIndex) {
      if (def instanceof Array && defToFix instanceof Array) {
        def[0].splice(defToFixIndex, 1)
        defToFix[0].shift()
        defToFix[0].push(`${rule}_`)

        if (!grammar[ruleIndex + 1]) {
          grammar.push([`${rule}_`, [['E'], '|']])
        }

        grammar[ruleIndex + 1][1][0].splice(grammar[ruleIndex + 1][1][0].length - 1, 0, defToFix)

        if (def[0].length === 1) {
          def = def[0][0]
          grammar.splice(ruleIndex, 1, [rule, def])
        }

        def = [[def, `${rule}_`], ',']

        grammar.splice(ruleIndex, 1, [rule, def])
      } else if (def instanceof Array) {
        def[0].splice(defToFixIndex, 1)

        if (def[0].length === 1) {
          def = def[0][0]
          grammar[ruleIndex] = [rule, def]
        }

        if (def instanceof Array) {
          throw new Error('not impl')
        } else {
          grammar[ruleIndex] = [rule, `${rule}_`]
        }

        if (!grammar[ruleIndex + 1]) {
          grammar.push([`${rule}_`, [['E'], '|']])
        }

        grammar[ruleIndex + 1][1][0].unshift([[def, `${rule}_`], ','])
      } else {
        if (!grammar[ruleIndex + 1]) {
          grammar.push([`${rule}_`, 'E'])
        }

        grammar[ruleIndex] = [rule, `${rule}_`]
      }
    })

    ruleIndex++
  }

  ruleIndex = 0

  // for (let [rule, def] of grammar.slice(0)) {
  //   if (def instanceof Array) {
  //     if (def[0].length === 1) {
  //       def = def[0][0]
  //       grammar.splice(ruleIndex, 1, [rule, def])
  //     }
  //   }

  //   ruleIndex++
  // }

  return grammar
}

suite('v3', () => {
  test('grammar', () => {
    const result = grammar(({ choose, define, optional, repeat, concat }) => {
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

    // require('clipboardy').writeSync(JSON.stringify(result, 0, 2))

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

  test('grammar - choose - accepts an array from a concat', () => {
    const result = grammar(({ choose, define, optional, repeat, concat }) => {
      define('expr', choose(
        concat('expr', 'minus', 'term'),
        'term'
      ))
    })

    // require('clipboardy').writeSync(JSON.stringify(result, 0, 2))

    expect(result).to.eql([
      [
        'expr',
        [
          [
            [['expr', 'minus', 'term'], ','],
            'term'
          ],
          '|'
        ]
      ]
    ])
  })

  test('factor', () => {
    const result = factor(grammar(({ choose, define, optional, repeat, concat }) => {
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

    // require('clipboardy').writeSync(JSON.stringify(result, 0, 2))

    expect(result).to.eql([
      ['asterisk', /\*/],
      ['digit', /\d/],
      ['id', /\w/],
      ['minus', /-/],
      ['parclose', /\)/],
      ['paropen', /\(/],
      ['plus', /\+/],
      ['expr', [
        [
          [['expr', 'minus', 'term'], ','],
          [['term'], ',']
        ],
        '|'
      ]],
      ['factor', [
        [
          [['id', 'digit'], '|'],
          [['paropen', 'expr', 'parclose'], ',']
        ],
        '|'
      ]],
      ['term', [
        [
          'factor',
          [['term', 'asterisk', 'factor'], ',']
        ],
        '|'
      ]]
    ])
  })

  suite('left recursion', () => {
    test('case', () => {
      expect(
        optimize(
          grammar(
            ({ define }) => {
              define('expr', 'expr')
            }
          )
        )
      ).to.eql(
        grammar(
          ({ define }) => {
            define('expr', 'expr_')
            define('expr_', 'E')
          }
        )
      )
    })

    test('case', () => {
      expect(
        optimize(
          grammar(
            ({ concat, define }) => {
              define('expr', concat('expr', 'minus', 'term'))
              define('expr', 'term')
            }
          )
        )
      ).to.eql(
        grammar(
          ({ choose, concat, define }) => {
            define('expr', concat('term', 'expr_'))
            define('expr_', choose(concat('minus', 'term', 'expr_'), 'E'))
          }
        )
      )
    })

    test('case', () => {
      expect(
        optimize(
          grammar(
            ({ choose, define, optional, repeat, concat }) => {
              define('expr', concat('expr', 'term'))
            }
          )
        )
      ).to.eql(
        grammar(
          ({ choose, concat, define }) => {
            define('expr', 'expr_')
            define('expr_', choose(concat('term', 'expr_'), 'E'))
          }
        )
      )
      grammar(
        ({ choose, concat, define }) => {
          define('expr', 'expr_')
        }
      )
    })
  })
})
