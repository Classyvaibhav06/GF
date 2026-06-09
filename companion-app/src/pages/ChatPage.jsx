import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Mic, Phone, ArrowLeft, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function ChatPage() {
  const { characterId } = useParams();
  const navigate = useNavigate();
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

    recognition.onstart = () => setIsDictating(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onend = () => setIsDictating(false);

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

  const avatarSrc = user?.avatar && user.avatar !== '/image.png' ? user.avatar : '/image.png';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Left Sidebar for Chat History */}
      <aside className="hidden md:flex flex-col w-72 bg-card border-r">
        <div className="p-4 border-b">
          <Link to="/dashboard">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          <Button className="w-full justify-start">
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Recent Conversations</h4>
          <div className="space-y-1">
            <Button variant="secondary" className="w-full justify-start font-normal">Current Chat</Button>
            <Button variant="ghost" className="w-full justify-start font-normal text-muted-foreground">Yesterday's Chat</Button>
            <Button variant="ghost" className="w-full justify-start font-normal text-muted-foreground">Last Week</Button>
          </div>
        </ScrollArea>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b bg-card">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="md:hidden">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Avatar className="h-10 w-10 border border-primary/20">
              <AvatarImage src={avatarSrc} className="object-cover" />
              <AvatarFallback>{(user?.gfName || characterId || 'A')[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold capitalize text-foreground">{user?.gfName || characterId}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
              </p>
            </div>
          </div>
          <div>
            <Link to={`/call/${characterId}`}>
              <Button variant="ghost" size="icon" className="text-primary hover:text-primary hover:bg-primary/10">
                <Phone className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </header>

        <ScrollArea className="flex-1 p-4 sm:p-6 bg-muted/30">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <motion.div 
                key={msg.id} 
                className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {msg.sender === 'ai' && (
                  <Avatar className="h-8 w-8 border border-primary/20 shrink-0 mt-1">
                    <AvatarImage src={avatarSrc} className="object-cover" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={`px-4 py-2.5 rounded-2xl max-w-[85%] sm:max-w-[75%] ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-card border shadow-sm rounded-tl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <div className="flex gap-4 justify-start">
                <Avatar className="h-8 w-8 border border-primary/20 shrink-0 mt-1">
                  <AvatarImage src={avatarSrc} className="object-cover" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="px-4 py-3.5 rounded-2xl bg-card border shadow-sm rounded-tl-sm flex items-center gap-1">
                  <motion.div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4 }} />
                  <motion.div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} />
                  <motion.div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 bg-card border-t">
          <form className="max-w-3xl mx-auto relative flex items-center" onSubmit={handleSend}>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              className={`absolute left-1 ${isDictating ? 'text-destructive hover:text-destructive' : 'text-muted-foreground'}`}
              onClick={startDictation}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Input 
              type="text" 
              placeholder={isDictating ? "Listening..." : "Type your message..."} 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pl-12 pr-12 py-6 rounded-full bg-muted/50 border-transparent focus-visible:ring-primary focus-visible:bg-background"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim()}
              className="absolute right-1.5 rounded-full h-9 w-9"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
