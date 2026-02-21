import './index.css'
import { useState, useEffect } from 'react'
import FleetFlowAuth from './FleetFlowAuth'
import FleetManagerDashboard from './FleetManagerDashboard'
import DispatcherDashboard from './pages/DispatcherDashboard'
import SafetyOfficerDashboard from './pages/SafetyOfficerDashboard'
import FinancialAnalystDashboard from './pages/FinancialAnalystDashboard'
import Unauthorized from './pages/Unauthorized'
import { getMeApi } from './api/auth'

const TOKEN_KEY = 'fleetflow_jwt'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        try {
          const user = await getMeApi()
          setCurrentUser(user)
        } catch (err) {
          localStorage.removeItem(TOKEN_KEY)
        }
      }
      setLoading(false)
    }
    restoreSession()
  }, [])

  const login = (data) => {
    localStorage.setItem(TOKEN_KEY, data.token)
    setCurrentUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setCurrentUser(null)
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Loading FleetFlow...</div>
  }

  if (!currentUser) {
    return <FleetFlowAuth onLoginSuccess={login} />
  }

  const role = (currentUser.roleKey || currentUser.role || '').toLowerCase()

  // Use exact match or startsWith to avoid conflicts
  if (role === 'manager' || role.startsWith('manager')) {
    return <FleetManagerDashboard user={currentUser} onLogout={logout} />
  }

  if (role === 'dispatcher' || role.startsWith('dispatcher')) {
    return <DispatcherDashboard user={currentUser} onLogout={logout} />
  }

  if (role === 'safety' || role.startsWith('safety')) {
    return <SafetyOfficerDashboard user={currentUser} onLogout={logout} />
  }

  if (role === 'finance' || role.startsWith('finance')) {
    return <FinancialAnalystDashboard user={currentUser} onLogout={logout} />
  }

  return <Unauthorized user={currentUser} onLogout={logout} />
}

export default App
