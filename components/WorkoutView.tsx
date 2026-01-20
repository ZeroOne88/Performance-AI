import React, { useState, useEffect } from 'react';
import { UserProfile, WorkoutPlan, WorkoutDay, Exercise } from '../types';
import { generateWorkoutPlan } from '../services/geminiService';
import { STORAGE_KEYS } from '../services/storageService';
import { Dumbbell, RotateCcw, Clock, Target, CheckCircle, Circle, Check, Calendar, Trophy, Bell, BellRing, History, X, PlayCircle, ExternalLink } from 'lucide-react';

interface WorkoutViewProps {
  userProfile: UserProfile;
}

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const WorkoutView: React.FC<WorkoutViewProps> = ({ userProfile }) => {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(() => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1; // Convert to Mon=0, Sun=6
  });
  
  const [reminderScheduled, setReminderScheduled] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Video Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentExerciseVideo, setCurrentExerciseVideo] = useState<{name: string, term: string} | null>(null);

  useEffect(() => {
    const savedPlan = localStorage.getItem(STORAGE_KEYS.WORKOUT);
    if (savedPlan) {
      try {
        setPlan(JSON.parse(savedPlan));
      } catch (e) {}
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    const newPlan = await generateWorkoutPlan(userProfile);
    if (newPlan) {
      setPlan(newPlan);
      localStorage.setItem(STORAGE_KEYS.WORKOUT, JSON.stringify(newPlan));
      setActiveDayIndex(0);
    }
    setLoading(false);
  };

  const toggleExercise = (dayIdx: number, exerciseIdx: number) => {
    if (!plan) return;

    const newSplit = [...plan.split];
    const day = { ...newSplit[dayIdx] };
    const exercises = [...day.exercises];
    
    exercises[exerciseIdx] = {
      ...exercises[exerciseIdx],
      completed: !exercises[exerciseIdx].completed
    };
    
    day.exercises = exercises;
    
    const allDone = exercises.length > 0 && exercises.every(e => e.completed);
    day.completed = allDone;

    newSplit[dayIdx] = day;
    
    const newPlan = { ...plan, split: newSplit };
    setPlan(newPlan);
    localStorage.setItem(STORAGE_KEYS.WORKOUT, JSON.stringify(newPlan));
  };

  const handleSetReminder = async () => {
    if (!('Notification' in window)) {
      alert("Este navegador não suporta notificações.");
      return;
    }

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      setReminderScheduled(true);
      setTimeout(() => {
        checkAndNotify(activeDayIndex);
        setReminderScheduled(false);
      }, 10000);

      alert(`Lembrete agendado! Enviaremos uma notificação em 10 segundos se o treino não for concluído (Simulação).`);
    }
  };

  const checkAndNotify = (dayIndexToCheck: number) => {
    const stored = localStorage.getItem(STORAGE_KEYS.WORKOUT);
    if (!stored) return;

    const currentPlan: WorkoutPlan = JSON.parse(stored);
    const dayToCheck = currentPlan.split[dayIndexToCheck];
    
    if (!dayToCheck.completed) {
      const total = dayToCheck.exercises.length;
      const done = dayToCheck.exercises.filter(e => e.completed).length;
      const remaining = total - done;

      if (remaining > 0) {
        new Notification("Performance AI - Lembrete de Treino", {
          body: `Foco, ${userProfile.name}! Ainda faltam ${remaining} exercícios para completar o dia. Não desista agora.`,
          icon: '/favicon.ico',
          tag: 'workout-reminder'
        });
      }
    }
  };

  const getDayProgress = (day: WorkoutDay) => {
    if (!day.exercises || day.exercises.length === 0) return 0;
    const completedCount = day.exercises.filter(e => e.completed).length;
    return Math.round((completedCount / day.exercises.length) * 100);
  };

  const openVideo = (e: React.MouseEvent, exercise: Exercise) => {
    e.stopPropagation(); // Prevent toggling the exercise check
    const term = exercise.videoSearchTerm || `${exercise.name} execução correta`;
    setCurrentExerciseVideo({ name: exercise.name, term });
    setVideoModalOpen(true);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Construindo sua Rotina</h2>
        <p className="text-gray-400 max-w-md">
          A IA está criando um calendário semanal de alta performance para {userProfile.goals.join(' e ')}...
        </p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-gray-900">
        <div className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center mb-6 text-orange-500">
          <Calendar size={48} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Semana de Treinos</h2>
        <p className="text-gray-400 max-w-lg mb-8">
          Você ainda não possui um cronograma semanal ativo. Vamos criar um planejamento detalhado de Segunda a Domingo.
        </p>
        <button
          onClick={handleGenerate}
          className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2"
        >
          <Dumbbell size={20} /> Gerar Cronograma Semanal
        </button>
      </div>
    );
  }

  const activeDay = plan.split[activeDayIndex] || { dayName: 'Dia Livre', focus: 'Descanso', exercises: [] };
  const progress = getDayProgress(activeDay);
  const isDayFullComplete = activeDay.completed || (activeDay.exercises.length > 0 && progress === 100);
  const historyData = plan.split.map((day, index) => ({
    ...day,
    originalIndex: index,
    progress: getDayProgress(day)
  })).filter(day => day.progress > 0 || day.completed);

  return (
    <div className="h-full flex flex-col bg-gray-900 overflow-hidden relative">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-800 bg-gray-900/95 backdrop-blur z-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-orange-500" />
              Cronograma Semanal
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
              title="Histórico de Treinos"
            >
              <History size={20} />
              <span className="hidden md:inline text-sm">Histórico</span>
            </button>
            <div className="w-px h-6 bg-gray-800 mx-1"></div>
            <button
              onClick={handleSetReminder}
              disabled={reminderScheduled || isDayFullComplete}
              className={`p-2 rounded-lg transition-colors flex items-center gap-2 border 
                ${reminderScheduled 
                  ? 'bg-orange-500/20 border-orange-500 text-orange-400' 
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700'}
                ${isDayFullComplete ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {reminderScheduled ? <BellRing size={20} className="animate-pulse" /> : <Bell size={20} />}
              <span className="hidden md:inline text-sm font-medium">
                {reminderScheduled ? 'Ativado' : 'Lembrete'}
              </span>
            </button>
            <button 
              onClick={handleGenerate}
              className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              title="Gerar Novo Treino"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* Weekly Calendar Strip */}
        <div className="grid grid-cols-7 gap-1 md:gap-3">
          {WEEK_DAYS.map((dayLabel, idx) => {
            const splitDay = plan.split[idx];
            const isToday = activeDayIndex === idx;
            const isDone = splitDay?.completed;
            const hasExercises = splitDay?.exercises && splitDay.exercises.length > 0;

            return (
              <button
                key={idx}
                onClick={() => setActiveDayIndex(idx)}
                className={`
                  flex flex-col items-center justify-center py-3 rounded-xl transition-all relative overflow-hidden group
                  ${isToday 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/30 transform scale-105 z-10' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }
                `}
              >
                <span className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">{dayLabel}</span>
                {isDone ? (
                   <CheckCircle size={16} className={isToday ? 'text-white' : 'text-green-500'} />
                ) : (
                   <div className={`w-4 h-4 rounded-full border-2 ${isToday ? 'border-white/50' : 'border-gray-600'} ${hasExercises ? '' : 'opacity-20'}`} />
                )}
                {isToday && <div className="absolute inset-0 border-2 border-orange-400/50 rounded-xl" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        
        {/* Day Header Card */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6 shadow-xl relative overflow-hidden">
          <div className={`absolute top-0 right-0 p-8 opacity-5 transition-transform duration-500 ${isDayFullComplete ? 'scale-110 text-green-500' : 'text-white'}`}>
            <Trophy size={140} />
          </div>

          <div className="relative z-10">
            <div className="flex justify-between items-start">
               <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{activeDay.dayName}</h2>
                  <div className="flex items-center gap-2 text-orange-400 font-medium">
                    <Target size={16} />
                    <span>{activeDay.focus}</span>
                  </div>
               </div>
               
               <div className="text-right">
                  <div className="text-3xl font-bold text-white">{progress}%</div>
                  <div className="text-xs text-gray-500 uppercase">Concluído</div>
               </div>
            </div>

            <div className="w-full h-2 bg-gray-700 rounded-full mt-6 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isDayFullComplete ? 'bg-green-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-3">
          {activeDay.exercises && activeDay.exercises.length > 0 ? (
            activeDay.exercises.map((exercise, idx) => (
              <div
                key={idx}
                onClick={() => toggleExercise(activeDayIndex, idx)}
                className={`w-full group transition-all duration-200 border rounded-xl p-4 flex items-start gap-4 relative overflow-hidden cursor-pointer
                  ${exercise.completed 
                    ? 'bg-gray-900/30 border-green-900/30 opacity-60 hover:opacity-100' 
                    : 'bg-gray-800 border-gray-700 hover:border-orange-500/50 hover:bg-gray-800/80 shadow-md'
                  }
                `}
              >
                {/* Checkbox UI */}
                <div className={`
                  mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0
                  ${exercise.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-500 text-transparent group-hover:border-orange-400'
                  }
                `}>
                  <Check size={14} strokeWidth={3} />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold text-lg mb-1 transition-colors ${exercise.completed ? 'text-gray-400 line-through decoration-green-500/50' : 'text-white'}`}>
                      {exercise.name}
                    </h3>
                    
                    {/* Play Button */}
                    <button
                      onClick={(e) => openVideo(e, exercise)}
                      className="text-orange-400 hover:text-white p-1 rounded-full hover:bg-orange-500/20 transition-all ml-2"
                      title="Ver execução (Vídeo)"
                    >
                      <PlayCircle size={24} />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm mt-1">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-950/30 rounded text-gray-300">
                      <span className="text-orange-400 font-bold">{exercise.sets}</span> Séries
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-950/30 rounded text-gray-300">
                      <span className="text-orange-400 font-bold">{exercise.reps}</span> Repetições
                    </div>
                    {exercise.notes && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock size={12} /> {exercise.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-2xl">
              <p className="text-gray-500">Nenhum exercício planejado para este dia.</p>
              <p className="text-sm text-gray-600 mt-2">Aproveite para descansar e recuperar.</p>
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 border border-gray-700 w-full max-w-lg max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="text-orange-500" size={24} /> 
                Histórico Recente
              </h2>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-3">
              {historyData.length > 0 ? (
                historyData.map((day, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700/50 hover:border-orange-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-lg">{day.dayName}</span>
                          {day.progress === 100 && <CheckCircle size={16} className="text-green-500" />}
                        </div>
                        <p className="text-sm text-gray-400">{day.focus}</p>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${day.progress === 100 ? 'text-green-500' : 'text-orange-400'}`}>
                          {day.progress}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden mb-3">
                      <div 
                        className={`h-full ${day.progress === 100 ? 'bg-green-500' : 'bg-orange-500'}`} 
                        style={{ width: `${day.progress}%` }} 
                      />
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>{day.exercises.filter(e => e.completed).length} de {day.exercises.length} exercícios</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Dumbbell size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Nenhum treino iniciado nesta semana.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {videoModalOpen && currentExerciseVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-4xl bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden animate-slideUp flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 <PlayCircle className="text-red-500" />
                 {currentExerciseVideo.name}
              </h3>
              <button 
                onClick={() => setVideoModalOpen(false)}
                className="p-2 hover:bg-gray-700 rounded-full text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="relative w-full aspect-video bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(currentExerciseVideo.term)}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0"
              />
            </div>
            
            <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-between items-center">
               <p className="text-xs text-gray-500">
                 Visualizando resultados para: <span className="text-gray-400">"{currentExerciseVideo.term}"</span>
               </p>
               <a 
                 href={`https://www.youtube.com/results?search_query=${encodeURIComponent(currentExerciseVideo.term)}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
               >
                 Abrir no YouTube <ExternalLink size={14} />
               </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutView;