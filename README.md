# Secure File Sharing App

A full stack application for secure file sharing with authentication, upload/download, and logging features.

## Features
- User authentication (register/login)
- Secure file upload and download
- File access logging
- Rate limiting and security middleware
- Modern React frontend

## Project Structure
```
backend/secure-file-sharing/   # Node.js/Express backend
frontend/secure-file-sharing-frontend/   # React frontend
```

## Getting Started

### Backend
1. Navigate to `backend/secure-file-sharing`
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (see `.env.example` if available)
4. Start the server:
   ```
   npm start
   ```

### Frontend
1. Navigate to `frontend/secure-file-sharing-frontend`
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Production Setup

This project is ready for free deployment with the following stack:

- Frontend: Vercel or Netlify
- Backend: Render Web Service
- Database and file storage: MongoDB Atlas free tier with GridFS

### Required Environment Variables

Backend (`backend/secure-file-sharing/.env`):

```env
PORT=5000
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-long-random-secret
TOKEN_EXPIRY=2d
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

Frontend (`frontend/secure-file-sharing-frontend/.env`):

```env
VITE_API_BASE_URL=https://your-backend-domain.onrender.com
```

### Deployment Notes

1. Deploy the backend first on Render.
2. Deploy the frontend on Vercel or Netlify.
3. Update `FRONTEND_URL` on the backend to your live frontend domain.
4. Ensure the frontend is using the deployed backend URL through `VITE_API_BASE_URL`.
5. For Vercel, the frontend includes a SPA rewrite so routes like `/dashboard`, `/profile`, and `/download/:id` work on refresh.

### Local Development Notes

- The frontend uses React Router for page navigation.
- The backend serves encrypted file data and stores file blobs in MongoDB GridFS.
- Uploaded files are not stored on the host filesystem in production.

## Deployment
- Configure the environment variables listed above.
- Build the frontend with `npm run build` before deploying.
- Use a platform-specific SPA fallback for the frontend so direct links and refreshes work correctly.
- Keep the backend and frontend domains in sync through the two URL variables above.

## License
Specify your license here.
