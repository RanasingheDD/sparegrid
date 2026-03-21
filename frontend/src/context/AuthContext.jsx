import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on page load
  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token  = localStorage.getItem('token')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
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
