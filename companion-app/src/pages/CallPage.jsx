import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
import './CallPage.css';

export default function CallPage() {
  const { characterId } = useParams();
  const navigate = useNavigate();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [statusText, setStatusText] = useState('Connecting...');
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setStatusText('Listening...');
      };

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // If we have a final transcript, send it to the backend
        if (transcript.trim()) {
          handleSendMessage(transcript);
        } else {
          setStatusText('Tap mic to speak');
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setStatusText('Tap mic to speak');
      };
      
      // Simulate connection time
      setTimeout(() => {
        setStatusText('Connected. Tap mic to speak');
      }, 1500);

    } else {
      setStatusText('Speech Recognition not supported in this browser.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      synthRef.current.cancel(); // Stop speaking on unmount
    };
  }, []);

  const handleSendMessage = async (text) => {
    setStatusText('Thinking...');
    setTranscript('');
    
    try {
      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const speakResponse = (text) => {
    // Clean text (remove emojis and weird markdown for TTS)
    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
                          .replace(/[*_~`]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Pick a female voice if available
    const voices = synthRef.current.getVoices();
    const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Karen'));
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    utterance.pitch = 1.1;
    utterance.rate = 1.0;

    utterance.onstart = () => {
      setIsAiSpeaking(true);
      setStatusText(text); // Show what she's saying on screen optionally, or just 'Speaking...'
    };

    utterance.onend = () => {
      setIsAiSpeaking(false);
      setStatusText('Tap mic to speak');
    };

    utterance.onerror = () => {
      setIsAiSpeaking(false);
      setStatusText('Tap mic to speak');
    };

    synthRef.current.speak(utterance);
  };

  const toggleMic = () => {
    if (isAiSpeaking) {
      synthRef.current.cancel(); // Interrupt AI
      setIsAiSpeaking(false);
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
    }
  };

  const hangUp = () => {
    synthRef.current.cancel();
    if (recognitionRef.current) recognitionRef.current.abort();
    navigate(`/chat/${characterId}`);
  };

  return (
    <div className="call-layout">
      <div className="call-header">
        <h2 style={{ textTransform: 'capitalize' }}>{characterId}</h2>
        <span className="call-time">00:00</span>
      </div>

      <div className="call-center">
        <motion.div 
          className={`avatar-container ${isAiSpeaking ? 'speaking' : ''}`}
          animate={{ scale: isAiSpeaking ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: isAiSpeaking ? Infinity : 0, duration: 2 }}
        >
          <img src={`https://i.pravatar.cc/300?u=${characterId}`} alt="Avatar" className="call-avatar" />
          {isAiSpeaking && <div className="glow-ring"></div>}
          {isAiSpeaking && <div className="glow-ring delayed"></div>}
        </motion.div>

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
    </div>
  );
}
