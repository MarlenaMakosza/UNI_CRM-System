// ============================================================================
// AUTH STORE - globalny stan autoryzacji
// ============================================================================

import { writable } from "svelte/store";
import type { User } from "../types/auth";
import * as api from "../api/client";

/**
 * AuthState - stan autoryzacji
 */
type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
};

/**
 * createAuthStore - tworzy store z logiką autoryzacji
 */
function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  return {
    subscribe,

    /**
     * login - loguje użytkownika
     */
    async login(email: string, password: string): Promise<void> {
      update((state) => ({ ...state, loading: true }));

      try {
        const response = await api.login({ email, password });

        set({
          user: response.user,
          isAuthenticated: true,
          loading: false,
        });
      } catch (error) {
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
        throw error;
      }
    },

    /**
     * logout - wylogowuje użytkownika
     */
    logout(): void {
      api.logout();
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    },

    /**
     * init - inicjalizuje store (sprawdza czy użytkownik jest zalogowany)
     * Uwaga: w prawdziwej aplikacji należałoby zweryfikować token na backendzie
     */
    init(): void {
      const token = api.getAuthToken();

      if (token) {
        // W prawdziwej aplikacji: zweryfikuj token na backendzie
        // Na razie zakładamy, że token jest prawidłowy
        // Można by dodać endpoint GET /api/auth/me do weryfikacji

        set({
          user: null, // TODO: pobierz dane użytkownika z backendu
          isAuthenticated: true,
          loading: false,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    },
  };
}

export const authStore = createAuthStore();
