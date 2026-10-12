import { DEFAULT_STATUS } from '../model/constants.ts'
import type { NewSessionInput, Session, SessionsApi } from '../model/types.ts'

interface MockOptions {
  latencyMs?: number
  seed?: Session[]
  failFirstList?: boolean
  failAllLists?: boolean
  failFirstCreate?: boolean
}

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const loadedAt = Date.now()

function at(offsetMs: number): string {
  return new Date(loadedAt + offsetMs).toISOString()
}

function buildSeed(): Session[] {
  return [
    { id: 'session-1', title: 'Intro to React hooks', status: 'completed', startsAt: at(-7 * DAY) },
    { id: 'session-2', title: 'TypeScript for teams', status: 'completed', startsAt: at(-2 * DAY) },
    { id: 'session-3', title: 'Testing UI behavior', status: 'scheduled', startsAt: at(2 * DAY) },
    { id: 'session-4', title: 'Accessible forms workshop', status: 'scheduled', startsAt: at(5 * DAY + 3 * HOUR) },
    { id: 'session-5', title: 'Performance review clinic', status: 'cancelled', startsAt: at(3 * DAY) },
  ]
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export function createMockSessionsApi(options: MockOptions = {}): SessionsApi {
  const { latencyMs, seed = buildSeed(), failFirstList = false, failAllLists = false, failFirstCreate = false } = options
  let store: Session[] = [...seed]
  let counter = store.length
  let listFailed = false
  let createFailed = false

  return {
    async listSessions() {
      await delay(latencyMs ?? 600)
      if (failAllLists || (failFirstList && !listFailed)) {
        listFailed = true
        throw new Error('Failed to load sessions')
      }
      return [...store]
    },
    async createSession(input: NewSessionInput) {
      await delay(latencyMs ?? 800)
      if (failFirstCreate && !createFailed) {
        createFailed = true
        throw new Error('Failed to create session')
      }
      counter += 1
      const created: Session = {
        id: `session-${counter}`,
        title: input.title,
        status: DEFAULT_STATUS,
        startsAt: input.startsAt,
      }
      store = [created, ...store]
      return created
    },
  }
}

// Manual-check aid, read once at import (not on navigation). Modes via ?mock=:
// list-error      every list call fails (survives the StrictMode double effect and retries)
// list-error-once only the first list call fails (a retry succeeds)
// create-error    the first create call fails
// empty           no seed sessions
function optionsFromUrl(): MockOptions {
  if (typeof window === 'undefined') return {}
  const mode = new URLSearchParams(window.location.search).get('mock')
  if (mode === 'list-error') return { failAllLists: true }
  if (mode === 'list-error-once') return { failFirstList: true }
  if (mode === 'create-error') return { failFirstCreate: true }
  if (mode === 'empty') return { seed: [] }
  return {}
}

export const mockSessionsApi = createMockSessionsApi(optionsFromUrl())
