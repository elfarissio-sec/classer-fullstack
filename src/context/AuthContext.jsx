"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api/config"

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check for existing token and validate it
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("classerToken")
        const storedUser = localStorage.getItem("classerUser")

        if (token && storedUser) {
          // Verify token is still valid by fetching profile
          try {
            const userData = await api.getProfile()
            setUser(userData)
            setIsAuthenticated(true)
          } catch (error) {
            // Token invalid, clear storage
            localStorage.removeItem("classerToken")
            localStorage.removeItem("classerUser")
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await api.login({ email, password })
      const { user: userData, token } = response

      localStorage.setItem("classerToken", token)
      localStorage.setItem("classerUser", JSON.stringify(userData))

      setUser(userData)
      setIsAuthenticated(true)
      setLoading(false)

      return userData
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const register = async (name, email, password, role = "instructor") => {
    setLoading(true)
    try {
      const response = await api.register({ name, email, password, role })
      const { user: userData, token } = response

      localStorage.setItem("classerToken", token)
      localStorage.setItem("classerUser", JSON.stringify(userData))

      setUser(userData)
      setIsAuthenticated(true)
      setLoading(false)

      return userData
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("classerToken")
    localStorage.removeItem("classerUser")
    setUser(null)
    setIsAuthenticated(false)
    navigate("/login")
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
