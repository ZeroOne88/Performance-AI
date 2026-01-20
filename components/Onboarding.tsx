import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ChevronRight, ChevronLeft, Save, Activity, Ruler, Utensils, AlertCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const steps = [
  { id: 1, title: 'Identificação', icon: Activity },
  { id: 2, title: 'Biometria', icon: Ruler },
  { id: 3, title: 'Estilo de Vida', icon: Activity },
  { id: 4, title: 'Saúde & Dieta', icon: Utensils },
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    goals: [],
    dietaryRestrictions: '',
    medicalConditions: ''
  });

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => {
      const goals = prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal];
      return { ...prev, goals };
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (!formData.name) return alert('Por favor, insira pelo menos seu nome.');
    onComplete(formData);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 text-white font-sans">
      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300" 
             style={{ width: `${(currentStep / steps.length) * 100}%` }} />

        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
               {React.createElement(steps[currentStep - 1].icon, { size: 24 })}
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Passo {currentStep} de {steps.length}</p>
              <h2 className="text-2xl font-bold">{steps[currentStep - 1].title}</h2>
            </div>
          </div>

          <div className="min-h-[300px]">
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Nome ou Apelido</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="Como devemos te chamar?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Idade</label>
                    <input 
                      type="number" 
                      value={formData.age}
                      onChange={(e) => handleChange('age', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
                      placeholder="Anos"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Sexo Biológico</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none appearance-none"
                    >
                      <option value="male">Masculino</option>
                      <option value="female">Feminino</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Peso (kg)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={formData.weight}
                        onChange={(e) => handleChange('weight', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none pl-10"
                        placeholder="0.0"
                      />
                      <div className="absolute left-3 top-3.5 text-gray-500 text-sm">kg</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Altura (cm)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={formData.height}
                        onChange={(e) => handleChange('height', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none pl-10"
                        placeholder="0"
                      />
                      <div className="absolute left-3 top-3.5 text-gray-500 text-sm">cm</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 flex gap-3 items-start">
                   <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                   <p className="text-sm text-gray-400">Estas métricas são fundamentais para calcular seu metabolismo basal e necessidades calóricas com precisão.</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                 <div className="space-y-2">
                    <label className="text-sm text-gray-400">Nível de Atividade Atual</label>
                    <select 
                      value={formData.activityLevel}
                      onChange={(e) => handleChange('activityLevel', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="sedentary">Sedentário (Pouco ou nenhum exercício)</option>
                      <option value="light">Leve (1-3 dias/semana)</option>
                      <option value="moderate">Moderado (3-5 dias/semana)</option>
                      <option value="intense">Intenso (6-7 dias/semana)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 mb-2 block">Objetivos Principais</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'loss', label: 'Perda de Peso' },
                        { id: 'gain', label: 'Ganho de Massa' },
                        { id: 'performance', label: 'Alta Performance' },
                        { id: 'wellness', label: 'Bem-estar Geral' }
                      ].map((goal) => (
                        <button
                          key={goal.id}
                          onClick={() => toggleGoal(goal.id)}
                          className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                            formData.goals.includes(goal.id)
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          {goal.label}
                        </button>
                      ))}
                    </div>
                  </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Restrições Alimentares</label>
                  <textarea 
                    value={formData.dietaryRestrictions}
                    onChange={(e) => handleChange('dietaryRestrictions', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none h-24 resize-none"
                    placeholder="Ex: Sou vegano, alergia a amendoim, intolerância a lactose..."
                  />
                </div>
                 <div className="space-y-2">
                  <label className="text-sm text-gray-400">Condições Médicas</label>
                  <textarea 
                    value={formData.medicalConditions}
                    onChange={(e) => handleChange('medicalConditions', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none h-24 resize-none"
                    placeholder="Ex: Diabetes, hipertensão, lesão no joelho..."
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
             <button
               onClick={handlePrev}
               disabled={currentStep === 1}
               className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                 currentStep === 1 
                   ? 'text-gray-600 cursor-not-allowed' 
                   : 'text-gray-300 hover:bg-gray-800'
               }`}
             >
               <ChevronLeft size={20} className="mr-1" /> Anterior
             </button>

             {currentStep < steps.length ? (
               <button
                 onClick={handleNext}
                 className="flex items-center px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium"
               >
                 Próximo <ChevronRight size={20} className="ml-1" />
               </button>
             ) : (
               <button
                 onClick={handleSubmit}
                 className="flex items-center px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-lg transition-colors font-bold shadow-lg shadow-green-900/20"
               >
                 <Save size={18} className="mr-2" /> Salvar Perfil
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;