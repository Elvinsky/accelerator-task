import { LABELS } from '../model/constants.ts'

const startsAtFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatStartsAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return LABELS.dateUnavailable
  return startsAtFormat.format(date)
}

export function localInputToIso(value: string): string {
  return new Date(value).toISOString()
}
