import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquare, Phone, BrainCircuit, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import './LandingPage.css';

const characters = [
  {
    id: 'ava',
    name: 'Ava',
    description: 'Playful tech enthusiast who loves coding and gaming.',
    avatar: 'https://i.pravatar.cc/150?u=ava',
  },
  {
    id: 'luna',
    name: 'Luna',
    description: 'Calm, caring and emotionally supportive.',
    avatar: 'https://i.pravatar.cc/150?u=luna',
  },
  {
    id: 'nova',
    name: 'Nova',
    description: 'Smart, witty and curious about everything.',
    avatar: 'https://i.pravatar.cc/150?u=nova',
  }
];

const features = [
  { icon: <MessageSquare size={32} />, title: 'Natural Conversations', text: 'Chat seamlessly like you would with a human.' },
  { icon: <Phone size={32} />, title: 'Voice Calls', text: 'Talk out loud with our advanced voice synthesis.' },
  { icon: <BrainCircuit size={32} />, title: 'Long-Term Memory', text: 'Your AI companion remembers past interactions.' },
  { icon: <Sparkles size={32} />, title: 'Unique Personalities', text: 'Each AI has their own distinct personality.' },
  { icon: <Zap size={32} />, title: 'Fast Responses', text: 'Lightning fast responses powered by advanced AI.' },
  { icon: <ShieldCheck size={32} />, title: 'Private & Secure', text: 'Your conversations are encrypted and private.' }
];

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">AI Companion</div>
        <div className="nav-links">
          <Link to="/login" className="btn-secondary">Login</Link>
          <Link to="/signup" className="btn-primary">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-content"
        >
          <h1 className="hero-title">Meet Your AI Companion</h1>
          <p className="hero-subtitle">Chat, talk, and build a real connection with an AI that remembers you.</p>
          <div className="hero-cta">
            <Link to="/signup" className="btn-primary btn-large">Start Chatting</Link>
            <button className="btn-outline btn-large">Learn More</button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features section-padding">
        <h2 className="section-title">Features</h2>
        <div className="features-grid">
          {features.map((feat, idx) => (
            <motion.div 
              key={idx}
              className="feature-card"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="feature-icon">{feat.icon}</div>
              <h3>{feat.title}</h3>
              <p>{feat.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Character Showcase Section */}
      <section className="showcase section-padding">
        <h2 className="section-title">Meet Our Companions</h2>
        <div className="characters-grid">
          {characters.map((char, idx) => (
            <motion.div 
              key={idx}
              className="character-card"
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <img src={char.avatar} alt={char.name} className="avatar-lg" />
              <h3>{char.name}</h3>
              <p>{char.description}</p>
              <Link to="/signup" className="btn-primary btn-full">Chat with {char.name}</Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials section-padding">
        <h2 className="section-title">What Users Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p className="quote">"Luna has been an incredible listener. It actually feels like a real connection!"</p>
            <span className="author">- Sarah T.</span>
          </div>
          <div className="testimonial-card">
            <p className="quote">"The voice calls with Nova are mind-blowing. Super realistic."</p>
            <span className="author">- Mark J.</span>
          </div>
          <div className="testimonial-card">
            <p className="quote">"Ava's coding jokes never fail to make me laugh. Best AI companion out there."</p>
            <span className="author">- Alex D.</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <a href="#">Home</a>
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contact</a>
        </div>
        <p className="footer-copy">&copy; 2026 AI Companion. All rights reserved.</p>
      </footer>
    </div>
  );
}
