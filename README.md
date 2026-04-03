# SecureShare

Live demo: https://secure-file-sharing-app-sigma.vercel.app/

SecureShare is a production-style secure file sharing platform built with a React/Vite frontend and a Node.js/Express backend. It supports authenticated file upload/download, private group workspaces, file expiry, access logs, and encrypted storage using MongoDB GridFS.

## What This Project Demonstrates

- Full-stack authentication with JWT and persistent session handling
- Role-aware group collaboration with owner and member controls
- Secure file upload, download, rename, and expiry enforcement
- Private group file isolation so group content does not leak into public listings
- Download activity logging for audit visibility
- Custom premium UI with reusable toasts, confirmation modals, and polished navigation flows
- Free deployment readiness with Vercel, Render, and MongoDB Atlas

## Key Features

- User registration, login, logout, and profile management
- Create, join, and manage private groups using unique group IDs
- Upload files with optional custom display names
- Encrypt file content before storage
- Store encrypted files in MongoDB GridFS for deployment-friendly persistence
- Share files through public or direct download links
- Enforce file expiry on every download path
- Track download logs for each file
- Hide sensitive group member emails from other members
- Prevent duplicate email registration with clear validation feedback
- Replace generic browser alerts with premium in-app notifications

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, MongoDB, Mongoose
- Security: JWT, bcrypt, rate limiting, CORS, encryption with `crypto`
- Storage: MongoDB Atlas + GridFS
- Deployment: Vercel frontend, Render backend

## Architecture Overview

- The frontend is a single-page React app with routed views for Home, Dashboard, Profile, Download, Logs, and Group pages.
- The backend exposes REST APIs for auth, groups, files, downloads, and logs.
- Uploaded files are encrypted on the server before being written to GridFS.
- Access control is enforced on the backend so file visibility and downloads remain protected even if the frontend changes.
- The app uses environment-based configuration so local development and production deployment use the same codebase.

## Deployment Status

The project is already deployed and available here:

- [SecureShare Live Demo](https://secure-file-sharing-app-sigma.vercel.app/)

## Production Setup

### Backend environment variables

Create `backend/secure-file-sharing/.env` with:

```env
PORT=5000
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-long-random-secret
TOKEN_EXPIRY=2d
FRONTEND_URL=https://secure-file-sharing-app-sigma.vercel.app
```

### Frontend environment variables

Create `frontend/secure-file-sharing-frontend/.env` with:

```env
VITE_API_BASE_URL=https://your-backend-domain.onrender.com
```

## Local Development

### Backend

```bash
cd backend/secure-file-sharing
npm install
npm start
```

### Frontend

```bash
cd frontend/secure-file-sharing-frontend
npm install
npm run dev
```

## Deployment Notes

- Frontend: deploy the Vite app to Vercel or Netlify.
- Backend: deploy the Express API to Render.
- Database: use MongoDB Atlas free tier.
- GridFS is used for file persistence, so uploads remain available after deployment restarts.
- The frontend includes SPA route fallback support, so direct links and page refreshes work correctly in production.

## Project Structure

```text
backend/secure-file-sharing/           Express backend
frontend/secure-file-sharing-frontend/ React frontend
```

## Why This Project Is Good For a Portfolio

- It shows practical full-stack engineering rather than a toy demo.
- It covers authentication, authorization, storage, routing, deployment, and UI polish in one app.
- It demonstrates security decisions at the backend, not just in the UI.
- It includes a live production deployment, which is often more persuasive than code alone.

## License

Specify your license here.