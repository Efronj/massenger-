# Massenger

A full-stack real-time messaging app with video/audio calls and screen sharing — like WhatsApp & Messenger.

## Features
- ✅ Real user registration & login (username + password)
- ✅ Search any user by username
- ✅ Real-time messaging via WebSocket
- ✅ Video calls with WebRTC
- ✅ Audio-only calls
- ✅ Screen sharing
- ✅ Online/offline presence

## Tech Stack
- **Frontend**: React + Vite → Vercel
- **Backend**: Node.js + Express + WebSocket (ws) → Render
- **Calls**: WebRTC (peer-to-peer via STUN)
- **Auth**: bcryptjs password hashing

## Deployment

### Backend → Render
1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Settings: Build=`npm install`, Start=`node server.js`
4. Add env var: `FRONTEND_URL=https://your-vercel-url.vercel.app`

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → Import from GitHub
2. Add env variables:
   - `VITE_API_URL=https://your-render-url.onrender.com`
   - `VITE_WS_URL=wss://your-render-url.onrender.com`
3. Deploy

## Local Dev
```bash
# Terminal 1 - Backend
node server.js

# Terminal 2 - Frontend
npm run dev
```
