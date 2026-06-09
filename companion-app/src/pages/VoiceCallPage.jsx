import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './VoiceCallPage.css';

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
  // Preload voices for Web Speech API so they are ready
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.getVoices(); // Triggers async load
      }
    } catch (e) {}
  }, []);

  // Timer
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
        
        // Stop the microphone tracks to free the hardware
        stream.getTracks().forEach(track => track.stop());

        if (audioChunksRef.current.length === 0) {
           setStatusText('No audio detected. Tap mic to try again.');
           return;
        }

        try {
          // Send to our backend to bypass ISP blocks
          const response = await fetch('http://localhost:5000/api/chat/transcribe', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            // Send base64 audio since it's easier for the current backend route
            body: JSON.stringify({ audio: await blobToBase64(audioBlob) })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
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

  // Helper function to convert Blob to Base64
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
      const res = await fetch('http://localhost:5000/api/chat', {
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
      const res = await fetch('http://localhost:5000/api/chat/tts', {
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
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch(e){}
    }
    navigate(`/chat/${characterId}`);
  };

  return (
    <div className="call-layout">
      <div className="call-header">
        <h2 style={{ textTransform: 'capitalize' }}>{user?.gfName || characterId}</h2>
        <span className="call-time">{formatTime(callDuration)}</span>
      </div>

      <div className="call-center">
        <div className={`avatar-container ${isAiSpeaking ? 'speaking' : ''}`}>
          <img 
            src={user?.avatar && user.avatar !== '/image.png' ? user.avatar : '/image.png'} 
            alt="Avatar" 
            className="call-avatar" 
            style={{ objectFit: 'cover' }} 
          />
          {isAiSpeaking && <div className="glow-ring"></div>}
          {isAiSpeaking && <div className="glow-ring delayed"></div>}
        </div>

        <div className="status-display">
          {isListening && <Volume2 className="listening-icon" size={24} />}
          <p className="status-text-large">{statusText}</p>
          {transcript && <p className="transcript-text">"{transcript}"</p>}
        </div>
      </div>

      <div className="call-controls">
        <button 
          className={`control-btn mic-toggle ${isListening ? 'active' : ''}`} 
          onClick={toggleMic}
        >
          {isListening ? <Mic size={28} /> : <MicOff size={28} />}
        </button>
        
        <button className="control-btn hangup-btn" onClick={hangUp}>
          <PhoneOff size={28} />
        </button>
      </div>

      <div style={{ marginTop: '20px', width: '100%', maxWidth: '300px' }}>
        <form onSubmit={(e) => {
          e.preventDefault();
          const form = e.target;
          const text = form.elements.textMsg.value;
          if (text.trim()) {
            handleSendMessage(text);
            form.reset();
          }
        }} style={{ display: 'flex', gap: '10px' }}>
          <input 
            name="textMsg" 
            type="text" 
            placeholder="Type to test TTS..." 
            style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ccc', background: 'rgba(255,255,255,0.1)', color: 'white' }}
          />
          <button type="submit" style={{ padding: '10px 20px', borderRadius: '20px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
