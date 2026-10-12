import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MESSAGES } from '../model/constants.ts'
import type { NewSessionInput, Session, SessionsApi } from '../model/types.ts'
import SessionsWorkspace from './SessionsWorkspace.tsx'

const seed: Session[] = [
  { id: '1', title: 'Hooks basics', status: 'completed', startsAt: '2026-01-10T09:00:00.000Z' },
  { id: '2', title: 'Testing workshop', status: 'scheduled', startsAt: '2030-01-10T09:00:00.000Z' },
  { id: '3', title: 'Perf clinic', status: 'cancelled', startsAt: '2030-02-10T09:00:00.000Z' },
]

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function makeApi(overrides: Partial<SessionsApi> = {}): SessionsApi {
  return {
    listSessions: () => Promise.resolve(seed),
    createSession: (input: NewSessionInput) =>
      Promise.resolve({ id: 'new', status: 'scheduled', ...input }),
    ...overrides,
  }
}

describe('SessionsWorkspace', () => {
  it('filters sessions by status', async () => {
    const user = userEvent.setup()
    render(<SessionsWorkspace api={makeApi()} />)

    expect(screen.getByText('Loading sessions...')).toBeInTheDocument()
    expect(await screen.findByText('Hooks basics')).toBeInTheDocument()
    expect(screen.getByText('Testing workshop')).toBeInTheDocument()
    const list = screen.getByRole('list')
    expect(within(list).getByText('Completed')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Status'), 'Completed')
    expect(screen.getByText('Hooks basics')).toBeInTheDocument()
    expect(screen.queryByText('Testing workshop')).not.toBeInTheDocument()
    expect(screen.queryByText('Perf clinic')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Status'), 'All')
    expect(screen.getByText('Hooks basics')).toBeInTheDocument()
    expect(screen.getByText('Testing workshop')).toBeInTheDocument()
    expect(screen.getByText('Perf clinic')).toBeInTheDocument()
  })

  it('creates a session and shows it', async () => {
    const user = userEvent.setup()
    const pending = deferred<Session>()
    const createSession = vi.fn((_input: NewSessionInput) => pending.promise)
    render(<SessionsWorkspace api={makeApi({ createSession })} />)

    await user.click(await screen.findByRole('button', { name: 'New session' }))
    await user.type(screen.getByLabelText('Title'), '  Brand new talk  ')
    fireEvent.change(screen.getByLabelText('Start date and time'), {
      target: { value: '2099-01-01T10:00' },
    })

    const submit = screen.getByRole('button', { name: 'Create session' })
    fireEvent.click(submit)
    fireEvent.submit(submit.closest('form')!)

    expect(createSession).toHaveBeenCalledTimes(1)
    const input = createSession.mock.calls[0][0]
    expect(input.title).toBe('Brand new talk')
    expect(input.startsAt).toMatch(/^\d{4}-\d{2}-\d{2}T.*Z$/)
    expect(await screen.findByRole('button', { name: 'Creating...' })).toBeDisabled()

    pending.resolve({ id: 'new', title: input.title, status: 'scheduled', startsAt: input.startsAt })
    expect(await screen.findByText('Brand new talk')).toBeInTheDocument()
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Title')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'New session' }))
    expect(screen.getByLabelText('Title')).toHaveValue('')
    expect(screen.getByLabelText('Start date and time')).toHaveValue('')
  })

  it('keeps values after create failure', async () => {
    const user = userEvent.setup()
    const createSession = vi
      .fn<SessionsApi['createSession']>()
      .mockRejectedValueOnce(new Error('boom'))
      .mockImplementation((input) => Promise.resolve({ id: 'n', status: 'scheduled', ...input }))
    render(<SessionsWorkspace api={makeApi({ createSession })} />)

    await user.click(await screen.findByRole('button', { name: 'New session' }))
    await user.type(screen.getByLabelText('Title'), 'Retry talk')
    fireEvent.change(screen.getByLabelText('Start date and time'), {
      target: { value: '2099-01-01T10:00' },
    })
    await user.click(screen.getByRole('button', { name: 'Create session' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not create the session')
    expect(screen.getByLabelText('Title')).toHaveValue('Retry talk')
    expect(screen.getByLabelText('Start date and time')).toHaveValue('2099-01-01T10:00')

    await user.click(screen.getByRole('button', { name: 'Create session' }))
    expect(await screen.findByRole('heading', { name: 'Training sessions' })).toBeInTheDocument()
    expect(await screen.findByText('Retry talk')).toBeInTheDocument()
  })

  it('shows validation errors and does not submit invalid forms', async () => {
    const user = userEvent.setup()
    const createSession = vi.fn((_input: NewSessionInput) => Promise.resolve(seed[0]))
    render(<SessionsWorkspace api={makeApi({ createSession })} />)

    await user.click(await screen.findByRole('button', { name: 'New session' }))
    await user.click(screen.getByRole('button', { name: 'Create session' }))
    expect(screen.getByText(MESSAGES.titleRequired)).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toHaveFocus()
    expect(createSession).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Title'), 'Valid title')
    fireEvent.change(screen.getByLabelText('Start date and time'), {
      target: { value: '2000-01-01T10:00' },
    })
    await user.click(screen.getByRole('button', { name: 'Create session' }))
    expect(screen.getByText(MESSAGES.startsAtPast)).toBeInTheDocument()
    expect(screen.getByLabelText('Start date and time')).toHaveFocus()
    expect(createSession).toHaveBeenCalledTimes(0)
  })

  it('load error can be retried', async () => {
    const user = userEvent.setup()
    const listSessions = vi
      .fn<SessionsApi['listSessions']>()
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValue(seed)
    render(<SessionsWorkspace api={makeApi({ listSessions })} />)

    expect(await screen.findByText('Could not load sessions.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('Hooks basics')).toBeInTheDocument()
  })
})
