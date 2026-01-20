import { UserProfile, WorkoutPlan, DevotionalContent } from "../types";

export const STORAGE_KEYS = {
  PROFILE: 'zenite_profile',
  WORKOUT: 'zenite_workout_plan',
  DEVOTIONAL: 'zenite_devotional',
  DEVOTIONAL_DATE: 'zenite_devotional_date'
};

export const getStoredProfile = (): UserProfile | null => {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return data ? JSON.parse(data) : null;
};

export const saveStoredProfile = (profile: UserProfile) => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  // Dispatch a custom event for same-window updates if needed, 
  // though React state usually handles this. 
  // This is mainly for the storage event simulation.
};

export const exportUserData = (): string => {
  const data = {
    profile: localStorage.getItem(STORAGE_KEYS.PROFILE),
    workout: localStorage.getItem(STORAGE_KEYS.WORKOUT),
    devotional: localStorage.getItem(STORAGE_KEYS.DEVOTIONAL),
    devotionalDate: localStorage.getItem(STORAGE_KEYS.DEVOTIONAL_DATE),
    timestamp: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
};

export const importUserData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.profile) localStorage.setItem(STORAGE_KEYS.PROFILE, data.profile);
    if (data.workout) localStorage.setItem(STORAGE_KEYS.WORKOUT, data.workout);
    if (data.devotional) localStorage.setItem(STORAGE_KEYS.DEVOTIONAL, data.devotional);
    if (data.devotionalDate) localStorage.setItem(STORAGE_KEYS.DEVOTIONAL_DATE, data.devotionalDate);
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};