import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, ArrowLeft, Heart, Edit2, Save, X, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function CharacterProfilePage() {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editGfName, setEditGfName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const currentAvatar = isEditing ? (editAvatar || '/image.png') : avatar;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header Profile Background */}
      <div className="h-64 sm:h-80 w-full relative bg-gradient-to-br from-primary/40 via-primary/20 to-background flex items-start p-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/dashboard')}
          className="bg-background/20 backdrop-blur hover:bg-background/40 rounded-full"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>
      
      <main className="container mx-auto px-4 sm:px-6 -mt-32 relative z-10 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-border shadow-2xl overflow-visible bg-card/95 backdrop-blur">
            <div className="flex flex-col items-center -mt-20 sm:-mt-24 pb-8 px-6">
              
              {/* Avatar Section */}
              <div className="relative group">
                <Avatar className="w-40 h-40 sm:w-48 sm:h-48 border-4 border-card shadow-xl bg-muted">
                  <AvatarImage src={currentAvatar} className="object-cover" />
                  <AvatarFallback className="text-5xl">{(gfName || 'A')[0]}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute bottom-2 right-2 bg-primary text-primary-foreground p-3 rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-transform hover:scale-105">
                    <Camera className="h-5 w-5" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              <CardContent className="w-full pt-8 p-0">
                {!isEditing ? (
                  <div className="flex flex-col items-center text-center space-y-6">
                    <div className="space-y-1">
                      <h1 className="text-4xl font-bold tracking-tight capitalize">{gfName}</h1>
                      <p className="text-lg text-muted-foreground">Your AI Companion (Calls you: <span className="text-foreground font-medium capitalize">{user?.username}</span>)</p>
                    </div>

                    <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                    </Button>

                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full font-medium">
                      <Heart className="w-5 h-5 fill-primary/20" />
                      <span>Relationship Level: <strong>Soulmate</strong></span>
                    </div>

                    <div className="w-full max-w-2xl text-left space-y-6 mt-4">
                      <div className="space-y-3">
                        <h3 className="text-xl font-semibold tracking-tight">Personality Traits</h3>
                        <div className="flex flex-wrap gap-2">
                          {["Empathetic", "Witty", "Loyal", "Supportive"].map(trait => (
                            <span key={trait} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold tracking-tight">Interests</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Chatting with {user?.username}, exploring AI-human connection, listening to music, and helping you through your day!
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md pt-6 border-t border-border/50">
                      <Button 
                        className="flex-1 text-base h-12" 
                        onClick={() => navigate(`/chat/${gfName.toLowerCase()}`)}
                      >
                        <MessageSquare className="w-5 h-5 mr-2" /> Start Chat
                      </Button>
                      <Button 
                        variant="secondary"
                        className="flex-1 text-base h-12" 
                        onClick={() => navigate(`/call/${gfName.toLowerCase()}`)}
                      >
                        <Phone className="w-5 h-5 mr-2" /> Voice Call
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center max-w-md mx-auto space-y-6 w-full">
                    {errorMsg && (
                      <div className="w-full p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md text-center">
                        {errorMsg}
                      </div>
                    )}
                    
                    <div className="w-full space-y-2">
                      <Label htmlFor="gfName">Her Name</Label>
                      <Input 
                        id="gfName" 
                        value={editGfName} 
                        onChange={e => setEditGfName(e.target.value)} 
                        className="bg-background"
                      />
                    </div>
                    
                    <div className="w-full space-y-2">
                      <Label htmlFor="username">Your Name (What she calls you)</Label>
                      <Input 
                        id="username" 
                        value={editUsername} 
                        onChange={e => setEditUsername(e.target.value)} 
                        className="bg-background"
                      />
                    </div>
                    
                    {editAvatar && editAvatar !== '/image.png' && (
                      <div className="w-full">
                        <Button variant="destructive" className="w-full" onClick={() => setEditAvatar('/image.png')}>
                          Remove Custom Photo
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-4 w-full pt-4">
                      <Button onClick={handleSave} className="flex-1" disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1" disabled={isSaving}>
                        <X className="w-4 h-4 mr-2" /> Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
