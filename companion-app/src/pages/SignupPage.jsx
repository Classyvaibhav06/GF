import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [gfName, setGfName] = useState('');
  const [gfAvatar, setGfAvatar] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setGfAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if(password !== confirmPassword) {
      setErrorMsg("Passwords don't match!");
      return;
    }
    
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    try {
      const finalAvatar = gfAvatar || "https://images.unsplash.com/photo-1660032109199-3867a5fe8476?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHJ1c3NpYW4lMjBnaXJsfGVufDB8fDB8fHww";
      
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, gfName, email, password, avatar: finalAvatar })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        setErrorMsg(data.message || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg('Network error');
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Design your perfect companion</p>
        </div>

        {errorMsg && <div style={{color: '#ff3366', marginBottom: '15px', textAlign: 'center'}}>{errorMsg}</div>}

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label>Your Name</label>
            <input 
              type="text" 
              placeholder="What should she call you?" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Her Name</label>
            <input 
              type="text" 
              placeholder="What is her name?" 
              value={gfName}
              onChange={(e) => setGfName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Her Profile Picture (Optional)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              style={{ padding: '10px 0', background: 'transparent', border: 'none' }}
            />
            {gfAvatar && <img src={gfAvatar} alt="Preview" style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginTop: '10px'}} />}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Create a password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              type="password" 
              placeholder="Confirm your password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary btn-full" style={{marginTop: '1rem'}}>Create Account</button>
        </form>

        <p className="auth-footer" style={{marginTop: '20px'}}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
