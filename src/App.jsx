import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MessageSquare, Search, Phone, Video, MoreVertical, Mic, MicOff,
  VideoOff, Video as VideoIcon, Monitor, PhoneOff, Send, X, LogOut,
  PhoneIncoming, Check, CheckCheck, Loader2, ChevronLeft, Settings, User, Image, Camera
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://massenger-iqw8.onrender.com';
const WS_URL = import.meta.env.VITE_WS_URL || 'wss://massenger-iqw8.onrender.com';

// ─── Constants ──────────────────────────────────────────────────────────────
const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aidan',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Bentley',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Caleb',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Damion',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Easton',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=George',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Henry',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Kevin',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mason'
];

// ─── Utilities ──────────────────────────────────────────────────────────────
function timeStr(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function dateStr(ts) {
  const d = new Date(ts);
  const today = new Date();
  const diff = today - d;
  if (diff < 86400000 && today.getDate() === d.getDate()) return 'Today';
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}
function getInitial(name) { return name ? name[0].toUpperCase() : '?'; }
const colors = ['#00a884','#1877f2','#e53935','#7b1fa2','#f57c00','#00838f'];
function colorFor(name) { return colors[(name?.charCodeAt(0) || 0) % colors.length]; }

const VAPID_PUBLIC_KEY = 'BPFgOwZlOvfolHvuEcfpGk9Qewhd8I-Uo5r47jWOc6-3IUlo3TEwE0vxNyb75-W9rpaswnTejDEKmW2f0xjeSDM';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.vidyo.com' }
  ],
  iceCandidatePoolSize: 10
};

// ════════════════════════════════════════════════════════════════════════════
//  COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

function AuthScreen({ onAuth }) {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/${tab}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      onAuth(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo.png" alt="Massenger" style={{ width: 60, height: 60, borderRadius: 15, marginBottom: 12 }} />
          <h1>Massenger</h1>
        </div>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Register</button>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={submit}>
          {tab === 'register' && (
            <div className="auth-field">
              <label>Your Name</label>
              <input placeholder="Full Name" value={form.displayName} onChange={e => set('displayName', e.target.value)} />
            </div>
          )}
          <div className="auth-field">
            <label>Username</label>
            <input placeholder="Username" value={form.username} onChange={e => set('username', e.target.value)} required />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>{loading ? 'Wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}</button>
        </form>
      </div>
    </div>
  );
}

function ProfileSettings({ user, onClose, onUpdate }) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [avatar, setAvatar] = useState(user.avatar);
  const [loading, setLoading] = useState(false);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const fileInputRef = useRef(null);

  const deleteAccount = async () => {
    if (!window.confirm('CRITICAL: Delete your account and all data permanently?')) return;
    try {
      await fetch(`${API}/api/user/${user.id}`, { method: 'DELETE' });
      localStorage.clear();
      window.location.reload();
    } catch (e) { alert('Failed to delete'); }


  };

  const save = async () => {

    if (!displayName.trim()) return alert('Name cannot be empty');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, displayName, avatar })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update');
      onUpdate(data);
      onClose();
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2>Edit Profile</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
          <div className="profile-avatar-edit" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div className="avatar-img" style={{ 
              width: '85px', 
              height: '85px', 
              borderRadius: '50%',
              backgroundImage: `url(${avatar})`, 
              backgroundColor: colorFor(displayName),
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 'bold',
              color: 'white',
              border: '3px solid var(--primary)'
            }}>
              {!avatar && getInitial(displayName)}
            </div>
            
            <input type="file" ref={fileInputRef} onChange={onFileChange} style={{ display: 'none' }} accept="image/*" />
            <button className="auth-submit" style={{ 
              padding: '8px 16px', 
              fontSize: '13px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px', 
              width: 'auto',
              margin: '0 auto' 
            }} onClick={() => fileInputRef.current.click()}>
              <Camera size={16} /> Upload New Photo
            </button>

            <div style={{ width: '100%', textAlign: 'center', marginTop: '4px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>— Or pick a character —</p>
              <div className="avatar-selector" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '8px',
                maxWidth: '220px',
                margin: '0 auto'
              }}>
                {DEFAULT_AVATARS.map(url => (
                  <div 
                    key={url} 
                    className={`avatar-option ${avatar === url ? 'active' : ''}`}
                    style={{ 
                      width: '100%', 
                      aspectRatio: '1', 
                      borderRadius: '50%', 
                      backgroundImage: `url(${url})`,
                      backgroundSize: 'cover',
                      cursor: 'pointer',
                      border: avatar === url ? '3px solid var(--primary)' : '2px solid transparent',
                      transition: 'all 0.2s',
                      opacity: avatar === url ? 1 : 0.8
                    }}
                    onClick={() => setAvatar(url)}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="settings-field" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Display Name</label>
            <input 
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                background: 'var(--bg)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                color: 'var(--text)',
                fontSize: '14px' 
              }} 
              value={displayName} 
              onChange={e => setDisplayName(e.target.value)} 
            />
          </div>
        </div>
    <div className="modal-footer" style={{ padding: '12px 20px', display: 'flex', justifySelf: 'flex-end', justifyContent: 'flex-end', gap: '10px', background: 'var(--bg-input)' }}>
          <button className="btn-cancel" style={{ color: 'var(--danger)', fontWeight: '500', fontSize: '13px', marginRight: 'auto' }} onClick={deleteAccount}>Delete Account</button>
          <button className="btn-cancel" style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }} onClick={onClose}>Cancel</button>
          <button className="btn-save" style={{ background: 'var(--primary)', color: 'white', padding: '8px 20px', borderRadius: '8px', fontWeight: '600', fontSize: '14px' }} onClick={save} disabled={loading}>{loading ? 'Wait...' : 'Save Changes'}</button>
        </div>

      </div>
    </div>
  );
}

