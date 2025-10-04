import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  pre2faToken: string | null;
  setAccessToken: (token: string | null) => void;
  setPre2faToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: sessionStorage.getItem('accessToken'),
  pre2faToken: sessionStorage.getItem('pre2faToken'),
  
  setAccessToken: (token) => {
    if (token) {
      sessionStorage.setItem('accessToken', token);
    } else {
      sessionStorage.removeItem('accessToken');
    }
    set({ accessToken: token });
  },
  
  setPre2faToken: (token) => {
    if (token) {
      sessionStorage.setItem('pre2faToken', token);
    } else {
      sessionStorage.removeItem('pre2faToken');
    }
    set({ pre2faToken: token });
  },
  
  logout: () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('pre2faToken');
    set({ accessToken: null, pre2faToken: null });
  },
  
  isAuthenticated: () => {
    return !!get().accessToken;
  },
}));
