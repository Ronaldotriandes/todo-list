import { LoginForm } from '@/components/login/api';
import { TokenManager, type TokenData } from '@/lib/auth-tokens';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  fullname: string;
  email: string;
}


interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  tokens: TokenData | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setAuthState: (user: User, accessToken: string) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hydrated: boolean) => void;
  checkTokenExpiry: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      tokens: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await LoginForm({
            body: {
              email,
              password
            }
          })
          if (!response || !response.data) {
            throw new Error('Invalid login response');
          }
          const { access_token, user } = response.data;
          const decodedToken = TokenManager.decodeToken(access_token);
          const tokens: TokenData = {
            accessToken: access_token,
            expiresAt: decodedToken.exp * 1000,
            tokenType: 'Bearer'
          };

          TokenManager.setTokens(tokens);

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        TokenManager.clearTokens();

        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false
        });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      setAuthState: (user: User, accessToken: string) => {
        const decodedToken = TokenManager.decodeToken(accessToken);
        const tokens: TokenData = {
          accessToken: accessToken,
          expiresAt: decodedToken.exp * 1000,
          tokenType: 'Bearer'
        };

        TokenManager.setTokens(tokens);

        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setHasHydrated: (hydrated: boolean) => {
        set({ hasHydrated: hydrated });
      },

      checkTokenExpiry: () => {
        const state = get();
        if (!state.isAuthenticated) return;

        if (!TokenManager.isAuthenticated()) {
          get().logout();
          return;
        }


      },


      initializeAuth: () => {
        if (TokenManager.isAuthenticated()) {
          const userToken = TokenManager.getUserFromToken();
          const storedTokens = TokenManager.getTokens();

          if (userToken && storedTokens) {
            const user: User = {
              id: userToken.id || userToken.sub || userToken.userId,
              fullname: userToken.fullname || userToken.name || 'User',
              email: userToken.email
            };

            set({
              user,
              tokens: storedTokens,
              isAuthenticated: true
            });
          }
        } else {
          TokenManager.clearTokens();
          set({
            user: null,
            tokens: null,
            isAuthenticated: false
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initializeAuth();
          state.setHasHydrated(true);
        }
      },
    }
  )
);