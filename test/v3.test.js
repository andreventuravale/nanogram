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
  const optional = item => [item, '?']
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
    console.log('entering leaf', leaf, sumOfIndexesAlong)

    if (leaf instanceof Array) {
      if (leaf.length === 2 && leaf[0] instanceof Array && typeof leaf[1] === 'string') {
        visitBranch(grammar, rule, leaf[0], sumOfIndexesAlong, fix)
      } else {
        throw new Error('Unexpected scenario: ' + leaf)
      }
    } else if (typeof leaf === 'string') {
      if (rule === leaf) {
        if (sumOfIndexesAlong === 0) {
          console.log('recursion of', leaf, sumOfIndexesAlong)
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

      visitLeaf(grammar, rule, leaf, leafIndex, () => fix(leaf, leafIndex))

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
  suite('grammar', () => {
    test.only('accepts a string', () => {
      const result = grammar(({ define }) => {
        define('foo', 'bar')
      })

      expect(result).to.eql([
        ['foo', 'bar']
      ])
    })

    test.only('concat', () => {
      const result = grammar(({ define, concat }) => {
        define('a', concat('b', 'c'))
      })

      expect(result).to.eql([
        ['a', [['b', 'c'], ',']]
      ])
    })

    test.only('choose', () => {
      const result = grammar(({ define, choose }) => {
        define('a', choose('b', 'c'))
      })

      expect(result).to.eql([
        ['a', [['b', 'c'], '|']]
      ])
    })

    test.only('repeat', () => {
      const result = grammar(({ define, repeat }) => {
        define('a', repeat('a', 'b'))
      })

      expect(result).to.eql([
        ['a', [['a', 'b'], '+']]
      ])
    })

    test.only('optional', () => {
      const result = grammar(({ define, optional }) => {
        define('a', optional('b'))
      })

      expect(result).to.eql([
        ['a', ['b', '?']]
      ])
    })

    test.only('many defines', () => {
      const result = grammar(({ define }) => {
        define('a', 'b')
        define('a', 'c')
        define('x', 'y')
      })

      expect(result).to.eql([
        ['a', 'b'],
        ['a', 'c'],
        ['x', 'y']
      ])
    })

    test.only('nesting - choose( concat( regex, string ), string )', () => {
      const result = grammar(({ choose, define, concat }) => {
        define('foo', choose(
          concat(/qux/, 'waldo'),
          'bar'
        ))
      })

      expect(result).to.eql([
        ['foo', [[[[/qux/, 'waldo'], ','], 'bar'], '|']]
      ])
    })
  })

  suite('factor', () => {
    test.only('case', () => {
      const result = factor(grammar(({ define }) => {
        define('foo', 'bar')
        define('a', 'b')
        define('a', 'c')
        define('x', 'y')
        define('x', 'z')
      }))

      expect(result).to.eql([
        ['foo', 'bar'],
        ['a', [['b', 'c'], '|']],
        ['x', [['y', 'z'], '|']]
      ])
    })

    test.only('case', () => {
      const result = factor(grammar(({ define, concat }) => {
        define('a', concat('b', 'c'))
        define('a', concat('b', 'd'))
      }))

      // require('clipboardy').writeSync(JSON.stringify(result, 0, 2))

      expect(result).to.eql([
        [
          'a',
          [
            [
              [['b', 'c'], ','],
              [['b', 'd'], ',']
            ],
            '|'
          ]
        ]
      ])
    })
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
              define('a', concat('a', 'b'))
            }
          )
        )
      ).to.eql(
        grammar(
          ({ choose, concat, define }) => {
            define('a', 'a_')
            define('a_', choose(concat('b', 'a_'), 'E'))
          }
        )
      )
    })

    test('case', () => {
      expect(
        optimize(
          grammar(
            ({ define, concat }) => {
              define('a', concat('a', 'α₁'))
              define('a', concat('a', 'α₂'))
              define('a', concat('a', 'α₃'))
              define('a', 'β₁')
              define('a', 'β₂')
              define('a', 'β₃')
            }
          )
        )
      ).to.eql(
        []
      )
      factor(
        grammar(
          ({ define, concat }) => {
            define('a', concat('β₁', 'a_'))
            define('a', concat('β₂', 'a_'))
            define('a', concat('β₃', 'a_'))
            define('a_', concat('α₁', 'a_'))
            define('a_', concat('α₂', 'a_'))
            define('a_', concat('α₃', 'a_'))
            define('a_', 'E')
          }
        )
      )
    })
  })
})
