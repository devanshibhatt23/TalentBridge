# TalentBridge

A recruiter + candidate portal (React + Vite frontend, Node/Express + MongoDB backend).

## Index
- [Requirements](#requirements)
- [Setup](#setup)
- [Run (dev)](#run-dev)
- [Environment variables](#environment-variables)
- [API map](#api-map)
- [Routes (UI)](#routes-ui)
- [Troubleshooting](#troubleshooting)

## Requirements
- Node.js (LTS recommended)
- MongoDB connection string (Atlas or local)

## Setup

Install dependencies in both apps:

```bash
cd server && npm install
cd ../client && npm install
```

## Run (dev)

Start backend:

```bash
cd server
npm run dev
```

Start frontend (in a second terminal):

```bash
cd client
npm run dev
```

Frontend runs on Vite and proxies `/api` to `http://localhost:5000`.

## Environment variables

### Backend (`server/.env`)
- **`MONGO_URI`**: MongoDB connection string
- **`JWT_SECRET`**: any long secret string
- **`PORT`**: optional (defaults to 5000)

### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env` if needed.

- **`VITE_API_URL`**: defaults to `/api` (recommended with proxy)

## API map

Frontend keeps a single source of truth for endpoints in:
- `client/src/api.json`

The axios wrapper + typed functions live in:
- `client/src/services/api.js`

## Routes (UI)

- **Public**
  - `/jobs` (browse jobs)
  - `/jobs/:id` (job detail)
  - `/login`, `/register`

- **Candidate**
  - `/candidate-dashboard`
  - `/my-applications`

- **Recruiter**
  - `/recruiter-dashboard`
  - `/jobs/new`
  - `/candidates`
  - `/candidates/:id`

- **Both (authed)**
  - `/profile`

## Troubleshooting

- **Jobs “My jobs” endpoint not working**
  - Ensure backend route order is correct in `server/routes/jobs.js` and backend is running.

- **401 Invalid or expired token**
  - Sign out and log in again (token is stored in `localStorage` as `tb_token`).

