import { create } from 'zustand';
import { Settings } from '../types';
import { expenseRepository } from '../database/repositories/expenseRepository';

interface SettingsState {
  settings: Settings;
  fetchSettings: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setCurrency: (currency: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setOcrEngine: (engine: 'mock' | 'cloud') => void;
  setAiCategorizationEnabled: (enabled: boolean) => void;
  setGeminiApiKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    theme: 'system',
    currency: 'INR',
    notificationsEnabled: true,
    ocrEngine: 'mock',
    aiCategorizationEnabled: true,
    geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || 
                  process.env.GEMINI_API_KEY,
  },
  fetchSettings: () => {
    try {
      const settings = expenseRepository.getSettings();
      set({ settings });
    } catch (error) {
      console.error('Error fetching settings from database:', error);
    }
  },
  setTheme: (theme) => {
    try {
      expenseRepository.saveSetting('theme', theme);
      set((state) => ({ settings: { ...state.settings, theme } }));
    } catch (error) {
      console.error('Error saving theme setting:', error);
    }
  },
  setCurrency: (currency) => {
    try {
      expenseRepository.saveSetting('currency', currency);
      set((state) => ({ settings: { ...state.settings, currency } }));
    } catch (error) {
      console.error('Error saving currency setting:', error);
    }
  },
  setNotificationsEnabled: (enabled) => {
    try {
      expenseRepository.saveSetting('notificationsEnabled', String(enabled));
      set((state) => ({ settings: { ...state.settings, notificationsEnabled: enabled } }));
    } catch (error) {
      console.error('Error saving notificationsEnabled setting:', error);
    }
  },
  setOcrEngine: (engine) => {
    try {
      expenseRepository.saveSetting('ocrEngine', engine);
      set((state) => ({ settings: { ...state.settings, ocrEngine: engine } }));
    } catch (error) {
      console.error('Error saving ocrEngine setting:', error);
    }
  },
  setAiCategorizationEnabled: (enabled) => {
    try {
      expenseRepository.saveSetting('aiCategorizationEnabled', String(enabled));
      set((state) => ({ settings: { ...state.settings, aiCategorizationEnabled: enabled } }));
    } catch (error) {
      console.error('Error saving aiCategorizationEnabled setting:', error);
    }
  },
  setGeminiApiKey: (key) => {
    try {
      expenseRepository.saveSetting('geminiApiKey', key);
      set((state) => ({ settings: { ...state.settings, geminiApiKey: key } }));
    } catch (error) {
      console.error('Error saving geminiApiKey setting:', error);
    }
  },
}));
