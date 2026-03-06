import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'

import { AppShell } from './layouts/AppShell/AppShell'
import { OperationalHubPage } from './pages/OperationalHub/OperationalHubPage'
import { ProjectsPage } from './pages/Projects/ProjectsPage'
import { MyProjectsPage } from './pages/Projects/MyProjectsPage'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { LoginPage } from './pages/Auth/LoginPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated } = useAuth()
  const location = useLocation()

  // Key fix: do not redirect while we’re still hydrating localStorage + /me
  if (status === 'checking') {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/operationalhub" replace />} />

          {/* Legacy aliases (optional but safe) */}
          <Route path="/operational-hub" element={<Navigate to="/operationalhub" replace />} />
          <Route path="/portfolio" element={<Navigate to="/projects" replace />} />

          {/* Protected canonical routes */}
          <Route
            path="/operationalhub"
            element={
              <RequireAuth>
                <AppShell title="Operational Hub">
                  <OperationalHubPage />
                </AppShell>
              </RequireAuth>
            }
          />

          <Route
            path="/projects"
            element={
              <RequireAuth>
                <AppShell title="My Projects">
                  <MyProjectsPage />
                </AppShell>
              </RequireAuth>
            }
          />

          <Route
            path="/projects/new"
            element={
              <RequireAuth>
                <AppShell title="New Project">
                  <ProjectsPage />
                </AppShell>
              </RequireAuth>
            }
          />

          <Route
            path="/projects/:projectId"
            element={
              <RequireAuth>
                <AppShell title="Project">
                  <ProjectsPage />
                </AppShell>
              </RequireAuth>
            }
          />

          {/* Catch-all -> hub */}
          <Route path="*" element={<Navigate to="/operationalhub" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
