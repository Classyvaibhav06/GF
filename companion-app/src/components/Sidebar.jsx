import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, Users, Phone, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Sidebar() {
  const navItems = [
    { to: "/dashboard", icon: <Users size={20} />, label: "Characters" },
    { to: "/chats", icon: <MessageSquare size={20} />, label: "Chats" },
    { to: "/calls", icon: <Phone size={20} />, label: "Voice Calls" },
  ];

  const bottomItems = [
    { to: "/profile", icon: <User size={20} />, label: "Profile" },
    { to: "/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="text-xl font-bold tracking-tight text-primary">AI Companion</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="px-4 py-6 border-t space-y-2">
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
