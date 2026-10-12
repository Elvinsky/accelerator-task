import type { SessionStatus } from './types.ts'

export const SESSION_STATUSES = ['scheduled', 'completed', 'cancelled'] as const satisfies readonly SessionStatus[]

export const STATUS_LABELS: Record<SessionStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const FILTER_ALL = 'all' as const

export const DEFAULT_STATUS: SessionStatus = 'scheduled'

export const TITLE_MIN = 3
export const TITLE_MAX = 80

export const MESSAGES = {
  loading: 'Loading sessions...',
  loadFailed: 'Could not load sessions.',
  loadFailedHint: 'Check your connection and try again.',
  empty: 'No sessions to show.',
  titleRequired: 'Enter a title.',
  titleTooShort: `Title must be at least ${TITLE_MIN} characters.`,
  titleTooLong: `Title must be at most ${TITLE_MAX} characters.`,
  startsAtRequired: 'Choose a start date and time.',
  startsAtPast: 'Start date and time must be in the future.',
  createFailed: 'Could not create the session. Your entries are kept, please try again.',
} as const

export const LABELS = {
  heading: 'Training sessions',
  newSession: 'New session',
  tryAgain: 'Try again',
  statusFilter: 'Status',
  filterAll: 'All',
  title: 'Title',
  startsAt: 'Start date and time',
  required: '(required)',
  requiredNote: 'All fields are required.',
  creating: 'Creating...',
  createSession: 'Create session',
  cancel: 'Cancel',
  created: 'Session created',
  dateUnavailable: 'Date unavailable',
} as const
