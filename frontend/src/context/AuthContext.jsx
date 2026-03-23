import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

function getStoredUser() {
  try {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    return stored && token ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [loading, setLoading] = useState(false)

  // Restore session on page load
  useEffect(() => {
    const restoredUser = getStoredUser()
    if (restoredUser) {
      setUser(restoredUser)
    }
  }, [])

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('token', data.access_token)
    // Preserve all fields from TokenResponse (which should include User data fields)
    const userObj = { ...data }
    delete userObj.access_token // Clean token from user object
    localStorage.setItem('user', JSON.stringify(userObj))
    setUser(userObj)
    return userObj
  }

  const register = async (formData) => {
    await authAPI.register(formData)
  }

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.me()
      localStorage.setItem('user', JSON.stringify(data))
      setUser(data)
    } catch (err) {
      console.error('Failed to refresh user', err)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
