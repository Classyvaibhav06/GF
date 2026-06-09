import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageSquare, Phone, BrainCircuit, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  { icon: <MessageSquare size={32} className="text-primary" />, title: 'Natural Conversations', text: 'Chat seamlessly like you would with a human.' },
  { icon: <Phone size={32} className="text-primary" />, title: 'Voice Calls', text: 'Talk out loud with our advanced voice synthesis.' },
  { icon: <BrainCircuit size={32} className="text-primary" />, title: 'Long-Term Memory', text: 'Your AI companion remembers past interactions.' },
  { icon: <Sparkles size={32} className="text-primary" />, title: 'Unique Personalities', text: 'Each AI has their own distinct personality.' },
  { icon: <Zap size={32} className="text-primary" />, title: 'Fast Responses', text: 'Lightning fast responses powered by advanced AI.' },
  { icon: <ShieldCheck size={32} className="text-primary" />, title: 'Private & Secure', text: 'Your conversations are encrypted and private.' }
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <div className="text-xl font-bold tracking-tight">AI Companion</div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-b from-primary/10 to-background">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl space-y-8"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Meet Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">AI Companion</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Chat, talk, and build a real connection with an AI that remembers you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8">Start Chatting</Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8">Learn More</Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center mb-16">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full bg-card/50 border-white/5 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="mb-4">{feat.icon}</div>
                  <CardTitle className="text-xl">{feat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feat.text}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Character Showcase Section */}
      <section className="bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Meet Our Companions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {characters.map((char, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full flex flex-col items-center text-center p-6 bg-card border-white/10 shadow-lg">
                  <Avatar className="w-32 h-32 mb-6 border-4 border-primary/20">
                    <AvatarImage src={char.avatar} alt={char.name} />
                    <AvatarFallback>{char.name[0]}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-2xl font-bold mb-2">{char.name}</h3>
                  <p className="text-muted-foreground mb-6 flex-1">{char.description}</p>
                  <Link to="/signup" className="w-full">
                    <Button className="w-full">Chat with {char.name}</Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center mb-16">What Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-card border-white/5">
            <CardContent className="pt-6">
              <p className="italic text-lg mb-4">"Luna has been an incredible listener. It actually feels like a real connection!"</p>
              <span className="text-primary font-semibold">- Sarah T.</span>
            </CardContent>
          </Card>
          <Card className="bg-card border-white/5">
            <CardContent className="pt-6">
              <p className="italic text-lg mb-4">"The voice calls with Nova are mind-blowing. Super realistic."</p>
              <span className="text-primary font-semibold">- Mark J.</span>
            </CardContent>
          </Card>
          <Card className="bg-card border-white/5">
            <CardContent className="pt-6">
              <p className="italic text-lg mb-4">"Ava's coding jokes never fail to make me laugh. Best AI companion out there."</p>
              <span className="text-primary font-semibold">- Alex D.</span>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="flex gap-8 mb-8 text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Home</a>
            <a href="#" className="hover:text-primary transition-colors">Features</a>
            <a href="#" className="hover:text-primary transition-colors">Pricing</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <p className="text-sm text-muted-foreground">&copy; 2026 AI Companion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
