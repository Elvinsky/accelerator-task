import { MESSAGES, TITLE_MAX, TITLE_MIN } from '../model/constants.ts'
import type { SessionFormErrors, SessionFormValues } from '../model/types.ts'

export function validateSessionForm(
  values: SessionFormValues,
  now: Date = new Date(),
): SessionFormErrors {
  const errors: SessionFormErrors = {}

  const title = values.title.trim()
  if (title.length === 0) {
    errors.title = MESSAGES.titleRequired
  } else if (title.length < TITLE_MIN) {
    errors.title = MESSAGES.titleTooShort
  } else if (title.length > TITLE_MAX) {
    errors.title = MESSAGES.titleTooLong
  }

  const time = values.startsAt === '' ? NaN : new Date(values.startsAt).getTime()
  if (Number.isNaN(time)) {
    errors.startsAt = MESSAGES.startsAtRequired
  } else if (time <= now.getTime()) {
    errors.startsAt = MESSAGES.startsAtPast
  }

  return errors
}
