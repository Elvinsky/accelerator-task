import { SessionsWorkspace, mockSessionsApi } from './features/sessions/index.ts'

export default function App() {
  return <SessionsWorkspace api={mockSessionsApi} />
}
