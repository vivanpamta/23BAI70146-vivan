import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from './App'

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { accessToken, user } = useContext(AuthContext)

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="error-container">
        <h2>Access Denied</h2>
        <p>You need {requiredRole} role to access this page.</p>
        <p>Your current role: {user?.role || 'Unknown'}</p>
      </div>
    )
  }

  return children
}

