# RBAC MERN Frontend

This simple React frontend demonstrates role-based UI gating.

Run (from frontend folder):

```powershell
npm install
npm run dev
```

Notes:
- The frontend calls `/api/auth/login` and sets the refresh token in an httpOnly cookie.
- Access token is kept in memory and used for API calls.
- Try the seeded users: admin/adminpass, editor/editorpass, viewer/viewerpass
