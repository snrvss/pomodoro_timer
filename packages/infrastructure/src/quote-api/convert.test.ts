import { describe, expect, it } from 'vitest'
import { InvalidResponseError } from '@pomodoro-timer/core'
import { convertQuote, readQuotes } from '@/quote-api/convert'

describe('readQuotes', () => {
  it('returns the checked entries with the API field names', () => {
    const body = [
      { id: 468, quote: 'Stay hungry.', author: 'Steve Jobs', extra: 'ignored' },
      { id: 2, quote: '', author: '' },
    ]

    expect(readQuotes(body)).toEqual([
      { id: 468, quote: 'Stay hungry.', author: 'Steve Jobs' },
      { id: 2, quote: '', author: '' },
    ])
  })

  it('accepts an empty array', () => {
    expect(readQuotes([])).toEqual([])
  })

  it.each([
    ['an object', { quotes: [] }],
    ['null', null],
    ['undefined (empty body)', undefined],
    ['a string', 'quotes'],
  ])('throws InvalidResponseError when the body is %s', (_name, body) => {
    expect(() => readQuotes(body)).toThrow(InvalidResponseError)
  })

  it.each([
    ['not an object', [42], 'quotes[0] is not an object'],
    ['a string id', [{ id: '1', quote: 'a', author: 'b' }], 'quotes[0].id is not a number'],
    ['a missing quote', [{ id: 1, author: 'b' }], 'quotes[0].quote is not a string'],
    [
      'a missing author in the second entry',
      [
        { id: 1, quote: 'a', author: 'b' },
        { id: 2, quote: 'c' },
      ],
      'quotes[1].author is not a string',
    ],
  ])('throws InvalidResponseError naming the field for %s', (_name, body, reason) => {
    const error = (() => {
      try {
        readQuotes(body)
      } catch (e) {
        return e
      }
    })()

    expect(error).toBeInstanceOf(InvalidResponseError)
    expect((error as InvalidResponseError).reason).toBe(reason)
  })
})

describe('convertQuote', () => {
  it('maps quote to text and the numeric id to a string', () => {
    expect(convertQuote({ id: 468, quote: 'Stay hungry.', author: 'Steve Jobs' })).toEqual({
      id: '468',
      text: 'Stay hungry.',
      author: 'Steve Jobs',
    })
  })

  it('trims surrounding whitespace', () => {
    expect(convertQuote({ id: 1, quote: '  Go.  ', author: ' Me ' })).toMatchObject({
      text: 'Go.',
      author: 'Me',
    })
  })
})
