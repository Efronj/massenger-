import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, Keyboard, Mic, MicOff, VideoOff, MonitorUp, PhoneOff, 
  Hand, Maximize, Settings, Info, Users, MessageSquare, Plus, X, Send 
} from 'lucide-react';

const mockParticipants = [
  { id: 2, name: 'Sarah Parker', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', isMicOn: false },
  { id: 3, name: 'David Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', isMicOn: true },
  { id: 4, name: 'Emma Watson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', isMicOn: false }
];

function HomeView({ onJoin }) {
  const [meetingCode, setMeetingCode] = useState('');

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="home-logo">
          <Video color="#1a73e8" size={32} />
          <span>Google</span> Meet Clone
        </div>
        <div className="home-header-right">
          <div>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          <Settings size={20} cursor="pointer" />
        </div>
      </div>

      <div className="home-content">
        <div className="home-left">
          <h1 className="home-title">Premium video meetings. Now free for everyone.</h1>
          <p className="home-subtitle">We re-engineered the service we built for secure business meetings, Google Meet, to make it free and available for all.</p>
          
          <div className="home-actions">
            <button className="btn-primary" onClick={() => onJoin('new')}>
              <Video size={20} />
              New meeting
            </button>
            <div className="join-input-wrapper">
              <Keyboard size={20} color="#5f6368" />
              <input 
                type="text" 
                placeholder="Enter a code or link" 
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
              />
            </div>
            {meetingCode && (
              <button 
                className="join-btn"
                onClick={() => onJoin(meetingCode)}
              >
                Join
              </button>
            )}
          </div>
        </div>

        <div className="home-right">
          <div className="preview-carousel">
            <img src="https://www.gstatic.com/meet/user_edu_get_a_link_light_90698cd7b4ca04d3005c962a3756c42d.svg" alt="Preview illustration" />
            <h3>Get a link you can share</h3>
            <p>Click <strong>New meeting</strong> to get a link you can send to people you want to meet with</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MeetingView({ onLeave }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'You', time: '10:00 AM', text: 'Hey everyone!' },
    { id: 2, sender: 'David Chen', time: '10:01 AM', text: 'Hi! Can you hear me?' }
  ]);
  
  const [timeStr, setTimeStr] = useState('');
  const localVideoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const updateTime = () => setTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    
    // Start camera stream
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied or unavailable", err);
      }
    }
    startCamera();

    return () => {
      clearInterval(timer);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => t.enabled = isMuted);
    }
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => t.enabled = isVideoOff);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'You',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: chatMessage
    }]);
    setChatMessage('');
  };

  return (
    <div className="meeting-container">
      <div className="meeting-main">
        {/* Main Video Grid */}
        <div className="video-grid">
          {/* Local User */}
          <div className="video-card you">
            <video ref={localVideoRef} autoPlay playsInline muted style={{ opacity: isVideoOff ? 0 : 1 }} />
            {isVideoOff && (
              <div className="video-placeholder" style={{ position: 'absolute', top: 0, left: 0 }}>
                <div className="avatar-lg" style={{ backgroundImage: 'url(https://api.dicebear.com/7.x/avataaars/svg?seed=You)' }}></div>
              </div>
            )}
            <div className="participant-name">
              {isMuted && <div className="participant-mic-off"><MicOff size={12} color="white" /></div>}
              You {isHandRaised && '✋'}
            </div>
          </div>

          {/* Remote Users */}
          {mockParticipants.map((p) => (
            <div key={p.id} className="video-card">
              <div className="video-placeholder">
                <div className="avatar-lg" style={{ backgroundImage: `url(${p.avatar})` }}></div>
              </div>
              <div className="participant-name">
                {!p.isMicOn && <div className="participant-mic-off"><MicOff size={12} color="white" /></div>}
                {p.name}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        {showChat && (
          <div className="right-sidebar">
            <div className="sidebar-header">
              <div className="sidebar-title">In-call messages</div>
              <button onClick={() => setShowChat(false)}><X size={20} color="#5f6368" /></button>
            </div>
            
            <div className="chat-messages">
              <div style={{ fontSize: '13px', backgroundColor: '#f1f3f4', padding: '12px', borderRadius: '8px', color: '#5f6368', textAlign: 'center', marginBottom: '8px' }}>
                Messages can only be seen by people in the call and are deleted when the call ends.
              </div>
              {messages.map(msg => (
                <div key={msg.id} className="chat-message">
                  <div className="sender">
                    {msg.sender} <span className="time">{msg.time}</span>
                  </div>
                  <div className="text">{msg.text}</div>
                </div>
              ))}
            </div>

            <form className="chat-input-container" onSubmit={handleSendChat}>
              <div className="chat-input">
                <input 
                  type="text" 
                  placeholder="Send a message to everyone" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <button type="submit" disabled={!chatMessage.trim()} style={{ color: chatMessage.trim() ? '#1a73e8' : '#9aa0a6' }}>
                  <Send size={18} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="meeting-controls-bar">
        <div className="meeting-info">
          <div className="meeting-time">{timeStr}</div>
          <div className="meeting-id">abc-defg-hij</div>
        </div>

        <div className="main-controls">
          <button className={`control-btn ${isMuted ? 'active' : ''}`} onClick={toggleMute}>
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button className={`control-btn ${isVideoOff ? 'active' : ''}`} onClick={toggleVideo}>
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>
          <button className={`control-btn ${isHandRaised ? 'active' : ''}`} style={isHandRaised ? { backgroundColor: '#8ab4f8', color: '#202124' } : {}} onClick={() => setIsHandRaised(!isHandRaised)}>
            <Hand size={20} />
          </button>
          <button className="control-btn">
            <MonitorUp size={20} />
          </button>
          <button className="control-btn">
            <MoreVertical size={20} />
          </button>
          <button className="control-btn leave-btn" onClick={onLeave}>
            <PhoneOff size={20} />
          </button>
        </div>

        <div className="side-controls">
          <button className="side-control-btn"><Info size={24} /></button>
          <button className="side-control-btn"><Users size={24} /><div className="badge">4</div></button>
          <button className="side-control-btn" onClick={() => setShowChat(!showChat)} style={{ color: showChat ? '#8ab4f8' : 'white' }}>
            <MessageSquare size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Temporary MoreVertical icon mock since it's missing in import
function MoreVertical({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="12" cy="5" r="1"></circle>
      <circle cx="12" cy="19" r="1"></circle>
    </svg>
  );
}

function App() {
  const [inMeeting, setInMeeting] = useState(false);

  return (
    <>
      {inMeeting ? (
        <MeetingView onLeave={() => setInMeeting(false)} />
      ) : (
        <HomeView onJoin={() => setInMeeting(true)} />
      )}
    </>
  );
}

export default App;
