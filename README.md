# OOPS! — Organized Online Password Safe

Monorepo for the OOPS! senior thesis project.

```
oops/
├── frontend/   # Angular 21 (standalone, SCSS, signals)
├── backend/    # Express + Mongoose + MongoDB Atlas (TypeScript)
└── api/        # Vercel serverless wrapper around the Express app
```

## Features

| # | Feature | Status |
|---|---------|--------|
| 1 | Dictionary check (rockyou.txt subset) | ✓ |
| 2 | Entropy calculation | ✓ |
| 3 | GPU Attack crack-time estimate | ✓ |
| 4 | Register + Email-OTP + Google Authenticator (TOTP) | ✓ |
| 5 | Vault — AES-256-GCM client-side, zero-knowledge | ✓ |
| 6 | Image upload for vault entries | ✓ |
| 7 | Admin / SuperAdmin user management | TODO |

## Roles

- **No login** — checker only, menu clicks redirect to /register
- **Member** — checker + own vault (CRUD)
- **Admin** — manage members (delete/disable)
- **SuperAdmin** — manage admins, cannot delete self

## Quick start (local dev)

### Backend (port 3100)
```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI + JWT_SECRET + email provider
npm run dev
```

### Frontend (port 4321)
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```

Open http://localhost:4321 — Angular proxies `/api/*` to backend on 3100.

## Deploy to Vercel

### One-time setup

1. Push this repo to GitHub.
2. Go to **https://vercel.com/new** → Import your GitHub repo → keep all defaults.
3. **Project Settings → Environment Variables** — add these:

   | Name | Example | Required |
   |------|---------|----------|
   | `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/oops` | ✅ |
   | `JWT_SECRET` | `openssl rand -hex 32` | ✅ |
   | `EMAIL_PROVIDER` | `gmail` or `resend` or `console` | ✅ |
   | `GMAIL_USER` | `you@gmail.com` | if `EMAIL_PROVIDER=gmail` |
   | `GMAIL_APP_PASSWORD` | 16-char app password | if `EMAIL_PROVIDER=gmail` |
   | `RESEND_API_KEY` | `re_xxx` | if `EMAIL_PROVIDER=resend` |
   | `EMAIL_FROM` | `OOPS! <you@example.com>` | recommended |
   | `CORS_ORIGIN` | `https://your-app.vercel.app` | optional (defaults `*`) |

4. Hit **Deploy**. Vercel will:
   - Install root deps (backend libs)
   - Run `vercel-build` → installs and builds the Angular frontend
   - Detect `api/[...slug].ts` as a serverless function (catches all `/api/*`)
   - Configure rewrites: `/api/*` → function, everything else → `index.html` (SPA fallback)

### Notes

- The serverless function wraps the full Express app. First request after a cold start is slow (~1 s) because Mongo connects then; subsequent requests reuse the cached connection.
- `MONGO_URI` must allow connections from anywhere (Atlas → Network Access → `0.0.0.0/0`) since Vercel functions run from rotating IPs.

## Architecture highlights

- **Vault encryption**: AES-256-GCM with key derived client-side via PBKDF2 (200k iters, SHA-256). The server stores only opaque ciphertext + IV — even with full DB access, an admin cannot read user secrets.
- **Auth**: JWT (`jose`) for sessions, argon2 for admin passwords, TOTP (`otplib`) for Google Authenticator.
- **Email**: pluggable provider — `console` (dev), `resend` (API), `gmail` (SMTP).
