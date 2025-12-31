export type RolaPracownika = "pracownik" | "szef";

/**
 * Request logowania
 */
export type LoginRequest = {
  email: string;
  password: string;
};

/**
 * Response po zalogowaniu
 */
export type LoginResponse = {
  token: string;
  user: {
    id: number;
    imie: string;
    nazwisko: string;
    email: string;
    rola: RolaPracownika;
  };
};

/**
 * Dane użytkownika z JWT payload
 */
export type JwtPayload = {
  userId: number;
  email: string;
  rola: RolaPracownika;
  exp?: number;
};

/**
 * Dane użytkownika w context (po sprawdzeniu JWT)
 */
export type AuthUser = {
  id: number;
  email: string;
  rola: RolaPracownika;
};
