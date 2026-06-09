import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user && !localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [user, navigate]);

  const gfName = user?.gfName || 'Companion';
  const avatar = user?.avatar && user.avatar !== '/image.png' ? user.avatar : '/image.png';

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome, <span style={{color: '#ff3366', textTransform: 'capitalize'}}>{user?.username || 'User'}</span>!</h1>
          <p>Your companion is waiting for you.</p>
        </header>

        <div className="characters-grid">
          <motion.div 
            className="character-card dashboard-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(255, 51, 102, 0.2)' }}
            style={{ border: '1px solid #333344' }}
          >
            <div className="card-top">
              <img src={avatar} alt={gfName} className="avatar-md" style={{objectFit: 'cover'}} />
              <div className="status-indicator">
                <span className="status-dot"></span>
                <span className="status-text">Online</span>
              </div>
            </div>
            <h3 style={{textTransform: 'capitalize'}}>{gfName}</h3>
            <p className="char-desc">Your loving and supportive AI companion, ready to chat and teach you programming.</p>
            
            <div className="card-actions">
              <button 
                className="btn-primary" 
                onClick={() => navigate(`/chat/${gfName.toLowerCase()}`)}
                style={{ background: '#ff3366', color: 'white' }}
              >
                Chat with Her
              </button>
              <button 
                className="btn-outline" 
                onClick={() => navigate(`/profile`)}
              >
                Profile
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
