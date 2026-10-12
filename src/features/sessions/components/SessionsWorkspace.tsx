import { useEffect, useRef, useState } from 'react'
import { useSessions } from '../hooks/useSessions.ts'
import { FILTER_ALL, LABELS, MESSAGES } from '../model/constants.ts'
import type { SessionsApi, StatusFilter } from '../model/types.ts'
import CreateSessionForm from './CreateSessionForm.tsx'
import SessionFilter from './SessionFilter.tsx'
import SessionList from './SessionList.tsx'

interface SessionsWorkspaceProps {
  api: SessionsApi
}

export default function SessionsWorkspace({ api }: SessionsWorkspaceProps) {
  const { status, sessions, reload, createSession } = useSessions(api)
  const [filter, setFilter] = useState<StatusFilter>(FILTER_ALL)
  const [formOpen, setFormOpen] = useState(false)
  const [created, setCreated] = useState(false)

  const headingRef = useRef<HTMLHeadingElement>(null)
  const newSessionRef = useRef<HTMLButtonElement>(null)
  const restoreFocusRef = useRef(false)

  // After the form closes the focused control is gone; return focus to its opener.
  useEffect(() => {
    if (!formOpen && restoreFocusRef.current) {
      restoreFocusRef.current = false
      newSessionRef.current?.focus()
    }
  }, [formOpen])

  function closeForm() {
    restoreFocusRef.current = true
    setFormOpen(false)
  }

  function handleReload() {
    // The retry button unmounts while loading; keep focus on the page heading.
    headingRef.current?.focus()
    reload()
  }

  const visible = filter === FILTER_ALL ? sessions : sessions.filter((s) => s.status === filter)

  let content
  if (status === 'error') {
    content = (
      <div role="alert" className="error-block">
        <p>{MESSAGES.loadFailed}</p>
        <p>{MESSAGES.loadFailedHint}</p>
        <button type="button" onClick={handleReload}>
          {LABELS.tryAgain}
        </button>
      </div>
    )
  } else if (status === 'success') {
    content = (
      <>
        <div className="toolbar">
          <SessionFilter value={filter} onChange={setFilter} />
          <button
            ref={newSessionRef}
            type="button"
            className="primary"
            disabled={formOpen}
            onClick={() => {
              setCreated(false)
              setFormOpen(true)
            }}
          >
            {LABELS.newSession}
          </button>
        </div>
        {formOpen ? (
          <CreateSessionForm
            createSession={createSession}
            onCreated={() => {
              setCreated(true)
              closeForm()
            }}
            onCancel={closeForm}
          />
        ) : null}
        <SessionList sessions={visible} />
      </>
    )
  }

  return (
    <main className="workspace">
      <h1 ref={headingRef} tabIndex={-1}>
        {LABELS.heading}
      </h1>
      <div
        role="status"
        aria-live="polite"
        className={status === 'loading' ? undefined : 'visually-hidden'}
      >
        {status === 'loading' ? MESSAGES.loading : created ? LABELS.created : null}
      </div>
      {content}
    </main>
  )
}
