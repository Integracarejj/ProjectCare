import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './layouts/AppShell/AppShell'
import { OperationalHubPage } from './pages/OperationalHub/OperationalHubPage'
import { ProjectsPage } from './pages/Projects/ProjectsPage'
import { MyProjectsPage } from './pages/Projects/MyProjectsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/operationalhub" replace />} />

        <Route
          path="/operationalhub"
          element={
            <AppShell title="Operational Hub">
              <OperationalHubPage />
            </AppShell>
          }
        />

        <Route
          path="/projects"
          element={
            <AppShell title="My Projects">
              <MyProjectsPage />
            </AppShell>
          }
        />

        <Route
          path="/projects/new"
          element={
            <AppShell title="New Project">
              <ProjectsPage />
            </AppShell>
          }
        />

        <Route
          path="/projects/:projectId"
          element={
            <AppShell title="Project">
              <ProjectsPage />
            </AppShell>
          }
        />

        <Route path="*" element={<Navigate to="/operationalhub" replace />} />
      </Routes>
    </BrowserRouter>
  )
}