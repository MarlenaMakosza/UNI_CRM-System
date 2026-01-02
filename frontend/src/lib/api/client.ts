// ============================================================================
// API CLIENT - komunikacja z backendem
// ============================================================================

import type {LoginRequest, LoginResponse} from "../types/auth";

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

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return await fetch(url, {
    ...options,
    headers,
  });
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

  // Zapisz token w localstorage
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
 * fetchEventById - pobierz pojedyncze wydarzenie (z autoryzacją)
 */
export async function fetchEventById(id: string | number): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/events/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(response.status, response.statusText, "Wydarzenie nie zostało znalezione");
    }
    throw new ApiError(
      response.status,
      response.statusText,
      "Nie udało się pobrać wydarzenia",
    );
  }

  return await response.json();
}

/**
 * createEvent - utwórz nowe wydarzenie (z autoryzacją)
 */
export async function createEvent(eventData: any): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/events`, {
    method: "POST",
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: "Błąd tworzenia wydarzenia",
    }));
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.error || "Nie udało się utworzyć wydarzenia",
    );
  }

  return await response.json();
}

/**
 * updateEvent - zaktualizuj wydarzenie (z autoryzacją)
 */
export async function updateEvent(id: string | number, eventData: any): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: "Błąd aktualizacji wydarzenia",
    }));
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.error || "Nie udało się zaktualizować wydarzenia",
    );
  }

  return await response.json();
}

/**
 * fetchClients - pobierz klientów (z autoryzacją)
 */
export async function fetchClients(): Promise<any[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/clients`);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.statusText,
      "Nie udało się pobrać klientów",
    );
  }

  return await response.json();
}

/**
 * fetchClientById - pobierz pojedynczego klienta (z autoryzacją)
 */
export async function fetchClientById(id: string | number): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/clients/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(response.status, response.statusText, "Klient nie został znaleziony");
    }
    throw new ApiError(
      response.status,
      response.statusText,
      "Nie udało się pobrać klienta",
    );
  }

  return await response.json();
}
