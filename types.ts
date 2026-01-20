export type Persona = 'dashboard' | 'nutri' | 'psych' | 'coach' | 'routine' | 'spirit' | 'settings';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  persona: Persona;
  messages: Message[];
}

export interface DashboardStats {
  focusLevel: number;
  recoveryScore: number;
  nutritionAdherence: number;
}

export interface DailyTip {
  title: string;
  content: string;
  category: 'nutri' | 'psych' | 'coach';
}

export interface UserProfile {
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other';
  weight: string; // kg
  height: string; // cm
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'intense';
  goals: string[]; // e.g. ['hypertrophy', 'weight_loss']
  dietaryRestrictions: string;
  medicalConditions: string;
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  notes: string;
  videoSearchTerm?: string; // Optimized term for YouTube search
  completed?: boolean;
}

export interface WorkoutDay {
  dayName: string; // e.g. "Segunda-feira"
  focus: string; // e.g. "Peito, Ombros e Tríceps"
  exercises: Exercise[];
  completed?: boolean;
}

export interface WorkoutPlan {
  title: string;
  description: string;
  split: WorkoutDay[];
}

export interface DevotionalContent {
  verse: string;
  reference: string;
  reflection: string;
  prayer: string;
}