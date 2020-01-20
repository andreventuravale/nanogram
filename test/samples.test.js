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

    const comma = match(/,/)
    const braceclose = match(/\}/)
    const braceopen = match(/\{/)
    const parclose = match(/\)/)
    const paropen = match(/\(/)
    const semicolon = match(/;/)

    const ws = nanogram.match(/\s+/)
    const id = match(/[a-zA-Z_]\w*/)
    const voidkw = match(/void/)
    const type = choose(voidkw, id)
    const strLit = match(/"[^"]*"/)
    const expr = choose(strLit)
    const arg = sequence(expr)
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
        printf("hello world");
      }
    `

    const result = program(input, 0)

    console.log(require('util').inspect(result, 0, 10, 1))

    console.log()

    expect(`|${input.slice(result.to)}|`, 'there are still some input to parse').to.eql('||')
  })
})
