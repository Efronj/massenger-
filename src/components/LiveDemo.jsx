import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, User } from 'lucide-react';
import { sendMessageToGemini } from '../services/gemini';

export function LiveDemo() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Try me out! Type something below and see the Efronix speed." }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
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
        <div className="glass-card demo-wrapper">
            <div className="demo-header">
                <div className="status-indicator">
                    <div className="status-dot" />
                    <span>Live Neural Demo</span>
                </div>
            </div>

            <div className="demo-messages">
                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`demo-row ${msg.role === 'user' ? 'user-row' : ''}`}
                    >
                        <div className={`demo-avatar ${msg.role === 'assistant' ? 'asst-avatar' : 'usr-avatar'}`}>
                            {msg.role === 'assistant' ? <MessageSquare size={16} /> : <User size={16} />}
                        </div>
                        <div className={`demo-bubble ${msg.role === 'assistant' ? 'asst-bubble' : 'usr-bubble'}`}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <div className="demo-row">
                        <div className="demo-avatar asst-avatar">
                            <MessageSquare size={16} />
                        </div>
                        <div className="demo-bubble asst-bubble typing-dots">
                            <div className="dot" />
                            <div className="dot" style={{ animationDelay: '0.2s' }} />
                            <div className="dot" style={{ animationDelay: '0.4s' }} />
                        </div>
                    </div>
                )}
            </div>

            <div className="demo-input-area">
                <div className="input-container">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask Efronix anything..."
                    />
                    <button
                        onClick={handleSend}
                        className={`btn send-btn ${input.trim() ? 'active' : ''}`}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
            <style>{`
        .demo-wrapper {
          display: flex;
          flex-direction: column;
          height: 500px;
          overflow: hidden;
        }
        .demo-header {
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(255, 255, 255, 0.02);
        }
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .status-dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 9999px;
          background: #10B981;
          animation: pulse-dot 1s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .status-indicator span {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
        }
        .demo-messages {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .demo-row { display: flex; gap: 0.75rem; }
        .user-row { flex-direction: row-reverse; }
        .demo-avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .asst-avatar { background: rgba(168, 85, 247, 0.2); color: var(--primary); }
        .usr-avatar { background: rgba(255, 255, 255, 0.1); color: white; }
        .demo-bubble {
          max-width: 80%;
          border-radius: 1rem;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        .asst-bubble {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
        }
        .usr-bubble {
          background: rgba(168, 85, 247, 0.2);
          border: 1px solid rgba(168, 85, 247, 0.2);
          color: white;
        }
        .typing-dots { display: flex; gap: 0.25rem; align-items: center; }
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
        .demo-input-area {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .input-container { position: relative; }
        .input-container input {
          width: 100%;
          background: var(--background);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          padding: 0.75rem 3rem 0.75rem 1rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
          transition: all 0.2s;
        }
        .input-container input:focus { border-color: var(--primary); }
        .send-btn {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          padding: 0.5rem;
          border-radius: 0.5rem;
          color: rgba(255, 255, 255, 0.2);
          transition: color 0.2s;
        }
        .send-btn.active { color: var(--primary); }
      `}</style>
        </div>
    );
}
