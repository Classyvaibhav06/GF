import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Mic, Phone, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ChatPage.css';

export default function ChatPage() {
  const { characterId } = useParams();
  const navigate = useNavigate(); // added this to imports implicitly via react-router-dom later
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there! How can I help you today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!user && !localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [user, navigate]);

  const startDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsDictating(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onend = () => {
      setIsDictating(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsDictating(false);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsDictating(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    const newMsg = { id: Date.now(), text: userMessage, sender: 'user' };
    setMessages((prev) => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ characterId, message: userMessage })
      });
      
      const data = await res.json();
      
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: Date.now(),
        text: data.data?.response || "Sorry, I didn't get that.",
        sender: 'ai'
      }]);
    } catch (error) {
      setIsTyping(false);
      setMessages((prev) => [...prev, {
        id: Date.now(),
        text: "Error connecting to the backend. Is the server running?",
        sender: 'ai'
      }]);
    }
  };

  return (
    <div className="chat-layout">
      {/* Left Sidebar for Chat History */}
      <aside className="chat-sidebar">
        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>
        <button className="btn-primary new-chat-btn">New Chat</button>
        
        <div className="chat-history">
          <h4 className="history-title">Recent Conversations</h4>
          <div className="history-item active">Current Chat</div>
          <div className="history-item">Yesterday's Chat</div>
          <div className="history-item">Last Week</div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        <header className="chat-header">
          <div className="chat-header-info">
            <img src={user?.avatar && user.avatar !== '/image.png' ? user.avatar : '/image.png'} alt="Avatar" className="header-avatar" style={{objectFit: 'cover'}} />
            <div>
              <h2 style={{ textTransform: 'capitalize' }}>{user?.gfName || characterId}</h2>
              <span className="status-text">Online</span>
            </div>
          </div>
          <div className="chat-header-actions">
            <Link to={`/call/${characterId}`} className="icon-btn" title="Voice Call">
              <Phone size={20} />
            </Link>
          </div>
        </header>

        <div className="chat-messages">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              className={`message-wrapper ${msg.sender === 'user' ? 'user' : 'ai'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {msg.sender === 'ai' && (
                <img src={user?.avatar && user.avatar !== '/image.png' ? user.avatar : '/image.png'} alt="AI" className="message-avatar" style={{objectFit: 'cover'}} />
              )}
              <div className="message-bubble">
                {msg.text}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <div className="message-wrapper ai">
              <img src={user?.avatar && user.avatar !== '/image.png' ? user.avatar : '/image.png'} alt="AI" className="message-avatar" style={{objectFit: 'cover'}} />
              <div className="message-bubble typing-indicator">
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4 }}>.</motion.span>
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }}>.</motion.span>
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }}>.</motion.span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <form className="chat-form" onSubmit={handleSend}>
            <button 
              type="button" 
              className={`icon-btn mic-btn ${isDictating ? 'recording' : ''}`}
              onClick={startDictation}
              title={isDictating ? "Listening..." : "Dictate message"}
            >
              <Mic size={20} color={isDictating ? '#ef4444' : 'currentColor'} />
            </button>
            <input 
              type="text" 
              placeholder={isDictating ? "Listening..." : "Type your message..."} 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="chat-input"
            />
            <button type="submit" className="icon-btn send-btn" disabled={!input.trim()}>
              <Send size={20} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
