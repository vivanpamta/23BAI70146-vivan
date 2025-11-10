import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from './App'

export default function AdminPanel() {
  const { accessToken, refresh } = useContext(AuthContext)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'Viewer' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    setError(null)
    try {
      let token = accessToken
      let res = await fetch('http://localhost:5000/api/admin/users', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      
      if (res.status === 401) {
        token = await refresh()
        if (!token) throw new Error('Authentication failed')
        res = await fetch('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
      }

      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      let token = accessToken
      let res = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      })

      if (res.status === 401) {
        token = await refresh()
        if (!token) throw new Error('Authentication failed')
        res = await fetch('http://localhost:5000/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(newUser)
        })
      }

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create user')
      }

      const data = await res.json()
      setUsers([...users, data])
      setNewUser({ username: '', password: '', role: 'Viewer' })
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <h2>Admin Panel - User Management</h2>
        <p>Manage users and assign roles</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-section">
        <h3>Create New User</h3>
        <form onSubmit={handleCreateUser} className="create-user-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              required
              placeholder="Enter username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
              placeholder="Enter password"
              minLength="6"
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="Viewer">Viewer</option>
              <option value="ContentCreator">Creator</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={creating} className="btn-primary">
            {creating ? (
              <>
                <span className="spinner"></span>
                Creating...
              </>
            ) : (
              <>
                ➕ Create User
              </>
            )}
          </button>
        </form>
      </div>

      <div className="admin-section">
        <h3>All Users</h3>
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="empty-state">No users found</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id || user.id}>
                      <td>{user.username}</td>
                      <td>
                        <span className={`role-badge role-${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

