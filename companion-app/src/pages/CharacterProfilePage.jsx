import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, ArrowLeft, Heart, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './CharacterProfilePage.css';

export default function CharacterProfilePage() {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editGfName, setEditGfName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user && !localStorage.getItem('token')) {
      navigate('/login');
    } else if (user) {
      setEditGfName(user.gfName || '');
      setEditUsername(user.username || '');
      setEditAvatar(user.avatar && user.avatar !== '/image.png' ? user.avatar : '');
    }
  }, [user, navigate]);

  const gfName = user?.gfName || 'Companion';
  const avatar = user?.avatar && user.avatar !== '/image.png' ? user.avatar : '/image.png';

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          username: editUsername, 
          gfName: editGfName, 
          avatar: editAvatar || '/image.png'
        })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        updateUser(data.user);
        setIsEditing(false);
      } else {
        setErrorMsg(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMsg('Network error while saving');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header-bg">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={24} />
        </button>
      </div>
      
      <main className="profile-container">
        <motion.div 
          className="profile-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="profile-avatar-container">
            <img 
              src={isEditing ? (editAvatar || '/image.png') : avatar} 
              alt={gfName} 
              className="profile-avatar" 
              style={{ objectFit: 'cover' }}
            />
          </div>

          <div className="profile-info">
            {!isEditing ? (
              <>
                <h1 className="profile-name" style={{textTransform: 'capitalize'}}>{gfName}</h1>
                <p className="profile-age">Your AI Companion (Calls you: {user?.username})</p>
                <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: '#ff3366', cursor: 'pointer', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px', margin: '0 auto' }}>
                  <Edit2 size={16} /> Edit Profile
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                {errorMsg && <div style={{ color: '#ff3366', fontSize: '14px' }}>{errorMsg}</div>}
                
                <div style={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '12px', color: '#aaa', display: 'block', textAlign: 'center' }}>Profile Picture</label>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <label style={{ background: '#333', color: 'white', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                      Upload New
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                    <button 
                      onClick={() => setEditAvatar('/image.png')} 
                      style={{ background: '#ff3366', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>

                <div style={{ width: '100%', textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px', display: 'block' }}>Her Name</label>
                  <input type="text" value={editGfName} onChange={e => setEditGfName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a24', color: 'white' }} />
                </div>
                
                <div style={{ width: '100%', textAlign: 'left' }}>
                  <label style={{ fontSize: '12px', color: '#aaa', marginBottom: '5px', display: 'block' }}>Your Name (What she calls you)</label>
                  <input type="text" value={editUsername} onChange={e => setEditUsername(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a24', color: 'white' }} />
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={handleSave} className="btn-primary" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Save size={16} /> Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="btn-outline" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            )}
            
            <div className="relationship-level" style={{ marginTop: '20px' }}>
              <Heart size={20} className="heart-icon" />
              <span>Relationship Level: <strong>Soulmate</strong></span>
            </div>

            <div className="profile-section">
              <h3>Personality Traits</h3>
              <div className="traits-container">
                <span className="trait-badge">Empathetic</span>
                <span className="trait-badge">Witty</span>
                <span className="trait-badge">Loyal</span>
                <span className="trait-badge">Supportive</span>
              </div>
            </div>

            <div className="profile-section">
              <h3>Interests</h3>
              <p className="interests-text">
                Chatting with {user?.username}, exploring AI-human connection, listening to music, and helping you through your day!
              </p>
            </div>
            
            {!isEditing && (
              <div className="profile-actions">
                <button 
                  className="btn-primary" 
                  onClick={() => navigate(`/chat/${gfName.toLowerCase()}`)}
                >
                  <MessageSquare size={18} /> Start Chat
                </button>
                <button 
                  className="btn-outline" 
                  onClick={() => navigate(`/call/${gfName.toLowerCase()}`)}
                >
                  <Phone size={18} /> Voice Call
                </button>
              </div>
            )}

          </div>
        </motion.div>
      </main>
    </div>
  );
}
