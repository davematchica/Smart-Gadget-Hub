import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../services/supabase';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      loading: false,

      setAuth: (user, session) => set({
        user,
        session,
        isAuthenticated: !!user,
      }),

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({
            user: data.user,
            session: data.session,
            isAuthenticated: true,
            loading: false,
          });

          return { success: true };
        } catch (error) {
          set({ loading: false });
          return { success: false, error: error.message };
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        });
      },

      checkSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          set({
            user: session.user,
            session,
            isAuthenticated: true,
          });
        }
      },

      getToken: () => {
        return get().session?.access_token || null;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);