import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Search, Phone, Video, MoreVertical, Mic, MicOff,
  VideoOff, Video as VideoIcon, MonitorUp, PhoneOff, Send, X, LogOut,
  PhoneIncoming, Check, CheckCheck, Loader
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4000';


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
function avatarStyle(url, color) {
  return url
    ? { backgroundImage: `url(${url})` }
    : { backgroundColor: color || '#00a884' };
}

// Stable avatar color from name
const colors = ['#00a884','#1877f2','#e53935','#7b1fa2','#f57c00','#00838f'];
function colorFor(name) { return colors[(name?.charCodeAt(0) || 0) % colors.length]; }

// ─── WebRTC config ───────────────────────────────────────────────────────────
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

// ════════════════════════════════════════════════════════════════════════════
//  AUTH SCREEN
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
          <div className="auth-logo-icon">
            <MessageSquare size={28} color="white" />
          </div>
          <h1>Massenger</h1>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Sign In</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Create Account</button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={submit}>
          {tab === 'register' && (
            <div className="auth-field">
              <label>Display Name</label>
              <input placeholder="Your name" value={form.displayName} onChange={e => set('displayName', e.target.value)} />
            </div>
          )}
          <div className="auth-field">
            <label>Username</label>
            <input placeholder="e.g. john_doe" value={form.username} onChange={e => set('username', e.target.value)} required />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  VIDEO CALL OVERLAY
