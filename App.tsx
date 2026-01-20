import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import ChatArea from './components/ChatArea';
import Onboarding from './components/Onboarding';
import WorkoutView from './components/WorkoutView';
import DevotionalView from './components/DevotionalView';
import ProfileSettings from './components/ProfileSettings';
import { Persona, Message, UserProfile } from './types';
import { getStoredProfile, saveStoredProfile, STORAGE_KEYS } from './services/storageService';

const App: React.FC = () => {
  const [activePersona, setActivePersona] = useState<Persona>('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Initialize and Sync Logic
  useEffect(() => {
    // Initial Load
    const savedProfile = getStoredProfile();
    if (savedProfile) {
      setUserProfile(savedProfile);
    }

    // Storage Event Listener for Cross-Tab Sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PROFILE && e.newValue) {
        try {
          setUserProfile(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Failed to sync profile change", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleProfileSave = (profile: UserProfile) => {
    setUserProfile(profile);
    saveStoredProfile(profile);
  };
  
  // State to hold chat history for each persona separately
  const [chats, setChats] = useState<Record<string, Message[]>>({
    dashboard: [],
    nutri: [{
      id: 'init-nutri', 
      role: 'model', 
      text: '**Olá!** Sou seu Nutricionista Esportivo.\nAnalisei seu perfil. Vamos ajustar sua dieta para seus objetivos. O que você comeu hoje?', 
      timestamp: new Date()
    }],
    psych: [{
      id: 'init-psych', 
      role: 'model', 
      text: '**Bem-vindo.** Sou seu Psicólogo de Performance.\nCom base nos seus dados, vamos trabalhar seu mindset. Como você está se sentindo em relação aos seus objetivos?', 
      timestamp: new Date()
    }],
    coach: [{
      id: 'init-coach', 
      role: 'model', 
      text: '**Vamos treinar.** Sou seu Treinador.\nEstou aqui para tirar dúvidas técnicas. Se quiser seu plano completo, acesse a aba "Rotina". Qual sua dúvida de hoje?', 
      timestamp: new Date()
    }],
  });

  const handleUpdateMessages = (persona: Persona, msgs: Message[]) => {
    setChats(prev => ({
      ...prev,
      [persona]: msgs
    }));
  };

  const renderContent = () => {
    if (!userProfile) return null;

    switch (activePersona) {
      case 'dashboard':
        return <Dashboard userProfile={userProfile} />;
      case 'routine':
        return <WorkoutView userProfile={userProfile} />;
      case 'spirit':
        return <DevotionalView userProfile={userProfile} />;
      case 'settings':
        return <ProfileSettings userProfile={userProfile} onUpdateProfile={handleProfileSave} />;
      case 'nutri':
      case 'psych':
      case 'coach':
        return (
          <ChatArea 
            key={activePersona} 
            persona={activePersona}
            messages={chats[activePersona] || []}
            onUpdateMessages={handleUpdateMessages}
            userProfile={userProfile}
          />
        );
      default:
        return <Dashboard userProfile={userProfile} />;
    }
  };

  if (!userProfile) {
    return <Onboarding onComplete={handleProfileSave} />;
  }

  return (
    <div className="flex h-screen w-screen bg-gray-950 font-sans text-gray-100 selection:bg-indigo-500/30">
      {/* Sidebar Navigation */}
      <Navigation 
        activePersona={activePersona} 
        onSelectPersona={setActivePersona} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;