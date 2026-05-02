import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import WorkspaceLayout from './components/Workspace/WorkspaceLayout'
import Home from './pages/Home'
import Auth from './pages/Auth'
import RoleSelector from './components/RoleSelector'
import { useResearchStore } from './store/researchStore'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useResearchStore((state) => state.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function App() {
  const theme = useResearchStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className={`h-screen w-screen overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/role-select"
            element={
              <ProtectedRoute>
                <RoleSelector />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/researcher"
            element={
              <ProtectedRoute>
                <WorkspaceLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/student"
            element={
              <ProtectedRoute>
                <WorkspaceLayout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/reviewer"
            element={
              <ProtectedRoute>
                <WorkspaceLayout />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
