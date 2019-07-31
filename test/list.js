const { expect } = require('chai')

const { list, token } = require('../src')

suite('list', () => {
  test('true - happy case', () => {
    const source = '1,2,3'

    const element = (input, offset) => token(/\d/, input, offset)

    const separator = (input, offset) => token(/,/, input, offset)

    expect(list(element, separator, source, 0)).to.eql(
      [
        true,
        0,
        5,
        [
          [true, 0, 1, ['1']],
          [true, 2, 3, ['2']],
          [true, 4, 5, ['3']]
        ]
      ]
    )
  })

  test('true - single element', () => {
    const source = '1'

    const element = (input, offset) => token(/\d/, input, offset)

    const separator = (input, offset) => token(/,/, input, offset)

    expect(list(element, separator, source, 0)).to.eql([true, 0, 1, [[true, 0, 1, ['1']]]])
  })

  test('true - ignores the last separator with no subsequent element', () => {
    const source = '1,2,'

    const element = (input, offset) => token(/\d/, input, offset)

    const separator = (input, offset) => token(/,/, input, offset)

    expect(list(element, separator, source, 0)).to.eql(
      [
        true,
        0,
        3,
        [
          [true, 0, 1, ['1']],
          [true, 2, 3, ['2']]
        ]
      ]
    )
  })

  test('false - empty input', () => {
    const source = ''

    const element = (input, offset) => token(/\d/, input, offset)

    const separator = (input, offset) => token(/,/, input, offset)

    expect(list(element, separator, source, 0)).to.eql([false])
  })
})
