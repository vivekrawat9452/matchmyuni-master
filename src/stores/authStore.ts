import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {UserDto} from '../api/types';
import {TOKEN_KEY, setStoredToken} from '../api/client';

type Role = 'student' | 'agent' | null;

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserDto | null;
  setSession: (session: {
    accessToken: string;
    refreshToken: string;
    user: UserDto;
  }) => Promise<void>;
  setUser: (u: UserDto) => void;
  signOut: () => Promise<void>;
  /** Last selected role in onboarding (UI only until signup) */
  role: Role;
  setRole: (r: Role) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      role: null,
      setSession: async ({accessToken, refreshToken, user}) => {
        await setStoredToken(accessToken);
        set({accessToken, refreshToken, user});
      },
      setUser: u => set({user: u}),
      signOut: async () => {
        await setStoredToken(null);
        set({accessToken: null, refreshToken: null, user: null});
      },
      setRole: r => set({role: r}),
    }),
    {
      name: 'mm-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: s => ({
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        user: s.user,
      }),
      onRehydrateStorage: () => async state => {
        // Re-sync the dedicated TOKEN_KEY so the Axios interceptor can read it.
        // The Zustand store persists the token inside 'mm-auth', but the
        // interceptor reads from TOKEN_KEY directly.  Doing this synchronously
        // in the storage layer avoids a race where the first API call fires
        // before the async setStoredToken resolves.
        if (state?.accessToken) {
          await AsyncStorage.setItem(TOKEN_KEY, state.accessToken);
        } else {
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
      },
    },
  ),
);