// ════════════════════════════════════════════════════════════════════════════
function CallOverlay({ me, peer, wsRef, callType, onEnd, isIncoming, remoteStream }) {
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(callType === 'audio');
  const [sharing, setSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connected, setConnected] = useState(false);
  const timerRef = useRef(null);

  // Stream remote video whenever remoteStream changes
  useEffect(() => {
    if (remoteRef.current && remoteStream) {
      remoteRef.current.srcObject = remoteStream;
      setConnected(true);
    }
  }, [remoteStream]);

  // Setup local stream + PeerConnection
  useEffect(() => {
    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: callType === 'video',
          audio: true
        });
        localStreamRef.current = stream;
        if (localRef.current) localRef.current.srcObject = stream;

        const pc = new RTCPeerConnection(RTC_CONFIG);
        pcRef.current = pc;

        stream.getTracks().forEach(t => pc.addTrack(t, stream));

        pc.ontrack = (e) => {
          if (remoteRef.current && e.streams[0]) {
            remoteRef.current.srcObject = e.streams[0];
            setConnected(true);
          }
        };

        pc.onicecandidate = (e) => {
          if (e.candidate && wsRef.current?.readyState === 1) {
            wsRef.current.send(JSON.stringify({
              type: 'ice-candidate',
              to: peer.id,
              candidate: e.candidate
            }));
          }
        };

        if (!isIncoming) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          wsRef.current?.send(JSON.stringify({ type: 'offer', to: peer.id, offer, callType }));
        }

        // Expose pc to external answer/ice events
        wsRef.current._pc = pc;
      } catch (err) {
        console.error('Media error:', err);
      }
    }
    init();

    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      pcRef.current?.close();
      clearInterval(timerRef.current);
      delete wsRef.current?._pc;
    };
  }, []);

  // Duration timer
  useEffect(() => {
    if (connected) {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [connected]);

  const durationStr = () => {
    const m = String(Math.floor(callDuration / 60)).padStart(2, '0');
    const s = String(callDuration % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleMute = () => {
    setMuted(m => {
      localStreamRef.current?.getAudioTracks().forEach(t => t.enabled = m);
      return !m;
    });
  };

  const toggleVideo = () => {
    setVideoOff(v => {
      localStreamRef.current?.getVideoTracks().forEach(t => t.enabled = v);
      return !v;
    });
  };

  const toggleScreen = async () => {
    if (sharing) {
      // Revert to camera
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const track = camStream.getVideoTracks()[0];
      const sender = pcRef.current?.getSenders().find(s => s.track?.kind === 'video');
      sender?.replaceTrack(track);
      if (localRef.current) localRef.current.srcObject = camStream;
      setSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const track = screenStream.getVideoTracks()[0];
        const sender = pcRef.current?.getSenders().find(s => s.track?.kind === 'video');
        sender?.replaceTrack(track);
        if (localRef.current) localRef.current.srcObject = screenStream;
        track.onended = () => toggleScreen();
        setSharing(true);
      } catch (err) {
        console.error('Screen share denied', err);
      }
    }
  };

  const endCall = () => {
    wsRef.current?.send(JSON.stringify({ type: 'call-end', to: peer.id }));
    onEnd();
  };

  return (
    <div className="call-overlay">
      <div className="call-stage">
        {/* Remote Video */}
        <div className="remote-video">
          <video ref={remoteRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', display: connected ? 'block' : 'none' }} />
          {!connected && (
            <div className="remote-placeholder">
              <div className="big-avatar" style={{ backgroundImage: `url(${peer.avatar})`, backgroundColor: colorFor(peer.displayName) }} />
              <h3>{peer.displayName}</h3>
              <p>{isIncoming ? 'Connecting…' : 'Ringing…'}</p>
            </div>
          )}
        </div>

        {/* Call Info */}
        <div className="call-info-bar">
          <h2>{peer.displayName}</h2>
          <p>{connected ? durationStr() : (isIncoming ? 'Connecting…' : 'Calling…')}</p>
        </div>

        {/* Local PiP */}
        {callType === 'video' && (
          <div className="local-video-pip">
            <video ref={localRef} autoPlay playsInline muted style={{ display: videoOff ? 'none' : 'block' }} />
            {videoOff && <div className="pip-off">🎥</div>}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="call-controls-bar">
        <button className="cc-btn" onClick={toggleMute}>
          <div className={`cc-btn-circle ${muted ? 'muted' : ''}`}>
            {muted ? <MicOff size={22} /> : <Mic size={22} />}
          </div>
          <span>{muted ? 'Unmute' : 'Mute'}</span>
        </button>

        {callType === 'video' && (
          <button className="cc-btn" onClick={toggleVideo}>
            <div className={`cc-btn-circle ${videoOff ? 'muted' : ''}`}>
              {videoOff ? <VideoOff size={22} /> : <VideoIcon size={22} />}
            </div>
            <span>{videoOff ? 'Start Video' : 'Stop Video'}</span>
          </button>
        )}

        {callType === 'video' && (
          <button className="cc-btn" onClick={toggleScreen}>
            <div className={`cc-btn-circle ${sharing ? 'muted' : ''}`}>
              <MonitorUp size={22} />
            </div>
            <span>{sharing ? 'Stop Share' : 'Share Screen'}</span>
          </button>
        )}

        <button className="cc-btn" onClick={endCall}>
          <div className="cc-btn-circle end"><PhoneOff size={22} /></div>
          <span>End</span>
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════════════════════════════════════
function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('massenger_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('massenger_token'));

  // Chat state
  const [contacts, setContacts] = useState([]); // recent chats
  const [activePeer, setActivePeer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Call state
  const [activeCall, setActiveCall] = useState(null); // { peer, callType, isIncoming }
  const [incomingCall, setIncomingCall] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollBottom(); }, [messages]);

  // ── Auth handlers ──
  const handleAuth = (u, t) => {
    setUser(u); setToken(t);
    localStorage.setItem('massenger_user', JSON.stringify(u));
    localStorage.setItem('massenger_token', t);
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('massenger_user');
    localStorage.removeItem('massenger_token');
    wsRef.current?.close();
  };

  // ── WebSocket setup ──
  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'register', userId: user.id }));
    };

    ws.onmessage = async (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'presence') {
        setOnlineUsers(prev => {
          const next = new Set(prev);
          data.isOnline ? next.add(data.userId) : next.delete(data.userId);
          return next;
        });
      }

      if (data.type === 'message') {
        const msg = data.msg;
        setMessages(prev => {
          // Only add if it's in the current conversation
          if (prev.length === 0) return prev;
          const firstMsg = prev[0];
          const isPart = (firstMsg.from === msg.from && firstMsg.to === msg.to) ||
                         (firstMsg.from === msg.to && firstMsg.to === msg.from);
          if (isPart) return [...prev, msg];
          return prev;
        });
        // Update contacts preview
        setContacts(prev => {
          const updated = [...prev];
          const idx = updated.findIndex(c => c.id === msg.from);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], lastMsg: msg.text, lastTime: msg.timestamp };
          }
          return updated;
        });
      }

      if (data.type === 'message_sent') {
        const msg = data.msg;
        setMessages(prev => [...prev, msg]);
        setContacts(prev => {
          const updated = [...prev];
          const idx = updated.findIndex(c => c.id === msg.to);
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], lastMsg: msg.text, lastTime: msg.timestamp };
          }
          return updated;
        });
      }

      // ── WebRTC signaling ──
      if (data.type === 'call-request') {
        setIncomingCall({ peer: data.callerInfo, callType: data.callType });
      }

      if (data.type === 'call-decline') {
        setActiveCall(null);
      }

      if (data.type === 'offer') {
        // We received an offer — we are answering
        if (ws._pc) {
          await ws._pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await ws._pc.createAnswer();
          await ws._pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ type: 'answer', to: data.from, answer }));
        }
      }

      if (data.type === 'answer') {
        if (ws._pc) {
          await ws._pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
      }

      if (data.type === 'ice-candidate') {
        if (ws._pc) {
          try { await ws._pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch {}
        }
      }

      if (data.type === 'call-end') {
        setActiveCall(null);
        setIncomingCall(null);
      }
    };

    ws.onerror = () => console.error('WS error');
    ws.onclose = () => console.log('WS closed');

    return () => ws.close();
  }, [user]);

  // ── Search ──
  useEffect(() => {
    if (!searchQuery.trim() || !user) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${API}/api/users/search?q=${encodeURIComponent(searchQuery)}&myId=${user.id}`);
        const data = await res.json();
        setSearchResults(data);
      } finally {
        setIsSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, user]);

  // ── Load messages when chat changes ──
  const openChat = async (peer) => {
    setActivePeer(peer);
    setSearchQuery('');
    setSearchResults([]);
    // Add to contacts if not already there
    setContacts(prev => {
      if (prev.find(c => c.id === peer.id)) return prev;
      return [peer, ...prev];
    });
    // Fetch history
    const res = await fetch(`${API}/api/messages/${user.id}/${peer.id}`);
    const data = await res.json();
    setMessages(data);
  };

  // ── Send message ──
  const sendMsg = (e) => {
    e?.preventDefault();
    if (!msgInput.trim() || !activePeer || !wsRef.current) return;
    wsRef.current.send(JSON.stringify({
      type: 'message',
      from: user.id,
      to: activePeer.id,
      text: msgInput.trim()
    }));
    setMsgInput('');
    inputRef.current?.focus();
  };

  // ── Start call ──
  const startCall = (type) => {
    if (!activePeer) return;
    wsRef.current?.send(JSON.stringify({
      type: 'call-request',
      to: activePeer.id,
      callerInfo: { id: user.id, displayName: user.displayName, avatar: user.avatar },
      callType: type
    }));
    setActiveCall({ peer: activePeer, callType: type, isIncoming: false });
  };

  // ── Accept / Reject incoming call ──
  const acceptCall = () => {
    setActiveCall({ peer: incomingCall.peer, callType: incomingCall.callType, isIncoming: true });
    setIncomingCall(null);
  };

  const rejectCall = () => {
    wsRef.current?.send(JSON.stringify({ type: 'call-decline', to: incomingCall.peer.id }));
    setIncomingCall(null);
  };

  // ── Group messages by date ──
  const groupedMessages = messages.reduce((acc, msg) => {
    const key = dateStr(msg.timestamp);
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  if (!user) return <AuthScreen onAuth={handleAuth} />;

  return (
    <div className="app-layout">
      {/* ── Incoming Call Modal ── */}
      {incomingCall && (
        <div className="incoming-call-modal">
          <div className="avatar-img" style={{ width: 48, height: 48, fontSize: 18, backgroundImage: `url(${incomingCall.peer.avatar})`, backgroundColor: colorFor(incomingCall.peer.displayName) }}>
            {!incomingCall.peer.avatar && getInitial(incomingCall.peer.displayName)}
          </div>
          <div className="incoming-info">
            <h3>{incomingCall.peer.displayName}</h3>
            <p>Incoming {incomingCall.callType} call…</p>
          </div>
          <div className="incoming-actions">
            <button className="reject-btn" onClick={rejectCall}><PhoneOff size={18} /></button>
            <button className="accept-btn" onClick={acceptCall}>
              {incomingCall.callType === 'video' ? <VideoIcon size={18} /> : <Phone size={18} />}
            </button>
          </div>
        </div>
      )}

      {/* ── Active Call Overlay ── */}
      {activeCall && (
        <CallOverlay
          me={user}
          peer={activeCall.peer}
          wsRef={wsRef}
          callType={activeCall.callType}
          isIncoming={activeCall.isIncoming}
          remoteStream={remoteStream}
          onEnd={() => setActiveCall(null)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <div className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-top-user">
            <div className="avatar-img" style={{ width: 38, height: 38, fontSize: 16, backgroundImage: `url(${user.avatar})`, backgroundColor: colorFor(user.displayName) }}>
              {!user.avatar && getInitial(user.displayName)}
            </div>
            <span style={{ fontWeight: 600, fontSize: 16 }}>{user.displayName}</span>
          </div>
          <div className="sidebar-top-actions">
            <button className="icon-btn" title="Logout" onClick={logout}><LogOut size={18} /></button>
          </div>
        </div>

        {/* Search */}
        <div className="search-bar">
          <div className="search-inner">
            {isSearching ? <Loader size={16} color="var(--text-muted)" style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={16} color="var(--text-muted)" />}
            <input
              placeholder="Search by username…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && <button onClick={() => setSearchQuery('')}><X size={14} color="var(--text-muted)" /></button>}
          </div>
        </div>

        <div className="contact-list">
          {/* Search Results */}
          {searchQuery && (
            <>
              <div className="search-results-section">People</div>
              {searchResults.length === 0 && !isSearching && <div className="no-results">No users found</div>}
              {searchResults.map(u => (
                <div key={u.id} className={`contact-item ${activePeer?.id === u.id ? 'active' : ''}`} onClick={() => openChat(u)}>
                  <div className="contact-avatar">
                    <div className="avatar-img" style={{ backgroundImage: `url(${u.avatar})`, backgroundColor: colorFor(u.displayName) }}>
                      {!u.avatar && getInitial(u.displayName)}
                    </div>
                    {onlineUsers.has(u.id) && <div className="online-dot" />}
                  </div>
                  <div className="contact-info">
                    <div className="contact-row1">
                      <div className="contact-name">{u.displayName}</div>
                    </div>
                    <div className="contact-preview">@{u.username}</div>
                  </div>
                </div>
              ))}
              <div className="search-results-section" style={{ marginTop: 8 }}>Recent</div>
            </>
          )}

          {/* Recent Chats */}
          {contacts.length === 0 && !searchQuery && (
            <div className="no-results" style={{ marginTop: 40 }}>
              <Search size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              Search for a username to start chatting
            </div>
          )}
          {contacts.map(c => (
            <div key={c.id} className={`contact-item ${activePeer?.id === c.id ? 'active' : ''}`} onClick={() => openChat(c)}>
              <div className="contact-avatar">
                <div className="avatar-img" style={{ backgroundImage: `url(${c.avatar})`, backgroundColor: colorFor(c.displayName) }}>
                  {!c.avatar && getInitial(c.displayName)}
                </div>
                {onlineUsers.has(c.id) && <div className="online-dot" />}
              </div>
              <div className="contact-info">
                <div className="contact-row1">
                  <div className="contact-name">{c.displayName}</div>
                  {c.lastTime && <div className="contact-time">{timeStr(c.lastTime)}</div>}
                </div>
                <div className="contact-preview">{c.lastMsg || `@${c.username}`}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHAT AREA ── */}
      {activePeer ? (
        <div className="chat-area">
          <div className="chat-bg" />

          {/* Chat Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="contact-avatar">
                <div className="avatar-img" style={{ width: 40, height: 40, backgroundImage: `url(${activePeer.avatar})`, backgroundColor: colorFor(activePeer.displayName) }}>
                  {!activePeer.avatar && getInitial(activePeer.displayName)}
                </div>
                {onlineUsers.has(activePeer.id) && <div className="online-dot" />}
              </div>
              <div>
                <div className="chat-header-name">{activePeer.displayName}</div>
                <div className="chat-header-status">
                  {onlineUsers.has(activePeer.id) ? 'Online' : '@' + activePeer.username}
                </div>
              </div>
            </div>
            <div className="chat-header-actions">
              <button className="icon-btn green" title="Voice Call" onClick={() => startCall('audio')}><Phone size={20} /></button>
              <button className="icon-btn green" title="Video Call" onClick={() => startCall('video')}><Video size={20} /></button>
              <button className="icon-btn" title="Screen Share" onClick={() => startCall('video')}><MonitorUp size={20} /></button>
              <button className="icon-btn"><MoreVertical size={20} /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-scroll">
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <div className="msg-date-divider"><span>{date}</span></div>
                {msgs.map((msg, i) => {
                  const isMe = msg.from === user.id;
                  const showAvatar = !isMe && (i === 0 || msgs[i - 1].from !== msg.from);
                  return (
                    <div key={msg.id} className={`msg-row ${isMe ? 'out' : 'in'}`}>
                      <div className="msg-bubble">
                        {msg.text}
                        <div className="msg-meta">{timeStr(msg.timestamp)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="chat-input-bar" onSubmit={sendMsg}>
            <div className="msg-input-wrap">
              <textarea
                ref={inputRef}
                placeholder="Type a message"
                value={msgInput}
                rows={1}
                onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
                }}
              />
            </div>
            <button type="submit" className="send-btn" disabled={!msgInput.trim()}>
              <Send size={20} />
            </button>
          </form>
        </div>
      ) : (
        <div className="chat-area">
          <div className="chat-bg" />
          <div className="empty-chat">
            <div className="empty-chat-icon">
              <MessageSquare size={52} color="var(--primary)" />
            </div>
            <h2>Massenger</h2>
            <p>Search for a username to start a conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
