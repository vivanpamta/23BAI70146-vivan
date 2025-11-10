import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from './App'

export default function Navbar() {
  const { accessToken, user, logout } = useContext(AuthContext)
  const location = useLocation()

  if (!accessToken) return null

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h1>🔐 RBAC System</h1>
      </div>
      <div className="nav-links">
        <Link 
          to="/posts" 
          className={location.pathname === '/posts' ? 'active' : ''}
        >
          📝 Posts
        </Link>
        {user?.role === 'Admin' && (
          <Link 
            to="/admin" 
            className={location.pathname === '/admin' ? 'active' : ''}
          >
            👥 Admin Panel
          </Link>
        )}
      </div>
      <div className="nav-user">
        <span className="user-role-badge">👤 {user?.role || 'Unknown'}</span>
        <button onClick={logout} className="logout-btn">🚪 Logout</button>
      </div>
    </nav>
  )
}

