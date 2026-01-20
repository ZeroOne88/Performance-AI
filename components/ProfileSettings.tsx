import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { Save, Download, Upload, Cloud, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { exportUserData, importUserData } from '../services/storageService';

interface ProfileSettingsProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ userProfile, onUpdateProfile }) => {
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveStatus('idle');
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API delay for "Cloud Sync" effect
    setTimeout(() => {
      onUpdateProfile(formData);
      setIsSaving(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  };

  const handleExport = () => {
    const jsonString = exportUserData();
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `performance_ai_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importUserData(content);
        if (success) {
          alert('Dados importados com sucesso! A página será recarregada.');
          window.location.reload();
        } else {
          alert('Erro ao importar arquivo. Verifique se o formato é válido.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-full bg-gray-900 p-6 md:p-8 overflow-y-auto">
      <header className="mb-8 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Configurações & Dados</h1>
        <p className="text-gray-400">Gerencie seu perfil e sincronize seus dados.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Profile Edit Section */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-400" /> Editar Perfil
            </h2>
            {saveStatus === 'success' && (
              <span className="text-green-400 text-sm flex items-center gap-1 animate-fadeIn">
                <CheckCircle className="w-4 h-4" /> Salvo com sucesso
              </span>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Nome</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Peso (kg)</label>
                <input 
                  type="number" 
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Altura (cm)</label>
                <input 
                  type="number" 
                  value={formData.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Objetivos</label>
              <div className="flex flex-wrap gap-2">
                {formData.goals.map((goal, idx) => (
                   <span key={idx} className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-xs border border-indigo-800">
                     {goal}
                   </span>
                ))}
                <span className="text-xs text-gray-500 self-center ml-2">(Edite no onboarding para alterar)</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-bold disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'Sincronizando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>

        {/* Sync & Data Management */}
        <div className="space-y-6">
          
          {/* Cloud Status */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
             <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-blue-400" /> Status da Nuvem
            </h2>
            <div className="flex items-center gap-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
               <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
               <div>
                 <p className="text-white font-medium">Sincronização Ativa</p>
                 <p className="text-xs text-gray-500">Local Storage simula persistência local.</p>
               </div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Seus dados são salvos automaticamente neste dispositivo. Para acessar em outro dispositivo, utilize as opções de Backup abaixo.
            </p>
          </div>

          {/* Backup Actions */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Download className="w-5 h-5 text-orange-400" /> Backup & Restauração
            </h2>

            <div className="space-y-3">
              <button 
                onClick={handleExport}
                className="w-full flex items-center justify-between p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                   <Download className="w-5 h-5 text-gray-400 group-hover:text-white" />
                   <div className="text-left">
                     <p className="text-white font-medium">Exportar Dados</p>
                     <p className="text-xs text-gray-400">Baixar arquivo JSON de backup</p>
                   </div>
                </div>
              </button>

              <button 
                onClick={handleImportClick}
                className="w-full flex items-center justify-between p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                   <Upload className="w-5 h-5 text-gray-400 group-hover:text-white" />
                   <div className="text-left">
                     <p className="text-white font-medium">Importar Dados</p>
                     <p className="text-xs text-gray-400">Restaurar de um arquivo JSON</p>
                   </div>
                </div>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="application/json" 
                className="hidden" 
              />
            </div>
            
            <div className="mt-4 flex items-start gap-2 text-yellow-500/80 text-xs bg-yellow-500/10 p-3 rounded-lg">
               <AlertTriangle className="w-4 h-4 flex-shrink-0" />
               <p>A importação substituirá todos os dados atuais. Certifique-se de exportar antes se não quiser perder o progresso atual.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;