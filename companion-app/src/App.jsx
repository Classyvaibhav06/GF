import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import VoiceCallPage from './pages/VoiceCallPage';
import CharacterProfilePage from './pages/CharacterProfilePage';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat/:characterId" element={<ChatPage />} />
          <Route path="/call/:characterId" element={<VoiceCallPage />} />
          <Route path="/profile/:characterId" element={<CharacterProfilePage />} />
          <Route path="/profile" element={<CharacterProfilePage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
