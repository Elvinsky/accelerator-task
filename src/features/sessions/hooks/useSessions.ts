import { useEffect, useState } from 'react'
import type { LoadStatus, NewSessionInput, Session, SessionsApi } from '../model/types.ts'

export function useSessions(api: SessionsApi) {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [sessions, setSessions] = useState<Session[]>([])
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    // Ignore results of a superseded run (StrictMode double effect, retry, unmount).
    let cancelled = false
    api.listSessions().then(
      (loaded) => {
        if (cancelled) return
        setSessions(loaded)
        setStatus('success')
      },
      (error: unknown) => {
        if (cancelled) return
        console.error(error)
        setStatus('error')
      },
    )
    return () => {
      cancelled = true
    }
  }, [api, attempt])

  function reload() {
    setStatus('loading')
    setAttempt((a) => a + 1)
  }

  async function createSession(input: NewSessionInput) {
    const created = await api.createSession(input)
    setSessions((prev) => [created, ...prev])
    return created
  }

  return { status, sessions, reload, createSession }
}
