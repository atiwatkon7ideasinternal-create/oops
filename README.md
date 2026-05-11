# OOPS! — Organized Online Password Safe

Monorepo for the OOPS! senior thesis project.

```
oops/
├── frontend/   # Angular 21 (standalone, SCSS)
└── backend/    # Hono serverless API (Vercel-ready), Mongoose + MongoDB Atlas
```

## Quick start

### Frontend (port 4321)
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

### Backend (port 3000)
```bash
cd backend
npm install
cp .env.example .env   # then fill MONGO_URI
npm run dev
```

### Both at once
```bash
npm install            # root deps (concurrently)
npm run dev            # runs both
```

## Features

| # | Feature | Phase |
|---|---------|-------|
| 1 | Login with Google Authenticator (TOTP) | 2 |
| 2 | Dictionary check (rockyou.txt subset) | 1 ✓ |
| 3 | Entropy calculation | 1 ✓ |
| 4 | GPU Attack crack-time estimate | 1 ✓ |
| 5 | Vault storage (AES-256, member-keyed) | 3 |
| 6 | Admin / SuperAdmin user management | 4 |

## Roles

- **No login** — checker only, menu clicks redirect to /register
- **Member** — checker + own vault (CRUD)
- **Admin** — manage members (delete/disable, edit with consent)
- **SuperAdmin** — manage admins, cannot delete self
