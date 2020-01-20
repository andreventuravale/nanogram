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
    const optional = nanogram.optional
    const repeat = nanogram.repeat
    const sequence = nanogram.sequence

    // const choose = nanogram.choose(processor)
    // const list = nanogram.list(processor)
    const match = nanogram.match(processor)
    // const optional = nanogram.optional(processor)
    // const repeat = nanogram.repeat(processor)
    // const sequence = nanogram.sequence(processor)

    const semicolon = match(/;/)
    const ws = nanogram.match(/\s+/)
    const id = match(/[a-zA-Z_]\w*/)
    const voidkw = match(/void/)
    const type = choose(voidkw, id)
    const proc = sequence(type, ws, id)
    const statement = choose(proc)
    const program = list(statement, semicolon)

    const result = program(`
      void main() {
        printf("hello world");
      }
    `, 0)

    expect(result).to.eql({})
  })
})
