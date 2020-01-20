const { expect } = require('chai')

const nanogram = require('../src')

const { skipper } = require('../src/helpers')

const whitespaceSkipper = skipper(/\s/)

suite('v2 > samples', () => {
  test('small c program', () => {
    const processor = { pre: { offset: whitespaceSkipper } }

    const choose = nanogram.choose
    const list = nanogram.list
    // const match = nanogram.match
    // const optional = nanogram.optional
    // const repeat = nanogram.repeat
    const sequence = nanogram.sequence

    // const choose = nanogram.choose(processor)
    // const list = nanogram.list(processor)
    const match = nanogram.match(processor)
    const optional = nanogram.optional(processor)
    // const repeat = nanogram.repeat(processor)
    // const sequence = nanogram.sequence(processor)

    const braceclose = match(/\}/)
    const braceopen = match(/\{/)
    const comma = match(/,/)
    const div = match(/\//)
    const id = match(/[a-zA-Z_]\w*/)
    const intLit = match(/\d+/)
    const minus = match(/-/)
    const mult = match(/\*/)
    const parclose = match(/\)/)
    const paropen = match(/\(/)
    const plus = match(/\+/)
    const semicolon = match(/;/)
    const strLit = match(/"[^"]*"/)
    const voidkw = match(/void/)
    const ws = nanogram.match(/\s+/)
    const e = (input, offset) => ({ found: true, from: offset, to: offset, data: Symbol.for('empty') })

    const type = choose(voidkw, id)

    const rules = {
      lazy: rule => (...args) => rules[rule](...args)
    }

    rules.expr = sequence(rules.lazy('term'), rules.lazy('expr_'))
    rules.expr_ = choose(sequence(choose(plus, minus), rules.lazy('term'), rules.lazy('expr_')), e)
    rules.term = sequence(rules.lazy('factor'), rules.lazy('term_'))
    rules.term_ = choose(sequence(choose(mult, div), rules.lazy('factor'), rules.lazy('term_')), e)
    rules.factor = choose(sequence(paropen, rules.lazy('expr'), parclose), intLit, strLit)

    const arg = sequence(rules.expr)
    const argList = list(arg, comma)
    const fnCall = sequence(id, paropen, argList, parclose)
    const statement = choose(fnCall)
    const block = sequence(braceopen, list(statement, semicolon, { trailSep: true }), braceclose)
    const param = sequence(id, ws, type)
    const paramList = list(param, comma)
    const procDecl = sequence(type, ws, id, paropen, optional(paramList), parclose, block)
    const program = sequence(list(choose(procDecl, statement), semicolon), ws)

    const input = `
      void main() {
        printf("%d %d", (1 + 1), 1 - 1);
      }
    `

    const result = program(input, 0)

    console.log(require('util').inspect(result, 0, 10, 1))

    console.log()

    expect(`|${input.slice(result.to)}|`, 'there are still some input to parse').to.eql('||')
  })
})