// ─── Video Call Overlay Component ───
function CallOverlay({ peer, wsRef, callType, onEnd, isIncoming }) {

  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  
  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(callType === 'audio');
  const [sharing, setSharing] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let t;
    if (connected) t = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(t);
  }, [connected]);

  const init = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video' ? { facingMode: 'user' } : false,
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      localStreamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(RTC_CONFIG);
      pcRef.current = pc;
      wsRef.current._pc = pc;

      // Handle buffered ACCEPT
      if (wsRef.current._acceptBuffer) {
        const data = wsRef.current._acceptBuffer;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        wsRef.current.send(JSON.stringify({ type: 'offer', to: data.from, offer }));
        wsRef.current._acceptBuffer = null;
      }

      // SET HANDLERS FIRST
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          wsRef.current?.send(JSON.stringify({ type: 'ice-candidate', to: peer.id, candidate: e.candidate }));
        }
      };

      pc.ontrack = (e) => {
        if (remoteRef.current && e.streams[0]) {
          remoteRef.current.srcObject = e.streams[0];
          setConnected(true);
          remoteRef.current.play().catch(() => {});
        }
      };

      pc.oniceconnectionstatechange = () => {
        const s = pc.iceConnectionState;
        if (s === 'connected' || s === 'completed') setConnected(true);
        if (s === 'failed') pc.restartIce();
      };
      
      // Watchdog: If not connected in 6s, attempt ICE restart
      const watchdog = setTimeout(() => {
        if (!connected && pc.iceConnectionState !== 'connected') {
          pc.restartIce();
        }
      }, 6000);

      // ADD TRACKS
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // HANDLE BUFFERED OFFER
      if (wsRef.current?._offerBuffer) {
        const data = wsRef.current._offerBuffer;
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const ans = await pc.createAnswer();
        await pc.setLocalDescription(ans);
        wsRef.current.send(JSON.stringify({ type: 'answer', to: data.from, answer: ans }));
        wsRef.current._offerBuffer = null;
        if (wsRef.current._iceBuffer) {
          for (let c of wsRef.current._iceBuffer) {
            await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
          }
          wsRef.current._iceBuffer = [];
        }
      }
      
      return () => clearTimeout(watchdog);



      // If we are the one who accepted, we just wait for offer
      // If we are the one who started, we Wait for 'call-accept' before sending offer
    } catch (err) { console.error(err); }
  };


  useEffect(() => {
    init();
    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      pcRef.current?.close();
      delete wsRef.current._pc;
    };
  }, []);

  const end = () => {
    wsRef.current?.send(JSON.stringify({ type: 'call-end', to: peer.id }));
    onEnd();
  };

  const durStr = () => {
    const m = String(Math.floor(duration/60)).padStart(2,'0');
    const s = String(duration%60).padStart(2,'0');
    return `${m}:${s}`;
  };

  const toggleScreen = async () => {
    if (sharing) {
      const cam = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = cam.getVideoTracks()[0];
      const s = pcRef.current.getSenders().find(s => s.track.kind === 'video');
      s.replaceTrack(track);
      localRef.current.srcObject = cam;
      setSharing(false);
    } else {
      const scr = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = scr.getVideoTracks()[0];
      const s = pcRef.current.getSenders().find(s => s.track.kind === 'video');
      s.replaceTrack(track);
      localRef.current.srcObject = scr;
      track.onended = toggleScreen;
      setSharing(true);
    }
  };

  return (
    <div className="call-overlay">
      <div className="call-stage">
        <div className="remote-video">
          <video ref={remoteRef} autoPlay playsInline style={{ display: connected ? 'block' : 'none' }} />
          {!connected && (
            <div className="remote-placeholder">
              <div className="big-avatar" style={{ backgroundImage: `url(${peer.avatar})`, backgroundColor: colorFor(peer.displayName) }} />
              <h3>{peer.displayName}</h3>
              <p>{isIncoming ? 'Connecting...' : 'Calling...'}</p>
            </div>
          )}
        </div>
        <div className="call-info-bar"><h2>{peer.displayName}</h2><p>{connected ? durStr() : 'Connecting...'}</p></div>
        {callType === 'video' && (
          <div className="local-video-pip">
            <video ref={localRef} autoPlay playsInline muted style={{ display: videoOff ? 'none' : 'block' }} />
            {videoOff && <div className="pip-off">🎥</div>}
          </div>
        )}
      </div>
      <div className="call-controls-bar">
        <button className="cc-btn" onClick={() => { 
          const newState = !muted;
          setMuted(newState); 
          localStreamRef.current.getAudioTracks().forEach(t => t.enabled = !newState); 
        }}>
          <div className={`cc-btn-circle ${muted ? 'muted' : ''}`}>{muted ? <MicOff /> : <Mic />}</div>
        </button>
        {callType === 'video' && (
          <button className="cc-btn" onClick={() => { 
            const newState = !videoOff;
            setVideoOff(newState); 
            localStreamRef.current.getVideoTracks().forEach(t => t.enabled = !newState); 
          }}>
            <div className={`cc-btn-circle ${videoOff ? 'muted' : ''}`}>{videoOff ? <VideoOff /> : <VideoIcon />}</div>
          </button>
        )}
        {callType === 'video' && (
          <button className="cc-btn" onClick={toggleScreen}><div className={`cc-btn-circle ${sharing ? 'muted' : ''}`}><Monitor /></div></button>
        )}
        <button className="cc-btn" onClick={end}><div className="cc-btn-circle end"><PhoneOff /></div></button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════════════════════════════════════
function App() {
  const getSafeJSON = (key, def = null) => {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : def;
    } catch { return def; }
  };

  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const handleError = (e) => { 
      console.error('App Crash Log:', e); 
      setHasError(true); 
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const [user, setUser] = useState(() => {
    try { 
      const raw = localStorage.getItem('m_user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object' && parsed.id) ? parsed : null;
    } catch { return null; }
  });

  const [contacts, setContacts] = useState(() => {
    if (!user?.id) return [];
    return getSafeJSON(`m_contacts_${user.id}`, []);
  });
  const [activePeer, setActivePeer] = useState(() => {
    if (!user?.id) return null;
    return getSafeJSON(`m_activePeer_${user.id}`);
  });

  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [toast, setToast] = useState(null); // { title: '', text: '', peer: {} }
  const activePeerRef = useRef(null);

  const wsRef = useRef(null);
  useEffect(() => { activePeerRef.current = activePeer; }, [activePeer]);

  const loadMessages = useCallback(async (peerId) => {
    if (!user) return;
    const res = await fetch(`${API}/api/messages/${user.id}/${peerId}`);
    const msgs = await res.json();
    setMessages(msgs);
  }, [user]);

  // Sync state to local storage when it changes
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`m_contacts_${user.id}`, JSON.stringify(contacts));
    }
  }, [contacts, user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`m_activePeer_${user.id}`, JSON.stringify(activePeer));
    }
  }, [activePeer, user?.id]);

  // Load message for active peer if exists
  useEffect(() => {
    if (activePeer) {
      Promise.resolve().then(() => loadMessages(activePeer.id));
    }
  }, [activePeer, loadMessages]);


  
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [msgInput, setMsgInput] = useState('');
  
  // Mobile UI
  const [view, setView] = useState('list'); // 'list' or 'chat'
  
  const messagesEndRef = useRef(null);
  const searchInputRef = useRef(null);
  const recvSound = useRef(new Audio('https://cdn.pixabay.com/audio/2022/10/16/audio_024b896b01.mp3')); // Crystal Ding

  const sentSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'));
  const ringSound = useRef(new Audio('https://cdn.pixabay.com/audio/2024/02/09/audio_66723f5451.mp3')); // Premium Ringtone


  useEffect(() => {
    if (user && window.innerWidth < 768) {
      setTimeout(() => searchInputRef.current?.focus(), 500);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const registerPush = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        await fetch(`${API}/api/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, subscription })
        });
      } catch (err) { console.error('Push failed:', err); }
    };
    if ('serviceWorker' in navigator && user) registerPush();
  }, [user]);

  useEffect(() => {
    ringSound.current.loop = true;
  }, []);

  useEffect(() => {
    if (incomingCall || (activeCall && !activeCall.isIncoming && !activeCall.connected)) {
      ringSound.current.play().catch(() => {});
    } else {
      ringSound.current.pause();
      ringSound.current.currentTime = 0;
    }
  }, [incomingCall, activeCall]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const onAuth = (u, t) => {
    setUser(u);
    localStorage.setItem('m_user', JSON.stringify(u));
    localStorage.setItem('m_token', t);
  };


  const logout = () => {
    localStorage.clear();
    setUser(null);
    wsRef.current?.close();
  };

  // ── WS Setup ──
  useEffect(() => {
    if (!user) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws._pc = null;
    ws._offerBuffer = null;
    ws._acceptBuffer = null;
    ws._iceBuffer = [];
    ws.onopen = () => ws.send(JSON.stringify({ type: 'register', userId: user.id }));
    
    ws.onmessage = async (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'presence') {
          setOnlineUsers(prev => {
            const next = new Set(prev);
            data.isOnline ? next.add(data.userId) : next.delete(data.userId);
            return next;
          });
        }
        if (data.type === 'message' || data.type === 'message_sent') {
          const msg = data.msg;
          const otherId = data.type === 'message' ? msg.from : msg.to;
          
          if (data.type === 'message') {
            recvSound.current.currentTime = 0;
            recvSound.current.play().catch(() => {});
          } else {
            sentSound.current.currentTime = 0;
            sentSound.current.play().catch(() => {});
          }

          setContacts(prev => {
            const arr = [...prev];
            const idx = arr.findIndex(c => c.id === otherId);
            const previewText = msg.image ? '📷 Image' : msg.text;

            if (idx === -1) {
              const newPeer = { 
                id: otherId, 
                displayName: msg.senderInfo?.displayName || 'Unknown', 
                avatar: msg.senderInfo?.avatar || '',
                unreadCount: activePeerRef.current?.id === otherId ? 0 : 1,
                lastMsg: previewText,
                lastTs: msg.timestamp
              };
              arr.unshift(newPeer);
              if (activePeerRef.current?.id !== otherId) {
                setToast({ title: newPeer.displayName, text: previewText, peer: newPeer });
              }
            } else {
              if (activePeerRef.current?.id !== otherId) {
                setToast({ title: arr[idx].displayName, text: previewText, peer: arr[idx] });
              }
              arr[idx] = { 
                ...arr[idx], 
                lastMsg: previewText, 
                lastTime: msg.timestamp,
                unreadCount: (activePeerRef.current?.id === otherId) ? 0 : (arr[idx].unreadCount || 0) + 1
              };
              const itm = arr.splice(idx, 1)[0];
              arr.unshift(itm);
            }
            return arr;
          });

          if (activePeerRef.current?.id === otherId) {
            setMessages(prev => [...prev, msg]);
            if (data.type === 'message') {
              wsRef.current?.send(JSON.stringify({ type: 'read-messages', from: otherId, to: user.id }));
            }
          }
        }

        if (data.type === 'message-deleted') {
          setMessages(prev => prev.filter(m => m.id !== data.msgId));
        }
        if (data.type === 'messages-seen') {
          setMessages(prev => prev.map(m => m.from === user.id ? { ...m, seen: true } : m));
        }
        // Signaling
        if (data.type === 'call-request') setIncomingCall(data);
        if (data.type === 'call-end' || data.type === 'call-decline') { 
          setActiveCall(null); 
          setIncomingCall(null); 
        }
        
        if (data.type === 'call-accept') {
          if (wsRef.current._pc) {
            const pc = wsRef.current._pc;
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            wsRef.current.send(JSON.stringify({ type: 'offer', to: data.from, offer }));
          } else {
            wsRef.current._acceptBuffer = data;
          }
        }


        if (data.type === 'offer') {
          if (wsRef.current._pc) {
            const pc = wsRef.current._pc;
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const ans = await pc.createAnswer();
            await pc.setLocalDescription(ans);
            wsRef.current.send(JSON.stringify({ type: 'answer', to: data.from, answer: ans }));

            if (wsRef.current._iceBuffer) {
              for (let c of wsRef.current._iceBuffer) {
                await pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
              }
              wsRef.current._iceBuffer = [];
            }
          } else {
            wsRef.current._offerBuffer = data;
          }
        }


        if (data.type === 'answer' && wsRef.current._pc) {
          await wsRef.current._pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        }

        if (data.type === 'ice-candidate') {
          const pc = wsRef.current._pc;
          if (pc && pc.remoteDescription) {
            pc.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {});
          } else {
            if (!wsRef.current._iceBuffer) wsRef.current._iceBuffer = [];
            wsRef.current._iceBuffer.push(data.candidate);
          }
        }


      } catch (err) { console.error('WS Message Error:', err); }
    };


    return () => ws.close();
  }, [user]); // Removed activePeer dependency to keep WS alive


  // ── Search ──
  useEffect(() => {
    if (!search.trim()) {
      Promise.resolve().then(() => setSearchResults([]));
      return;
    }


    const t = setTimeout(async () => {
      const res = await fetch(`${API}/api/users/search?q=${search}&myId=${user.id}`);
      const d = await res.json();
      setSearchResults(d);
    }, 400);
    return () => clearTimeout(t);
  }, [search, user?.id]);




  const openChat = async (peer) => {
    setActivePeer(peer);
    setView('chat');
    setSearch('');
    // Ensure in contacts and reset unread
    setContacts(prev => {
      const idx = prev.findIndex(c => c.id === peer.id);
      if (idx === -1) return [peer, ...prev];
      const arr = [...prev];
      arr[idx] = { ...arr[idx], unreadCount: 0 };
      return arr;
    });
    loadMessages(peer.id);
    wsRef.current?.send(JSON.stringify({ type: 'read-messages', from: peer.id, to: user.id }));
  };


  const send = (e, customData = {}) => {
    e?.preventDefault();
    if (!msgInput.trim() && !customData.image || !activePeer) return;
    try {
      wsRef.current.send(JSON.stringify({ 
        type: 'message', 
        from: user.id, 
        to: activePeer.id, 
        text: msgInput,
        ...customData
      }));
    } catch (err) { console.error(err); }
    setMsgInput('');
  };

  const [uploading, setUploading] = useState(false);
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      send(null, { image: ev.target.result });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };


  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);


  if (hasError) return (
    <div style={{ padding: 40, textAlign: 'center', background: '#111b21', color: 'white', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h2 style={{ marginBottom: 16 }}>Connection Issue</h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 300 }}>The app couldn't load your session. Please refresh or try again.</p>
      <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ background: '#00a884', color: 'white', padding: '12px 24px', borderRadius: 8, marginTop: 24, fontWeight: '600' }}>Retry Now</button>
    </div>
  );



  if (!user || typeof user !== 'object' || !user.id) return <AuthScreen onAuth={onAuth} />;

  return (
    <div className="app-layout">
      {/* Modals */}
      {showSettings && <ProfileSettings user={user} onClose={() => setShowSettings(false)} onUpdate={u => { setUser(u); localStorage.setItem('m_user', JSON.stringify(u)); }} />}
      
      {incomingCall && (
        <div className="incoming-call-modal">
          <div className="avatar-img" style={{ width: 44, height: 44, backgroundImage: `url(${incomingCall.callerInfo.avatar})`, backgroundColor: colorFor(incomingCall.callerInfo.displayName) }} />
          <div className="incoming-info"><h3>{incomingCall.callerInfo.displayName}</h3><p>Incoming {incomingCall.callType} call...</p></div>
          <div className="incoming-actions">
            <button className="reject-btn" onClick={() => { wsRef.current.send(JSON.stringify({ type: 'call-decline', to: incomingCall.callerInfo.id })); setIncomingCall(null); }}><X /></button>
            <button className="accept-btn" onClick={() => { 
              wsRef.current.send(JSON.stringify({ type: 'call-accept', to: incomingCall.callerInfo.id, from: user.id }));
              setActiveCall({ peer: incomingCall.callerInfo, callType: incomingCall.callType, isIncoming: true }); 
              setIncomingCall(null); 
            }}><Phone /></button>

          </div>
        </div>
      )}

      {activeCall && <CallOverlay peer={activeCall.peer} callType={activeCall.callType} wsRef={wsRef} isIncoming={activeCall.isIncoming} onEnd={() => setActiveCall(null)} />}

      {/* Toast Notification */}
      {toast && (
        <div className="toast-popup" onClick={() => { openChat(toast.peer); setToast(null); }}>
          <div className="avatar-img" style={{ width: 32, height: 32, fontSize: 13, backgroundImage: `url(${toast.peer.avatar})`, backgroundColor: colorFor(toast.peer.displayName) }}>{!toast.peer.avatar && getInitial(toast.peer.displayName)}</div>
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-text">{toast.text}</div>
          </div>
          <button className="toast-close" onClick={(e) => { e.stopPropagation(); setToast(null); }}><X size={14} /></button>
        </div>
      )}


      {/* Sidebar */}
      <div className={`sidebar ${view === 'chat' ? 'hidden' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-top-user" onClick={() => setShowSettings(true)}>
            <div className="avatar-img" style={{ width: 38, height: 38, fontSize: 16, backgroundImage: `url(${user.avatar})`, backgroundColor: colorFor(user.displayName) }}>
              {!user.avatar && getInitial(user.displayName)}
            </div>
            <span style={{ fontWeight: 600 }}>{user.displayName}</span>
          </div>
          <div className="sidebar-top-actions">
            <button className="icon-btn" onClick={() => setShowSettings(true)}><Settings size={18} /></button>
            <button className="icon-btn" onClick={logout}><LogOut size={18} /></button>
          </div>
        </div>
        <div className="search-bar">
          <div className="search-inner">
            <Search size={16} />
            <input 
              ref={searchInputRef}
              placeholder="Search people to message..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
            {search && <button className="clear-search-btn" onClick={() => setSearch('')}><X size={14} /></button>}
          </div>
        </div>
        <div className="contact-list">
          {search && searchResults.map(u => (
            <div key={u.id} className="contact-item" onClick={() => openChat(u)}>
              <div className="contact-avatar">
                <div className="avatar-img" style={{ backgroundImage: `url(${u.avatar})`, backgroundColor: colorFor(u.displayName) }}>{!u.avatar && getInitial(u.displayName)}</div>
                {onlineUsers.has(u.id) && <div className="online-dot" />}
              </div>
              <div className="contact-info"><div className="contact-name">{u.displayName}</div><div className="contact-preview">@{u.username}</div></div>
            </div>
          ))}
          {!search && contacts.map(c => (
            <div key={c.id} className={`contact-item ${activePeer?.id === c.id ? 'active' : ''}`} onClick={() => openChat(c)}>
              <div className="contact-avatar">
                <div className="avatar-img" style={{ backgroundImage: `url(${c.avatar})`, backgroundColor: colorFor(c.displayName) }}>{!c.avatar && getInitial(c.displayName)}</div>
                {onlineUsers.has(c.id) && <div className="online-dot" />}
              </div>
              <div className="contact-info">
                <div className="contact-row1">
                  <div className="contact-name">{c.displayName}</div>
                  {c.lastTime && <div className="contact-time">{timeStr(c.lastTime)}</div>}
                </div>
                <div className="contact-row2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="contact-preview">{c.lastMsg || `@${c.username}`}</div>
                  {c.unreadCount > 0 && <div className="unread-badge">{c.unreadCount}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className={`chat-area ${view === 'list' || !activePeer ? 'hidden' : ''}`}>
        <div className="chat-bg" />
        {activePeer ? (
          <>
            <div className="chat-header">
              <div className="chat-header-left">
                <button className="icon-btn" onClick={() => setView('list')} style={{ marginRight: 8 }}><ChevronLeft size={24} /></button>
                <div className="avatar-img" style={{ width: 40, height: 40, backgroundImage: `url(${activePeer.avatar})`, backgroundColor: colorFor(activePeer.displayName) }}>{!activePeer.avatar && getInitial(activePeer.displayName)}</div>
                <div><div className="chat-header-name">{activePeer.displayName}</div><div className="chat-header-status">{onlineUsers.has(activePeer.id) ? 'Online' : 'Offline'}</div></div>
              </div>
              <div className="chat-header-actions">
                <button className="icon-btn green" onClick={() => { wsRef.current.send(JSON.stringify({ type: 'call-request', to: activePeer.id, callerInfo: { id: user.id, displayName: user.displayName, avatar: user.avatar }, callType: 'audio' })); setActiveCall({ peer: activePeer, callType: 'audio', isIncoming: false }); }}><Phone size={18} /></button>
                <button className="icon-btn green" onClick={() => { wsRef.current.send(JSON.stringify({ type: 'call-request', to: activePeer.id, callerInfo: { id: user.id, displayName: user.displayName, avatar: user.avatar }, callType: 'video' })); setActiveCall({ peer: activePeer, callType: 'video', isIncoming: false }); }}><Video size={18} /></button>
                <button className="icon-btn" onClick={() => { wsRef.current.send(JSON.stringify({ type: 'call-request', to: activePeer.id, callerInfo: { id: user.id, displayName: user.displayName, avatar: user.avatar }, callType: 'video' })); setActiveCall({ peer: activePeer, callType: 'video', isIncoming: false }); }}><Monitor size={18} /></button>
              </div>
            </div>
            <div className="messages-scroll">
              {messages.map((m) => (
                <div key={m.id} className={`msg-row ${m.from === user.id ? 'out' : 'in'}`}>

                  <div 
                    className="msg-bubble"
                    onContextMenu={(e) => {
                      if (m.from === user.id) {
                        e.preventDefault();
                        if (window.confirm('Delete message for everyone?')) {
                          wsRef.current.send(JSON.stringify({ type: 'delete-message', msgId: m.id, from: user.id }));
                        }
                      }
                    }}
                  >
                    {m.image && <img src={m.image} alt="Upload" className="msg-img" style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 4, display: 'block' }} />}
                    {m.text}
                    <div className="msg-meta">

                      {timeStr(m.timestamp)}
                      {m.from === user.id && (
                        <span style={{ marginLeft: 4, color: m.seen ? '#34b7f1' : 'rgba(255,255,255,0.4)' }}>
                          {m.seen ? <CheckCheck size={14} /> : <Check size={14} />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-bar" onSubmit={send}>
              <button type="button" className="icon-btn" style={{ color: 'var(--primary)' }} onClick={() => document.getElementById('chat-file').click()} disabled={uploading}>
                {uploading ? <Loader2 className="spin" size={20} /> : <Image size={20} />}
              </button>
              <input type="file" id="chat-file" hidden accept="image/*" onChange={handleUpload} />
              
              <div className="msg-input-wrap">
                <textarea placeholder="Message" value={msgInput} rows={1} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (msgInput.trim()) send(); } }} />
              </div>
              <button type="submit" className="send-btn" disabled={!msgInput.trim()}><Send size={20} /></button>
            </form>

          </>
        ) : (
          <div className="empty-chat">
            <div className="empty-chat-icon"><img src="/logo.png" alt="Massenger" style={{ width: 80, height: 80, borderRadius: 20 }} /></div>
            <h2>Massenger</h2>
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
