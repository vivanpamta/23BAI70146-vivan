# RBAC MERN Backend (minimal demo)

This is a compact demo backend implementing role-based access control (RBAC) with JWTs.

Features implemented:
- Role -> permission matrix (`config/roles.js`) for Admin/Editor/Viewer
- JWT auth with role claim (`/api/auth/login`) and refresh endpoint
- Route-level authorization middleware (`middleware/authorize.js`) using permissions
- Ownership checks (Editors can only modify their own posts) in `routes/posts.js`
- Seed script to create sample users (admin/editor/viewer) with passwords
- Docker Compose example (see below) to run MongoDB + backend

Quick start (local):

1. Copy `.env.example` to `.env` and change values if needed.

2. Install dependencies and seed DB:

```powershell
cd d:\Semester 5\Full Stack\rbac-mern\backend
npm install
npm run seed
npm start
```

3. API endpoints:
- POST /api/auth/login { username, password } -> { accessToken, refreshToken, user }
- POST /api/auth/refresh { refreshToken } -> { accessToken }
- GET /api/posts (requires Authorization: Bearer <token>)
- POST /api/posts (requires posts:create permission)
- PUT /api/posts/:id (requires posts:update permission, Editors limited to own posts)
- DELETE /api/posts/:id (requires posts:delete)

Docker Compose (example):

```yaml
version: '3.8'
services:
  mongo:
    image: mongo:6
    ports:
      - '27017:27017'
    volumes:
      - ./mongo-data:/data/db
  backend:
    build: .
    command: npm start
    environment:
      - MONGO_URI=mongodb://mongo:27017/rbac_demo
      - JWT_SECRET=replace_with_a_secret
    ports:
      - '5000:5000'
    depends_on:
      - mongo
```

Security notes:
- For demo we return refresh tokens in response; in production put refresh tokens in httpOnly cookies and implement rotation.
- Harden CORS, set secure cookies, rate limit more strictly, and add monitoring/alerting.

