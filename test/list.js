const { expect } = require('chai')

const { list, token } = require('../src')

suite('list', () => {
  test('true - happy case', () => {
    const source = '1,2,3'

    const element = (input, offset) => token('elem', /\d/, input, offset)()

    const separator = (input, offset) => token('sep', /,/, input, offset)()

    expect(list('list', element, separator, source, 0)).to.eql(
      {
        found: true,
        from: 0,
        to: 5,
        type: 'list',
        data: [
          { found: true, from: 0, to: 1, type: 'elem', data: ['1'] },
          { found: true, from: 2, to: 3, type: 'elem', data: ['2'] },
          { found: true, from: 4, to: 5, type: 'elem', data: ['3'] }
        ]
      }
    )
  })

  test('elements named with symbols are also key accessible by key indexing', () => {
    const source = '1,2,3'

    const element = (input, offset) => token(Symbol.for('elem'), /\d/, input, offset)()

    const separator = (input, offset) => token('sep', /,/, input, offset)()

    const result = list('list', element, separator, source, 0)

    expect(result).to.eql(
      {
        found: true,
        from: 0,
        to: 5,
        type: 'list',
        data: [
          { found: true, from: 0, to: 1, type: Symbol.for('elem'), data: ['1'] },
          { found: true, from: 2, to: 3, type: Symbol.for('elem'), data: ['2'] },
          { found: true, from: 4, to: 5, type: Symbol.for('elem'), data: ['3'] }
        ]
      }
    )

    expect(result[Symbol.for('elem')]).to.eql([
      { found: true, from: 0, to: 1, type: Symbol.for('elem'), data: ['1'] },
      { found: true, from: 2, to: 3, type: Symbol.for('elem'), data: ['2'] },
      { found: true, from: 4, to: 5, type: Symbol.for('elem'), data: ['3'] }
    ])
  })

  test('true - single element', () => {
    const source = '1'

    const element = (input, offset) => token('elem', /\d/, input, offset)()

    const separator = (input, offset) => token('sep', /,/, input, offset)()

    expect(list('list', element, separator, source, 0)).to.eql(
      {
        found: true,
        from: 0,
        to: 1,
        type: 'list',
        data: [
          { found: true, from: 0, to: 1, type: 'elem', data: ['1'] }
        ]
      }
    )
  })

  test('true - ignores the last separator with no subsequent element', () => {
    const source = '1,2,'

    const element = (input, offset) => token('elem', /\d/, input, offset)()

    const separator = (input, offset) => token('sep', /,/, input, offset)()

    expect(list('list', element, separator, source, 0)).to.eql(
      {
        found: true,
        from: 0,
        to: 3,
        type: 'list',
        data: [
          { found: true, from: 0, to: 1, type: 'elem', data: ['1'] },
          { found: true, from: 2, to: 3, type: 'elem', data: ['2'] }
        ]
      }
    )
  })

  test('false - empty input', () => {
    const source = ''

    const element = (input, offset) => token('elem', /\d/, input, offset)()

    const separator = (input, offset) => token('sep', /,/, input, offset)()

    expect(list('list', element, separator, source, 0)).to.eql(
      {
        found: false,
        from: 0,
        to: 0,
        type: 'list',
        data: []
      }
    )
  })
})
