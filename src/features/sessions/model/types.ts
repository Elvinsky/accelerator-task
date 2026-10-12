export type SessionStatus = 'scheduled' | 'completed' | 'cancelled'

export type StatusFilter = 'all' | SessionStatus

export type LoadStatus = 'loading' | 'error' | 'success'

export interface Session {
  id: string
  title: string
  status: SessionStatus
  startsAt: string
}

export interface NewSessionInput {
  title: string
  startsAt: string
}

export interface SessionsApi {
  listSessions(): Promise<Session[]>
  createSession(input: NewSessionInput): Promise<Session>
}

export interface SessionFormValues {
  title: string
  startsAt: string
}

export interface SessionFormErrors {
  title?: string
  startsAt?: string
}
