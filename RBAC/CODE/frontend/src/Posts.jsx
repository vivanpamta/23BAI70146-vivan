import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from './App'

function PermissionButton({ can, onClick, children, tooltip }) {
  return (
    <button
      disabled={!can}
      onClick={onClick}
      className={`btn ${!can ? 'btn-disabled' : 'btn-primary'}`}
      title={tooltip || (!can ? 'You do not have permission to perform this action' : '')}
    >
      {children}
    </button>
  )
}

export default function Posts(){
  const { accessToken, user, refresh, setAccessToken } = useContext(AuthContext)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts(){
    setLoading(true)
    setError(null)
    try {
      let token = accessToken
      let res = await fetch('http://localhost:5000/api/posts', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      
      if (res.status === 401){
        token = await refresh()
        if (!token) {
          setAccessToken(null)
          return
        }
        res = await fetch('http://localhost:5000/api/posts', {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      
      if (!res.ok) throw new Error('Failed to fetch posts')
      const data = await res.json()
      setPosts(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function create(){
    if (!newTitle.trim() || !newContent.trim()) {
      setError('Title and content are required')
      return
    }
    
    setCreating(true)
    setError(null)
    try {
      const token = accessToken
      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim() })
      })
      
      if (res.status === 401) {
        const newToken = await refresh()
        if (!newToken) throw new Error('Authentication failed')
        // Retry with new token
        const retryRes = await fetch('http://localhost:5000/api/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken}`
          },
          body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim() })
        })
        if (!retryRes.ok) throw new Error('Failed to create post')
      } else if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to create post' }))
        throw new Error(error.message || 'Failed to create post')
      }
      
      setNewTitle('')
      setNewContent('')
      fetchPosts()
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  function startEdit(post) {
    setEditingId(post._id)
    setEditTitle(post.title)
    setEditContent(post.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  async function saveEdit(id){
    if (!editTitle.trim() || !editContent.trim()) {
      setError('Title and content are required')
      return
    }
    
    setError(null)
    try {
      const token = accessToken
      const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim() })
      })
      
      if (res.status === 401) {
        const newToken = await refresh()
        if (!newToken) throw new Error('Authentication failed')
        const retryRes = await fetch(`http://localhost:5000/api/posts/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken}`
          },
          body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim() })
        })
        if (!retryRes.ok) throw new Error('Failed to update post')
      } else if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to update post' }))
        throw new Error(error.message || 'Failed to update post')
      }
      
      setEditingId(null)
      fetchPosts()
    } catch (e) {
      setError(e.message)
    }
  }

  async function remove(id){
    if (!confirm('Are you sure you want to delete this post?')) return
    
    setError(null)
    try {
      const token = accessToken
      const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.status === 401) {
        const newToken = await refresh()
        if (!newToken) throw new Error('Authentication failed')
        const retryRes = await fetch(`http://localhost:5000/api/posts/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${newToken}` }
        })
        if (!retryRes.ok) throw new Error('Failed to delete post')
      } else if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Failed to delete post' }))
        throw new Error(error.message || 'Failed to delete post')
      }
      
      fetchPosts()
    } catch (e) {
      setError(e.message)
    }
  }

  // permissions derived from server role claim in access token
  const canCreate = user?.role === 'Admin' || user?.role === 'Editor'
  const canUpdate = user?.role === 'Admin' || user?.role === 'Editor'
  const canDelete = user?.role === 'Admin'

  const canEditPost = (post) => {
    if (user?.role === 'Admin') return true
    if (user?.role === 'Editor' && user?.id === post.authorId?._id || user?.id === post.authorId) return true
    return false
  }

  return (
    <div className="posts-container">
      <div className="posts-header">
        <h2>Posts Management</h2>
        <p className="user-info">Logged in as: <strong>{user?.role || 'Unknown'}</strong></p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="new-post-section">
        <h3>Create New Post</h3>
        <div className="new-post-form">
          <input
            type="text"
            placeholder="Post title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="form-input"
            disabled={!canCreate}
          />
          <textarea
            placeholder="Post content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="form-textarea"
            rows="3"
            disabled={!canCreate}
          />
          <PermissionButton
            can={canCreate}
            onClick={create}
            tooltip={canCreate ? 'Create a new post' : 'You need Editor or Admin role to create posts'}
            disabled={creating}
          >
            {creating ? (
              <>
                <span className="spinner"></span>
                Creating...
              </>
            ) : (
              <>
                ✨ Create Post
              </>
            )}
          </PermissionButton>
        </div>
      </div>

      <div className="posts-section">
        <h3>All Posts</h3>
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="empty-state">No posts found. Create your first post!</div>
        ) : (
          <div className="posts-list">
            {posts.map((post) => (
              <div key={post._id} className="post-card">
                {editingId === post._id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="form-input"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="form-textarea"
                      rows="4"
                    />
                    <div className="edit-actions">
                      <button onClick={() => saveEdit(post._id)} className="btn-primary">
                        💾 Save
                      </button>
                      <button onClick={cancelEdit} className="btn-secondary">
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="post-header">
                      <h4>{post.title}</h4>
                      <div className="post-meta">
                        <span className="author">
                          by <strong>{post.authorId?.username || 'Unknown'}</strong>
                        </span>
                        <span className={`role-badge role-${post.authorId?.role?.toLowerCase() || 'unknown'}`}>
                          {post.authorId?.role || 'Unknown'}
                        </span>
                        <span className="date">
                          {post.createdAt
                            ? new Date(post.createdAt).toLocaleString()
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="post-content">{post.content}</div>
                    {post.updatedAt && (
                      <div className="post-updated">
                        Updated: {new Date(post.updatedAt).toLocaleString()}
                      </div>
                    )}
                    <div className="post-actions">
                      <PermissionButton
                        can={canEditPost(post)}
                        onClick={() => startEdit(post)}
                        tooltip={
                          canEditPost(post)
                            ? 'Edit this post'
                            : user?.role === 'Editor'
                            ? 'You can only edit your own posts'
                            : 'You need Editor or Admin role to edit posts'
                        }
                      >
                        ✏️ Edit
                      </PermissionButton>
                      <PermissionButton
                        can={canDelete}
                        onClick={() => remove(post._id)}
                        tooltip={canDelete ? 'Delete this post' : 'Only Admins can delete posts'}
                      >
                        🗑️ Delete
                      </PermissionButton>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
