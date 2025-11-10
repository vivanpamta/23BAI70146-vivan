import React, { useState, useEffect, createContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './Login'
import Posts from './Posts'
import AdminPanel from './AdminPanel'
import ProtectedRoute from './ProtectedRoute'
import Navbar from './Navbar'
import jwtDecode from 'jwt-decode'
import './styles.css'

export const AuthContext = createContext()

export default function App(){
  const [accessToken, setAccessToken] = useState(() => {
    // Load token from localStorage on mount
    return localStorage.getItem('accessToken') || null
  })
  const [user, setUser] = useState(null)

  // decode token to extract role/user
  useEffect(() => {
    if (accessToken) {
      try {
        const p = jwtDecode(accessToken)
        setUser({ id: p.sub, role: p.role })
        localStorage.setItem('accessToken', accessToken)
      } catch(e){ 
        setUser(null)
        localStorage.removeItem('accessToken')
      }
    } else {
      setUser(null)
      localStorage.removeItem('accessToken')
    }
  }, [accessToken])

  async function refresh() {
    try {
      const res = await fetch('http://localhost:5000/api/auth/refresh', { 
        method: 'POST', 
        credentials: 'include' 
      })
      if (!res.ok) throw new Error('refresh failed')
      const data = await res.json()
      setAccessToken(data.accessToken)
      return data.accessToken
    } catch (e) {
      setAccessToken(null)
      return null
    }
  }

  function logout() {
    setAccessToken(null)
    localStorage.removeItem('accessToken')
    fetch('http://localhost:5000/api/auth/logout', { 
      method: 'POST', 
      credentials: 'include' 
    }).catch(() => {})
  }

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, user, refresh, logout }}>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <Routes>
            <Route 
              path="/login" 
              element={!accessToken ? <Login /> : <Navigate to="/posts" replace />} 
            />
            <Route 
              path="/posts" 
              element={
                <ProtectedRoute>
                  <Posts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/" 
              element={<Navigate to={accessToken ? "/posts" : "/login"} replace />} 
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}
