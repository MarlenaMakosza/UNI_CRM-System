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

        // Zapisz user w localStorage
        localStorage.setItem("auth_user", JSON.stringify(response.user));

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
      localStorage.removeItem("auth_user");
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
      const userJson = localStorage.getItem("auth_user");

      if (token && userJson) {
        try {
          const user = JSON.parse(userJson);
          set({
            user: user,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          // Błąd parsowania - wyloguj
          localStorage.removeItem("auth_user");
          localStorage.removeItem("auth_token");
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }
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
