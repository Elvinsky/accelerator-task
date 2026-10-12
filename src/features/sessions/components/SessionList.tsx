import { formatStartsAt } from '../lib/format.ts'
import { MESSAGES, STATUS_LABELS } from '../model/constants.ts'
import type { Session } from '../model/types.ts'

interface SessionListProps {
  sessions: Session[]
}

export default function SessionList({ sessions }: SessionListProps) {
  if (sessions.length === 0) {
    return <p className="empty">{MESSAGES.empty}</p>
  }
  return (
    <ul className="session-list">
      {sessions.map((session) => (
        <li key={session.id} className="session-item">
          <strong>{session.title}</strong>
          <span className="badge">{STATUS_LABELS[session.status]}</span>
          <time dateTime={session.startsAt}>{formatStartsAt(session.startsAt)}</time>
        </li>
      ))}
    </ul>
  )
}
