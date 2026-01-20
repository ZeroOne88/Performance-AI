import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { Message, Persona, UserProfile } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

interface ChatAreaProps {
  persona: Persona;
  messages: Message[];
  onUpdateMessages: (persona: Persona, msgs: Message[]) => void;
  userProfile?: UserProfile;
}

const ChatArea: React.FC<ChatAreaProps> = ({ persona, messages, onUpdateMessages, userProfile }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue.trim(),
      timestamp: new Date()
    };

    // Optimistic update
    const newHistory = [...messages, userMsg];
    onUpdateMessages(persona, newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(userMsg.text, messages, persona, userProfile);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };

      onUpdateMessages(persona, [...newHistory, botMsg]);
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPersonaConfig = (p: Persona) => {
    switch(p) {
      case 'nutri': return { 
        title: 'Nutricionista Esportivo', 
        desc: 'Otimização metabólica e planejamento alimentar.',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10 border-green-500/30'
      };
      case 'psych': return { 
        title: 'Psicólogo de Performance', 
        desc: 'Mindset, foco e gestão de ansiedade.',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10 border-blue-500/30'
      };
      case 'coach': return { 
        title: 'Treinador Físico', 
        desc: 'Periodização, hipertrofia e biomecânica.',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10 border-orange-500/30'
      };
      default: return { title: 'Assistente', desc: '', color: 'text-gray-400', bgColor: 'bg-gray-800' };
    }
  };

  const config = getPersonaConfig(persona);

  // Simple formatter function to handle basic markdown-like syntax
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold handling: **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={i} className={`min-h-[1.5em] ${line.startsWith('- ') || line.startsWith('* ') ? 'pl-4' : ''}`}>
           {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>;
              }
              return <span key={j}>{part}</span>;
           })}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 relative">
      {/* Header */}
      <div className={`p-6 border-b border-gray-800 ${config.bgColor} backdrop-blur-sm sticky top-0 z-10`}>
        <h2 className={`text-xl font-bold ${config.color}`}>{config.title}</h2>
        <p className="text-gray-400 text-sm">{config.desc}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
            <Bot className="w-16 h-16 mb-4" />
            <p>Inicie a conversa para otimizar sua performance.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-gray-700'}
            `}>
              {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
            </div>
            
            <div className={`
              max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-md leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'}
            `}>
              <div className="text-sm whitespace-pre-wrap">
                {msg.role === 'user' ? msg.text : formatText(msg.text)}
              </div>
              <div className="mt-2 text-[10px] opacity-50 text-right">
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 animate-pulse">
               <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-700 flex items-center">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin mr-2" />
              <span className="text-gray-400 text-sm">Analisando dados...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="relative max-w-4xl mx-auto flex items-end gap-2 bg-gray-800 p-2 rounded-xl border border-gray-700 focus-within:border-indigo-500 transition-colors">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Pergunte ao ${config.title}...`}
            className="w-full bg-transparent text-white placeholder-gray-500 p-3 max-h-32 min-h-[50px] resize-none focus:outline-none text-sm md:text-base scrollbar-hide"
            disabled={isLoading}
            rows={1}
            style={{ minHeight: '48px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`
              p-3 rounded-lg flex-shrink-0 transition-all duration-200
              ${!inputValue.trim() || isLoading 
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'}
            `}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">
          A IA pode cometer erros. Verifique informações médicas críticas com profissionais.
        </p>
      </div>
    </div>
  );
};

export default ChatArea;