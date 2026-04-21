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
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
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
    { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
  ]
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
          <button className="btn-cancel" style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }} onClick={onClose}>Cancel</button>
          <button className="btn-save" style={{ background: 'var(--primary)', color: 'white', padding: '8px 20px', borderRadius: '8px', fontWeight: '600', fontSize: '14px' }} onClick={save} disabled={loading}>{loading ? 'Wait...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Video Call Overlay Component ───
function CallOverlay({ peer, wsRef, callType, onEnd, isIncoming, initialRemoteStream }) {
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
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        }
      });
      localStreamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(RTC_CONFIG);
      pcRef.current = pc;
      wsRef.current._pc = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (e) => {
        if (remoteRef.current && e.streams[0]) {
          remoteRef.current.srcObject = e.streams[0];
          setConnected(true);
        }
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          wsRef.current?.send(JSON.stringify({ type: 'ice-candidate', to: peer.id, candidate: e.candidate }));
        }
      };

      if (!isIncoming) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        wsRef.current?.send(JSON.stringify({ type: 'offer', to: peer.id, offer, callType }));
      }
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
  const [token, setToken] = useState(() => localStorage.getItem('m_token'));

  
  const [contacts, setContacts] = useState(() => {
    try { return getSafeJSON('m_contacts', []); } catch { return []; }
  });
  const [activePeer, setActivePeer] = useState(() => {
    try { return getSafeJSON('m_activePeer'); } catch { return null; }
  });

  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const activePeerRef = useRef(null);
  const wsRef = useRef(null);
  useEffect(() => { activePeerRef.current = activePeer; }, [activePeer]);


  useEffect(() => {
    localStorage.setItem('m_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('m_activePeer', JSON.stringify(activePeer));
  }, [activePeer]);

  // Handle refresh: If there's an active peer, load their messages
  useEffect(() => {
    if (user && activePeer && activePeer.id) {
      loadMessages(activePeer.id);
    }
  }, [user]);

  
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [msgInput, setMsgInput] = useState('');
  
  // Mobile UI
  const [view, setView] = useState('list'); // 'list' or 'chat'
  
  const messagesEndRef = useRef(null);
  const searchInputRef = useRef(null);
  const recvSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3'));
  const sentSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'));
  const ringSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/1360/1360-preview.mp3'));

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
    setUser(u); setToken(t);
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
            if (idx === -1) {
              fetch(`${API}/api/user/${otherId}`).then(r => r.json()).then(u => {
                setContacts(p => p.find(x => x.id === u.id) ? p : [u, ...p]);
              }).catch(() => {});
            } else {
              arr[idx] = { 
                ...arr[idx], 
                lastMsg: msg.text, 
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
          }
        }
        // Signaling
        if (data.type === 'call-request') setIncomingCall(data);
        if (data.type === 'call-decline' || data.type === 'call-end') { setActiveCall(null); setIncomingCall(null); }
        if (data.type === 'offer' && ws._pc) {
          await ws._pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const ans = await ws._pc.createAnswer();
          await ws._pc.setLocalDescription(ans);
          ws.send(JSON.stringify({ type: 'answer', to: data.from, answer: ans }));
        }
        if (data.type === 'answer' && ws._pc) await ws._pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        if (data.type === 'ice-candidate' && ws._pc) try { await ws._pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch {}
      } catch (err) { console.error('WS Message Error:', err); }
    };


    return () => ws.close();
  }, [user]); // Removed activePeer dependency to keep WS alive


  // ── Search ──
  useEffect(() => {
    if (!search.trim()) return setSearchResults([]);
    const t = setTimeout(async () => {
      setIsSearching(true);
      const res = await fetch(`${API}/api/users/search?q=${search}&myId=${user.id}`);
      const d = await res.json();
      setSearchResults(d);
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadMessages = async (peerId) => {
    if (!user) return;
    const res = await fetch(`${API}/api/messages/${user.id}/${peerId}`);
    const msgs = await res.json();
    setMessages(msgs);
  };

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
  };

  const send = (e) => {
    e?.preventDefault();
    if (!msgInput.trim()) return;
    wsRef.current.send(JSON.stringify({ type: 'message', from: user.id, to: activePeer.id, text: msgInput }));
    setMsgInput('');
  };

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
            <button className="accept-btn" onClick={() => { setActiveCall({ peer: incomingCall.callerInfo, callType: incomingCall.callType, isIncoming: true }); setIncomingCall(null); }}><Phone /></button>
          </div>
        </div>
      )}

      {activeCall && <CallOverlay peer={activeCall.peer} callType={activeCall.callType} wsRef={wsRef} isIncoming={activeCall.isIncoming} onEnd={() => setActiveCall(null)} />}

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
              {messages.map((m, i) => (
                <div key={m.id} className={`msg-row ${m.from === user.id ? 'out' : 'in'}`}>
                  <div className="msg-bubble">{m.text}<div className="msg-meta">{timeStr(m.timestamp)}</div></div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-bar" onSubmit={send}>
              <div className="msg-input-wrap">
                <textarea placeholder="Message" value={msgInput} rows={1} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
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
