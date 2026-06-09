import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, User } from 'lucide-react';

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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col p-6 lg:p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Welcome, <span className="text-primary capitalize">{user?.username || 'User'}</span>!
          </h1>
          <p className="text-xl text-muted-foreground">Your companion is waiting for you.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full flex flex-col hover:border-primary/50 transition-colors border-border/50 bg-card/50">
              <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b">
                <Avatar className="w-16 h-16 border-2 border-primary/20">
                  <AvatarImage src={avatar} alt={gfName} className="object-cover" />
                  <AvatarFallback>{gfName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <CardTitle className="capitalize text-2xl">{gfName}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-sm font-medium text-muted-foreground">Online</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pt-6">
                <p className="text-muted-foreground">
                  Your loving and supportive AI companion, ready to chat and teach you programming.
                </p>
              </CardContent>
              <CardFooter className="flex gap-3 pt-6 border-t">
                <Button 
                  className="flex-1" 
                  onClick={() => navigate(`/chat/${gfName.toLowerCase()}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/profile`)}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
