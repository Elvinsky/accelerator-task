import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { localInputToIso } from '../lib/format.ts'
import { validateSessionForm } from '../lib/validation.ts'
import { LABELS, MESSAGES } from '../model/constants.ts'
import type { NewSessionInput, SessionFormErrors, SessionFormValues } from '../model/types.ts'

interface CreateSessionFormProps {
  createSession: (input: NewSessionInput) => Promise<unknown>
  onCreated: () => void
  onCancel: () => void
}

export default function CreateSessionForm({
  createSession,
  onCreated,
  onCancel,
}: CreateSessionFormProps) {
  const [values, setValues] = useState<SessionFormValues>({ title: '', startsAt: '' })
  const [errors, setErrors] = useState<SessionFormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const submittingRef = useRef(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const startsAtRef = useRef<HTMLInputElement>(null)

  const baseId = useId()
  const titleId = `${baseId}-title`
  const titleErrorId = `${baseId}-title-error`
  const startsAtId = `${baseId}-starts-at`
  const startsAtErrorId = `${baseId}-starts-at-error`

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return

    const nextErrors = validateSessionForm(values)
    setErrors(nextErrors)
    setSubmitError(null)
    if (nextErrors.title) {
      titleRef.current?.focus()
      return
    }
    if (nextErrors.startsAt) {
      startsAtRef.current?.focus()
      return
    }

    submittingRef.current = true
    setPending(true)
    try {
      await createSession({
        title: values.title.trim(),
        startsAt: localInputToIso(values.startsAt),
      })
      onCreated()
      return
    } catch {
      setSubmitError(MESSAGES.createFailed)
    } finally {
      submittingRef.current = false
      setPending(false)
    }
  }

  return (
    <form className="create-form" noValidate onSubmit={handleSubmit}>
      <h2>{LABELS.newSession}</h2>
      <p className="hint">{LABELS.requiredNote}</p>
      <div className="field">
        <label htmlFor={titleId}>{LABELS.title}</label>
        <input
          ref={titleRef}
          id={titleId}
          type="text"
          aria-required="true"
          value={values.title}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? titleErrorId : undefined}
          onChange={(event) => {
            setValues((prev) => ({ ...prev, title: event.target.value }))
            setErrors((prev) => ({ ...prev, title: undefined }))
          }}
        />
        {errors.title ? (
          <p id={titleErrorId} className="error">
            {errors.title}
          </p>
        ) : null}
      </div>
      <div className="field">
        <label htmlFor={startsAtId}>{LABELS.startsAt}</label>
        <input
          ref={startsAtRef}
          id={startsAtId}
          type="datetime-local"
          aria-required="true"
          value={values.startsAt}
          aria-invalid={errors.startsAt ? true : undefined}
          aria-describedby={errors.startsAt ? startsAtErrorId : undefined}
          onChange={(event) => {
            setValues((prev) => ({ ...prev, startsAt: event.target.value }))
            setErrors((prev) => ({ ...prev, startsAt: undefined }))
          }}
        />
        {errors.startsAt ? (
          <p id={startsAtErrorId} className="error">
            {errors.startsAt}
          </p>
        ) : null}
      </div>
      {submitError ? (
        <p role="alert" className="error">
          {submitError}
        </p>
      ) : null}
      <div className="actions">
        <button type="submit" className="primary" disabled={pending}>
          {pending ? LABELS.creating : LABELS.createSession}
        </button>
        <button type="button" disabled={pending} onClick={onCancel}>
          {LABELS.cancel}
        </button>
      </div>
    </form>
  )
}
