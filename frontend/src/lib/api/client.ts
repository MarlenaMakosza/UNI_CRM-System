// ============================================================================
// API CLIENT - komunikacja z backendem
// ============================================================================

import type { LoginRequest, LoginResponse } from "../types/auth";

const API_BASE_URL = "http://localhost:8080/api";

/**
 * ApiError - niestandardowy błąd API
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * fetchWithAuth - helper do wykonywania requestów z tokenem JWT
 */
async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = localStorage.getItem("auth_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response;
}

/**
 * login - logowanie użytkownika
 */
export async function login(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: "Błąd logowania",
    }));
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.error || "Nieprawidłowy email lub hasło",
    );
  }

  const data: LoginResponse = await response.json();

  // Zapisz token w localStorage
  localStorage.setItem("auth_token", data.token);

  return data;
}

/**
 * logout - wylogowanie użytkownika (usunięcie tokena)
 */
export function logout(): void {
  localStorage.removeItem("auth_token");
}

/**
 * getAuthToken - pobierz token z localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

/**
 * isAuthenticated - sprawdź czy użytkownik jest zalogowany
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

// ============================================================================
// API ENDPOINTS - przykładowe funkcje do pobierania danych
// ============================================================================

/**
 * fetchEvents - pobierz wydarzenia (z autoryzacją)
 */
export async function fetchEvents(): Promise<any[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/events`);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.statusText,
      "Nie udało się pobrać wydarzeń",
    );
  }

  return await response.json();
}

/**
 * fetchClients - pobierz klientów (bez autoryzacji na razie)
 */
export async function fetchClients(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/clients`);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.statusText,
      "Nie udało się pobrać klientów",
    );
  }

  return await response.json();
}
