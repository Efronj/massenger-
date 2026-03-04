import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    Send,
    Plus,
    Search,
    Settings,
    User,
    Paperclip,
    Mic
} from 'lucide-react';
import { sendMessageToGemini } from '../services/gemini';

const history = [
    "Efronix Integration Guide",
    "UI Design Feedback",
    "React Component Optimization",
    "Quantum Computing Basics"
];

export function Chat() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm Efronix Intelligence. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        const response = await sendMessageToGemini(input, messages);

        setIsTyping(false);
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: response
        }]);
    };

    return (
        <div className="chat-page">
            {/* Sidebar */}
            <aside className="chat-sidebar">
                <div className="sidebar-top">
                    <button className="btn new-chat-btn">
                        <Plus size={18} />
                        <span>New Chat</span>
                    </button>
                </div>

                <div className="history-section">
                    <div className="section-label">Recent History</div>
                    <div className="history-list">
                        {history.map((item, idx) => (
                            <button key={idx} className="history-item">
                                <MessageSquare size={16} />
                                <span className="truncate">{item}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="sidebar-bottom">
                    <div className="user-profile">
                        <div className="profile-avatar">E</div>
                        <div className="profile-info">
                            <div className="profile-name">Efron User</div>
                            <div className="profile-tier">Pro Plan</div>
                        </div>
                    </div>
                    <button className="settings-btn">
                        <Settings size={20} />
                    </button>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="chat-main">
                <div className="chat-header">
                    <div className="model-selector">
                        <div className="selector-btn active">Efronix v2.0</div>
                        <div className="selector-btn">Research</div>
                    </div>
                </div>

                <div className="messages-container">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message-row ${msg.role}`}>
                            <div className="msg-wrapper container">
                                <div className={`msg-avatar ${msg.role}`}>
                                    {msg.role === 'assistant' ? <MessageSquare size={20} /> : <User size={20} />}
                                </div>
                                <div className="msg-content">
                                    <div className="msg-sender">{msg.role === 'assistant' ? 'Efronix' : 'You'}</div>
                                    <div className="msg-text">{msg.content}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="message-row assistant">
                            <div className="msg-wrapper container">
                                <div className="msg-avatar assistant">
                                    <MessageSquare size={20} />
                                </div>
                                <div className="msg-content">
                                    <div className="msg-sender">Efronix</div>
                                    <div className="typing-dots">
                                        <div className="dot" />
                                        <div className="dot" style={{ animationDelay: '0.2s' }} />
                                        <div className="dot" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="input-area">
                    <div className="container">
                        <div className="interaction-box">
                            <button className="icon-btn">
                                <Paperclip size={20} />
                            </button>
                            <textarea
                                rows="1"
                                placeholder="Message Efronix Intelligence..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                            />
                            <div className="btn-group">
                                <button className="icon-btn">
                                    <Mic size={20} />
                                </button>
                                <button
                                    className={`btn send-btn ${input.trim() ? 'active' : ''}`}
                                    onClick={handleSend}
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="disclaimer">
                            Efronix can make mistakes. Check important info.
                        </div>
                    </div>
                </div>
            </main>
            <style>{`
        .chat-page {
          display: flex;
          height: calc(100vh - var(--nav-height));
          background: var(--background);
        }
        .chat-sidebar {
          width: 260px;
          background: rgba(0, 0, 0, 0.2);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 1rem;
        }
        @media (max-width: 768px) { .chat-sidebar { display: none; } }
        .new-chat-btn {
          width: 100%;
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
          font-weight: 500;
          transition: background 0.2s;
        }
        .new-chat-btn:hover { background: rgba(255, 255, 255, 0.05); }
        .history-section { flex: 1; margin-top: 2rem; overflow-y: auto; }
        .section-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 1rem;
          padding: 0 0.5rem;
        }
        .history-item {
          width: 100%;
          padding: 0.75rem 0.5rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          transition: all 0.2s;
          text-align: left;
        }
        .history-item:hover { background: rgba(255, 255, 255, 0.05); color: white; }
        .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sidebar-bottom {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .user-profile { display: flex; align-items: center; gap: 0.75rem; }
        .profile-avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 9999px;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .profile-name { font-size: 0.875rem; font-weight: 500; }
        .profile-tier { font-size: 0.75rem; color: var(--primary); }
        .settings-btn { color: rgba(255, 255, 255, 0.4); }
        .settings-btn:hover { color: white; }

        .chat-main { flex: 1; display: flex; flex-direction: column; position: relative; }
        .chat-header {
          padding: 1rem;
          display: flex;
          justify-content: center;
          border-bottom: 1px solid var(--border);
        }
        .model-selector {
          background: rgba(255, 255, 255, 0.05);
          padding: 0.25rem;
          border-radius: 0.75rem;
          display: flex;
          gap: 0.25rem;
        }
        .selector-btn {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
        }
        .selector-btn.active { background: rgba(255, 255, 255, 0.1); color: white; }
        .messages-container { flex: 1; overflow-y: auto; }
        .message-row { padding: 2rem 1.5rem; }
        .message-row.assistant { background: rgba(255, 255, 255, 0.02); }
        .msg-wrapper { max-width: 48rem; display: flex; gap: 1.5rem; margin: 0 auto; }
        .msg-avatar {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .msg-avatar.assistant { background: rgba(168, 85, 247, 0.2); color: var(--primary); }
        .msg-avatar.user { background: rgba(255, 255, 255, 0.1); color: white; }
        .msg-sender { font-size: 0.75rem; font-weight: 700; color: rgba(255, 255, 255, 0.4); margin-bottom: 0.5rem; }
        .msg-text { font-size: 1rem; line-height: 1.6; color: rgba(255, 255, 255, 0.9); }
        .typing-dots { display: flex; gap: 0.25rem; align-items: center; margin-top: 0.5rem; }
        .typing-dots .dot {
          width: 0.25rem;
          height: 0.25rem;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.4);
          animation: bounce 0.6s infinite alternate;
        }
        @keyframes bounce {
          to { transform: translateY(-0.25rem); }
        }
        .input-area { padding: 2rem 1.5rem; }
        .interaction-box {
          max-width: 48rem;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 1.5rem;
          padding: 0.5rem 1rem;
          display: flex;
          align-items: flex-end;
          gap: 0.75rem;
        }
        .interaction-box textarea {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          padding: 0.75rem 0;
          font-family: inherit;
          font-size: 1rem;
          outline: none;
          resize: none;
          max-height: 200px;
        }
        .btn-group { display: flex; gap: 0.5rem; padding-bottom: 0.25rem; }
        .icon-btn { color: rgba(255, 255, 255, 0.4); padding: 0.5rem; border-radius: 9999px; }
        .icon-btn:hover { background: rgba(255, 255, 255, 0.05); color: white; }
        .send-btn { 
          background: rgba(255, 255, 255, 0.1); 
          color: rgba(0, 0, 0, 0.5); 
          padding: 0.5rem; 
          border-radius: 0.75rem; 
          transition: all 0.2s;
        }
        .send-btn.active { background: var(--primary); color: white; }
        .disclaimer { text-align: center; font-size: 0.75rem; color: rgba(255, 255, 255, 0.4); margin-top: 1rem; }
      `}</style>
        </div>
    );
}
