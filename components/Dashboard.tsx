import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend 
} from 'recharts';
import { Activity, Zap, Moon, TrendingUp } from 'lucide-react';
import { generateDashboardTip } from '../services/geminiService';
import { UserProfile } from '../types';

interface DashboardProps {
  userProfile: UserProfile;
}

// Mock data for visualization
const weeklyData = [
  { name: 'Seg', treino: 85, foco: 70, dieta: 90 },
  { name: 'Ter', treino: 60, foco: 85, dieta: 80 },
  { name: 'Qua', treino: 90, foco: 60, dieta: 85 },
  { name: 'Qui', treino: 75, foco: 90, dieta: 95 },
  { name: 'Sex', treino: 95, foco: 80, dieta: 70 },
  { name: 'Sab', treino: 50, foco: 60, dieta: 60 },
  { name: 'Dom', treino: 40, foco: 95, dieta: 80 },
];

const skillsData = [
  { subject: 'Força', A: 120, fullMark: 150 },
  { subject: 'Cardio', A: 98, fullMark: 150 },
  { subject: 'Sono', A: 86, fullMark: 150 },
  { subject: 'Nutrição', A: 99, fullMark: 150 },
  { subject: 'Mindset', A: 85, fullMark: 150 },
  { subject: 'Flexib.', A: 65, fullMark: 150 },
];

const Dashboard: React.FC<DashboardProps> = ({ userProfile }) => {
  const [dailyTip, setDailyTip] = useState<string>("Carregando insight diário...");

  useEffect(() => {
    let mounted = true;
    generateDashboardTip(userProfile).then(tip => {
        if(mounted) setDailyTip(tip);
    });
    return () => { mounted = false; };
  }, [userProfile]);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-gray-900 p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Painel de Performance</h1>
        <p className="text-gray-400">Olá, <span className="text-indigo-400 font-semibold">{userProfile.name}</span>. Aqui está seu resumo semanal.</p>
      </header>

      {/* Hero Tip Card */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-800 border border-gray-700 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
            <h3 className="text-blue-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Insight do Dia
            </h3>
            <p className="text-xl md:text-2xl text-white font-medium leading-relaxed italic">
                "{dailyTip}"
            </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-orange-500/20 text-orange-400 rounded-lg">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Carga de Treino</p>
            <p className="text-2xl font-bold text-white">850 <span className="text-xs text-gray-500 font-normal">UA</span></p>
          </div>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Qualidade do Sono</p>
            <p className="text-2xl font-bold text-white">88% <span className="text-xs text-green-500 font-normal">↑ 2%</span></p>
          </div>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-green-500/20 text-green-400 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Adesão à Dieta</p>
            <p className="text-2xl font-bold text-white">92% <span className="text-xs text-green-500 font-normal">Excelente</span></p>
          </div>
        </div>
         <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-lg">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Prontidão</p>
            <p className="text-2xl font-bold text-white">Alta</p>
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Consistência Semanal</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="treino" name="Treino" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="dieta" name="Dieta" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="foco" name="Foco" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Radar de Habilidades</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar
                  name="Você"
                  dataKey="A"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="#8b5cf6"
                  fillOpacity={0.4}
                />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;