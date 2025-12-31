// ============================================================================
// TYPY AUTORYZACJI - zgodne z backendem
// ============================================================================

export type RolaPracownika = "pracownik" | "szef";

/**
 * User - dane użytkownika po zalogowaniu
 */
export type User = {
  id: number;
  imie: string;
  nazwisko: string;
  email: string;
  rola: RolaPracownika;
};

/**
 * LoginRequest - payload dla POST /api/auth/login
 */
export type LoginRequest = {
  email: string;
  password: string;
};

/**
 * LoginResponse - odpowiedź z backendu po logowaniu
 */
export type LoginResponse = {
  token: string;
  user: User;
};

/**
 * AuthError - błąd autoryzacji
 */
export type AuthError = {
  error: string;
};
