import './index.css'
import { useState, useEffect } from 'react'
import FleetFlowAuth from './FleetFlowAuth'
import FleetManagerDashboard from './FleetManagerDashboard'
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
  if (currentUser.roleKey !== 'manager') {
    return <Unauthorized user={currentUser} onLogout={logout} />
  }
  return <FleetManagerDashboard user={currentUser} onLogout={logout} />
}

export default App
