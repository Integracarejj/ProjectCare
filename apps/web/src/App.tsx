import { AppShell } from './layouts/AppShell/AppShell'
import { OperationalHubPage } from './pages/OperationalHub/OperationalHubPage'

/**
 * App
 * ----------------------------------------------------------------------------
 * We render the PM-first Operational Hub as the landing experience.
 * Later, routing will let us navigate to:
 * - /projects
 * - /projects/:id (List/Board/Gantt/etc.)
 */
export default function App() {
  return (
    <AppShell title="Operational Hub">
      <OperationalHubPage />
    </AppShell>
  )
}