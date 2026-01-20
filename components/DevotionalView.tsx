import React, { useState, useEffect } from 'react';
import { UserProfile, DevotionalContent } from '../types';
import { generateDevotional } from '../services/geminiService';
import { BookOpen, Quote, Sparkles, RefreshCw } from 'lucide-react';

interface DevotionalViewProps {
  userProfile: UserProfile;
}

const DevotionalView: React.FC<DevotionalViewProps> = ({ userProfile }) => {
  const [content, setContent] = useState<DevotionalContent | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if we have today's devotional in storage
  useEffect(() => {
    const savedDevo = localStorage.getItem('zenite_devotional');
    const savedDate = localStorage.getItem('zenite_devotional_date');
    const today = new Date().toDateString();

    if (savedDevo && savedDate === today) {
      try {
        setContent(JSON.parse(savedDevo));
      } catch (e) {}
    } else {
      handleGenerate();
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    const newDevo = await generateDevotional(userProfile);
    if (newDevo) {
      setContent(newDevo);
      localStorage.setItem('zenite_devotional', JSON.stringify(newDevo));
      localStorage.setItem('zenite_devotional_date', new Date().toDateString());
    }
    setLoading(false);
  };

  if (loading && !content) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-900 text-cyan-400">
        <Sparkles className="w-12 h-12 animate-pulse mb-4" />
        <p className="text-lg">Buscando sabedoria...</p>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="h-full bg-gray-900 overflow-y-auto relative">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none" />
      
      <div className="relative z-10 max-w-3xl mx-auto p-6 md:p-12 flex flex-col items-center">
        
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/30 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4 border border-cyan-800/50">
            <BookOpen size={12} /> Palavra de Hoje
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Força Interior
          </h1>
        </header>

        {/* Verse Card */}
        <div className="w-full bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-3xl border border-gray-700 shadow-2xl mb-10 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700"></div>
          
          <Quote className="text-cyan-600 w-10 h-10 mb-6 opacity-50" />
          
          <blockquote className="text-2xl md:text-3xl font-serif text-white leading-relaxed mb-6 italic text-center">
            "{content.verse}"
          </blockquote>
          
          <div className="text-right">
            <cite className="text-cyan-400 font-bold not-italic tracking-wide block text-lg">
              — {content.reference}
            </cite>
          </div>
        </div>

        {/* Reflection & Prayer */}
        <div className="grid md:grid-cols-1 gap-8 w-full">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
              Reflexão de Alta Performance
            </h3>
            <p className="text-gray-300 leading-8 text-lg text-justify">
              {content.reflection}
            </p>
          </div>

          <div className="bg-cyan-950/20 p-6 rounded-2xl border border-cyan-900/30 mt-4">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">Oração do Atleta</h3>
            <p className="text-gray-300 italic">
              "{content.prayer}"
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="text-gray-600 hover:text-cyan-400 transition-colors flex items-center gap-2 text-sm mx-auto"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Renovando...' : 'Receber nova palavra'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DevotionalView;