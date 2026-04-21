import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import webPush from 'web-push';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { readFileSync, writeFileSync, existsSync } from 'fs';



webPush.setVapidDetails(
  'mailto:support@massenger.app',
  'BPFgOwZlOvfolHvuEcfpGk9Qewhd8I-Uo5r47jWOc6-3IUlo3TEwE0vxNyb75-W9rpaswnTejDEKmW2f0xjeSDM',
  'CgDy4-ByE-UxV3V6nGb4ryziTjJ375aFHjxCDX3p22g'
);


const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const ALLOWED_ORIGINS = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:5173']
  : true; // allow all origins if not set

app.use(helmet({ contentSecurityPolicy: false })); // Disable CSP as it can block external assets (avatars/STUN) unless configured deeply

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 50, // limit each IP to 50 requests per window
  message: { error: 'Too many requests, please try again later.' }
});

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ─── Simple File-based Database ─────────────────────────────────────────────
const DB_FILE = './db.json';

function loadDB() {
  if (!existsSync(DB_FILE)) {
    writeFileSync(DB_FILE, JSON.stringify({ users: [], messages: [] }, null, 2));
  }
  return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
}

function saveDB(db) {
  writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ─── Auth Endpoints ──────────────────────────────────────────────────────────
app.post('/api/subscribe', authLimiter, (req, res) => {
  const { userId, subscription } = req.body;
  const db = loadDB();
  const index = db.users.findIndex(u => u.id === userId);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  
  if (!db.users[index].pushSubs) db.users[index].pushSubs = [];
  // Avoid duplicates
  const subIdx = db.users[index].pushSubs.findIndex(s => s.endpoint === subscription.endpoint);
  if (subIdx === -1) db.users[index].pushSubs.push(subscription);
  else db.users[index].pushSubs[subIdx] = subscription;
  
  saveDB(db);
  res.status(201).json({ success: true });
});

async function sendPush(toId, payload) {
  const db = loadDB();
  const user = db.users.find(u => u.id === toId);
  if (!user || !user.pushSubs) return;
  
  const results = await Promise.allSettled(
    user.pushSubs.map(sub => webPush.sendNotification(sub, JSON.stringify(payload)))
  );
  
  // Cleanup failed subs (e.g. expired)
  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length > 0) {
    // Logic to remove stale subs would go here for a production app
  }
}

app.post('/api/register', authLimiter, async (req, res) => {
  const { username, password, displayName } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const db = loadDB();
  const exists = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (exists) return res.status(400).json({ error: 'Username already taken' });

  const hashed = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    username: username.toLowerCase(),
    displayName: displayName || username,
    password: hashed,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Aidan`,
    createdAt: Date.now()
  };
  db.users.push(user);
  saveDB(db);

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token: safeUser.id });
});

app.post('/api/login', authLimiter, async (req, res) => {
  const { username, password } = req.body;
  const db = loadDB();
  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) return res.status(401).json({ error: 'User not found' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Wrong password' });

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token: safeUser.id });
});

// ─── User Search ─────────────────────────────────────────────────────────────
app.get('/api/users/search', (req, res) => {
  const { q, myId } = req.query;
  if (!q) return res.json([]);
  const db = loadDB();
  const results = db.users
    .filter(u => u.id !== myId && u.username.toLowerCase().includes(q.toLowerCase()))
    .map(({ password, ...u }) => u);
  res.json(results);
});

// ─── User Profile Endpoints ──────────────────────────────────────────────────
app.get('/api/user/:id', (req, res) => {
  const db = loadDB();
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safeUser } = user;
  res.json(safeUser);
});

app.put('/api/user/profile', (req, res) => {
  const { id, displayName, avatar } = req.body;
  const db = loadDB();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });

  db.users[index] = { ...db.users[index], displayName, avatar };
  saveDB(db);

  const { password, ...safeUser } = db.users[index];
  res.json(safeUser);
});

// ─── Messages Endpoints ───────────────────────────────────────────────────────
app.get('/api/messages/:userId/:otherId', (req, res) => {
  const { userId, otherId } = req.params;
  const db = loadDB();
  const msgs = db.messages.filter(m =>
    (m.from === userId && m.to === otherId) ||
    (m.from === otherId && m.to === userId)
  );
  res.json(msgs);
});

// ─── WebSocket: Real-time Chat + WebRTC Signaling ────────────────────────────
const clients = new Map(); // userId -> ws

wss.on('connection', (ws) => {
  let myUserId = null;

  ws.on('message', (rawData) => {
    let data;
    try { data = JSON.parse(rawData); } catch { return; }

    // Register this connection with a userId
    if (data.type === 'register') {
      myUserId = data.userId;
      clients.set(myUserId, ws);

      // Broadcast online status to everyone
      broadcastPresence(myUserId, true);
      return;
    }

    // ── Chat Message ──
    if (data.type === 'message') {
      const db = loadDB();
      const msg = { id: uuidv4(), from: data.from, to: data.to, text: data.text, timestamp: Date.now() };
      db.messages.push(msg);
      saveDB(db);
      
      const targetUser = db.users.find(u => u.id === data.to);
      const sender = db.users.find(u => u.id === data.from);

      broadcast(data.to, { type: 'message', msg });
      broadcast(data.from, { type: 'message_sent', msg });
      
      // If target user is offline, send push
      if (!clients.has(data.to)) {
        sendPush(data.to, {
          title: `Message from ${sender.displayName}`,
          body: data.text,
          url: '/'
        });
      }
    }

    if (data.type === 'call-request') {
      broadcast(data.to, { type: 'call-request', from: data.from, callerInfo: data.callerInfo, callType: data.callType });
      
      if (!clients.has(data.to)) {
        sendPush(data.to, {
          title: `Incoming ${data.callType} call`,
          body: `${data.callerInfo.displayName} is calling you...`,
          url: '/'
        });
      }
    }

    // ── WebRTC Signaling (offer, answer, ice-candidate, call-end) ──
    if (['offer', 'answer', 'ice-candidate', 'call-end', 'call-decline'].includes(data.type)) {
      const targetWs = clients.get(data.to);
      if (targetWs && targetWs.readyState === 1) {
        data.from = myUserId;
        targetWs.send(JSON.stringify(data));
      }
    }
  });

  ws.on('close', () => {
    if (myUserId) {
      clients.delete(myUserId);
      broadcastPresence(myUserId, false);
    }
  });
});

function broadcastPresence(userId, isOnline) {
  const payload = JSON.stringify({ type: 'presence', userId, isOnline });
  clients.forEach((clientWs) => {
    if (clientWs.readyState === 1) {
      clientWs.send(payload);
    }
  });
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`✅ Massenger server running on port ${PORT}`);
});

