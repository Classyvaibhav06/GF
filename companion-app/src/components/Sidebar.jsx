import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, Users, Phone, Settings, User } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">AI Companion</div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="nav-item">
          <Users size={20} />
          <span>Characters</span>
        </NavLink>
        <NavLink to="/chats" className="nav-item">
          <MessageSquare size={20} />
          <span>Chats</span>
        </NavLink>
        <NavLink to="/calls" className="nav-item">
          <Phone size={20} />
          <span>Voice Calls</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-bottom">
        <NavLink to="/profile" className="nav-item">
          <User size={20} />
          <span>Profile</span>
        </NavLink>
        <NavLink to="/settings" className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
