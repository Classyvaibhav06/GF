import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Volume2, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function VoiceCallPage() {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('Connecting...');
  const [transcript, setTranscript] = useState('');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (!user && !localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [user, navigate]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.getVoices();
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        setIsListening(true);
        setStatusText('Listening...');
      };

      mediaRecorder.onstop = async () => {
        setIsListening(false);
        setStatusText('Transcribing audio...');
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        stream.getTracks().forEach(track => track.stop());

        if (audioChunksRef.current.length === 0) {
           setStatusText('No audio detected. Tap mic to try again.');
           return;
        }

        try {
          const response = await fetch('/api/chat/transcribe', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ audio: await blobToBase64(audioBlob) })
          });
          
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          
          const data = await response.json();
          
          if (data.transcript && data.transcript.trim()) {
            setTranscript(data.transcript);
            handleSendMessage(data.transcript);
          } else {
            setStatusText('Could not understand. Tap mic to try again.');
          }
        } catch (error) {
          console.error('Transcription error:', error);
          setStatusText('Failed to transcribe. Please try again.');
        }
      };

      mediaRecorder.start();

    } catch (err) {
      console.error("Mic access denied", err);
      setStatusText('Mic access denied. Please allow in browser settings.');
    }
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  useEffect(() => {
    let timeout;
    try {
      timeout = setTimeout(() => {
        setStatusText('Connected. Tap mic to speak');
      }, 1000);
    } catch (e) {}

    return () => {
      try { clearTimeout(timeout); } catch (e) {}
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {}
      try {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      } catch (e) {}
    };
  }, [characterId]);

  const handleSendMessage = async (text) => {
    setStatusText('Thinking...');
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ characterId, message: text })
      });
      
      const data = await res.json();
      const aiResponse = data.data?.response;
      
      if (aiResponse) {
        speakResponse(aiResponse);
      } else {
        setStatusText('Tap mic to speak');
      }
    } catch (error) {
      console.error(error);
      setStatusText('Connection error');
    }
  };

  const speakResponse = async (text) => {
    setStatusText('She is speaking...');
    setIsAiSpeaking(true);

    try {
      const res = await fetch('/api/chat/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      if (!res.ok) throw new Error('TTS fetch failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsAiSpeaking(false);
        setStatusText('Tap mic to reply');
        URL.revokeObjectURL(url);
      };

      audio.onerror = () => {
        setIsAiSpeaking(false);
        setStatusText('Tap mic to speak');
      };

      await audio.play();
    } catch (error) {
      console.error('TTS Error:', error);
      setIsAiSpeaking(false);
      setStatusText('Tap mic to speak');
    }
  };

  const toggleMic = () => {
    if (isAiSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsAiSpeaking(false);
    }

    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    } else {
      setTranscript('');
      startListening();
    }
  };

  const hangUp = () => {
    if (audioRef.current) audioRef.current.pause();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch(e){}
    }
    navigate(`/chat/${characterId}`);
  };

  const avatarSrc = user?.avatar && user.avatar !== '/image.png' ? user.avatar : '/image.png';

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden relative justify-between pb-8">
      {/* Dynamic Background Overlay */}
      <div className={`absolute inset-0 bg-primary/5 transition-opacity duration-1000 ${isAiSpeaking ? 'opacity-100' : 'opacity-0'}`} />

      {/* Header */}
      <header className="flex flex-col items-center pt-12 pb-6 z-10 space-y-2">
        <h2 className="text-3xl font-bold tracking-tight capitalize text-foreground">
          {user?.gfName || characterId}
        </h2>
        <div className="px-4 py-1.5 rounded-full bg-muted/50 border shadow-sm font-mono text-sm text-muted-foreground">
          {formatTime(callDuration)}
        </div>
      </header>

      {/* Center Avatar & Status */}
      <main className="flex-1 flex flex-col items-center justify-center z-10 px-4">
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-12">
          {/* Animated Glow Rings when speaking */}
          {isAiSpeaking && (
            <>
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-primary"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-primary/50"
                animate={{ scale: [1, 1.7, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeInOut" }}
              />
            </>
          )}
          <Avatar className="w-full h-full border-4 border-card shadow-2xl relative z-10">
            <AvatarImage src={avatarSrc} className="object-cover" />
            <AvatarFallback className="text-6xl">{(user?.gfName || characterId || 'A')[0]}</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col items-center space-y-4 max-w-md text-center">
          {isListening && <Volume2 className="h-6 w-6 text-primary animate-pulse" />}
          <p className="text-xl font-medium text-muted-foreground">{statusText}</p>
          {transcript && (
            <p className="text-lg italic text-foreground mt-4 px-4 py-3 bg-muted/50 rounded-xl border border-border/50">
              "{transcript}"
            </p>
          )}
        </div>
      </main>

      {/* Controls */}
      <div className="flex flex-col items-center gap-8 z-10 w-full max-w-md mx-auto px-6">
        <div className="flex items-center justify-center gap-8">
          <Button 
            variant={isListening ? "default" : "secondary"} 
            size="icon" 
            className={`w-20 h-20 rounded-full shadow-lg transition-all ${isListening ? 'animate-pulse scale-105' : 'hover:scale-105'}`}
            onClick={toggleMic}
          >
            {isListening ? <Mic className="h-8 w-8" /> : <MicOff className="h-8 w-8" />}
          </Button>
          
          <Button 
            variant="destructive" 
            size="icon" 
            className="w-20 h-20 rounded-full shadow-lg hover:scale-105 transition-all"
            onClick={hangUp}
          >
            <PhoneOff className="h-8 w-8" />
          </Button>
        </div>

        {/* Fallback TTS Tester */}
        <form 
          className="flex items-center gap-2 w-full mt-4 bg-card p-2 rounded-full border shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target;
            const text = form.elements.textMsg.value;
            if (text.trim()) {
              handleSendMessage(text);
              form.reset();
            }
          }}
        >
          <Input 
            name="textMsg" 
            type="text" 
            placeholder="Type to text-to-speech..." 
            className="border-0 bg-transparent focus-visible:ring-0 px-4"
          />
          <Button type="submit" size="icon" className="rounded-full shrink-0 h-10 w-10">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
