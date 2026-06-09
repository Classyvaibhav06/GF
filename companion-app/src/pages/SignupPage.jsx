import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [gfName, setGfName] = useState('');
  const [gfAvatar, setGfAvatar] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4 py-8">
      <motion.div 
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">Create Account</CardTitle>
            <CardDescription>
              Design your perfect companion
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent>
              <ScrollArea className="h-[60vh] sm:h-auto pr-4 -mr-4">
                <div className="space-y-4 p-1">
                  {errorMsg && (
                    <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md text-center">
                      {errorMsg}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Your Name</Label>
                      <Input 
                        id="username"
                        type="text" 
                        placeholder="What should she call you?" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required 
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gfName">Her Name</Label>
                      <Input 
                        id="gfName"
                        type="text" 
                        placeholder="What is her name?" 
                        value={gfName}
                        onChange={(e) => setGfName(e.target.value)}
                        required 
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar">Her Profile Picture (Optional)</Label>
                    <div className="flex items-center gap-4">
                      {gfAvatar && (
                        <Avatar className="w-16 h-16 border-2 border-primary/20">
                          <AvatarImage src={gfAvatar} alt="Preview" className="object-cover" />
                        </Avatar>
                      )}
                      <Input 
                        id="avatar"
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="flex-1 cursor-pointer file:cursor-pointer file:text-primary file:bg-primary/10 file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 hover:file:bg-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="Enter your email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      className="bg-background"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password"
                        type="password" 
                        placeholder="Create a password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        minLength={6}
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input 
                        id="confirmPassword"
                        type="password" 
                        placeholder="Confirm your password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required 
                        minLength={6}
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-6 border-t mt-4">
              <Button type="submit" className="w-full text-lg" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
