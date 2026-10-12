import { describe, expect, it } from 'vitest'
import { MESSAGES } from '../model/constants.ts'
import { validateSessionForm } from './validation.ts'

const now = new Date('2026-06-01T10:00:00')
const future = '2026-06-01T10:01'

describe('validateSessionForm title', () => {
  it('accepts 3 and 80 characters, also padded with spaces', () => {
    for (const title of ['abc', 'a'.repeat(80), '  abc  ', ` ${'a'.repeat(80)} `]) {
      expect(validateSessionForm({ title, startsAt: future }, now).title).toBeUndefined()
    }
  })

  it('rejects empty, whitespace-only, short and long titles', () => {
    const title = (value: string) => validateSessionForm({ title: value, startsAt: future }, now).title
    expect(title('')).toBe(MESSAGES.titleRequired)
    expect(title('   ')).toBe(MESSAGES.titleRequired)
    expect(title('ab')).toBe(MESSAGES.titleTooShort)
    expect(title('a'.repeat(81))).toBe(MESSAGES.titleTooLong)
  })
})

describe('validateSessionForm startsAt', () => {
  const startsAt = (value: string) => validateSessionForm({ title: 'abc', startsAt: value }, now).startsAt
  it('rejects empty, past and equal-to-now values', () => {
    expect(startsAt('')).toBe(MESSAGES.startsAtRequired)
    expect(startsAt('2026-05-31T10:00')).toBe(MESSAGES.startsAtPast)
    expect(startsAt('2026-06-01T10:00')).toBe(MESSAGES.startsAtPast)
  })

  it('accepts one minute after now', () => {
    expect(startsAt(future)).toBeUndefined()
  })
})
