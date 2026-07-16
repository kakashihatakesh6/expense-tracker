import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  
  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      const session = await authService.getSession();
      set({ 
        session, 
        user: session?.user || null, 
        isLoading: false 
      });

      // Listen to auth state changes in real-time
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ 
          session, 
          user: session?.user || null, 
          isLoading: false 
        });
      });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ isLoading: false });
    }
  },

  setSession: (session) => {
    set({ session, user: session?.user || null });
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await authService.signOut();
      set({ session: null, user: null, isLoading: false });
    } catch (error) {
      console.error('Failed to sign out:', error);
      set({ isLoading: false });
    }
  },
}));
