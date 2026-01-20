import React from 'react';
import { LayoutDashboard, Utensils, Brain, Dumbbell, ClipboardList, BookOpen, Settings } from 'lucide-react';
import { Persona } from '../types';

interface NavigationProps {
  activePersona: Persona;
  onSelectPersona: (p: Persona) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activePersona, onSelectPersona }) => {
  const navItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, color: 'text-purple-400' },
    { id: 'nutri', label: 'Nutrição', icon: Utensils, color: 'text-green-400' },
    { id: 'coach', label: 'Coach', icon: Dumbbell, color: 'text-orange-400' },
    { id: 'routine', label: 'Rotina', icon: ClipboardList, color: 'text-yellow-400' },
    { id: 'psych', label: 'Mente', icon: Brain, color: 'text-blue-400' },
    { id: 'spirit', label: 'Espírito', icon: BookOpen, color: 'text-cyan-400' },
  ] as const;

  return (
    <nav className="bg-gray-800 border-r border-gray-700 flex flex-col w-20 md:w-64 h-full transition-all duration-300 justify-between">
      <div>
        <div className="p-4 flex items-center justify-center md:justify-start gap-3 border-b border-gray-700 h-16">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
            P
          </div>
          <span className="hidden md:block font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Performance AI
          </span>
        </div>

        <div className="py-6 flex flex-col gap-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePersona === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSelectPersona(item.id as Persona)}
                className={`w-full flex items-center gap-4 px-4 py-3 transition-all duration-200 relative group
                  ${isActive ? 'bg-gray-700/50 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/30'}
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
                )}
                <Icon className={`w-6 h-6 ${isActive ? item.color : ''}`} />
                <span className={`hidden md:block font-medium ${isActive ? 'text-white' : ''}`}>
                  {item.label}
                </span>
                
                {/* Tooltip for mobile */}
                <div className="md:hidden absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-gray-700 pointer-events-none z-50">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-2 border-t border-gray-700">
        <button
          onClick={() => onSelectPersona('settings')}
          className={`w-full flex items-center gap-4 px-4 py-3 transition-all duration-200 rounded-lg group
            ${activePersona === 'settings' ? 'bg-gray-700/50 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/30'}
          `}
        >
          <Settings className="w-6 h-6 text-gray-500 group-hover:text-white" />
          <span className="hidden md:block font-medium">Configurações</span>
        </button>
        <div className="text-xs text-gray-500 text-center md:text-left mt-4 px-2 pb-2">
          <p className="hidden md:block">v1.2.0 Sync Enabled</p>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;