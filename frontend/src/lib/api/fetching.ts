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

/**
 * createClient - utwórz nowego klienta
 */
export async function createClient(clientData: any): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/clients`, {
    method: "POST",
    body: JSON.stringify(clientData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.error || "Nie udało się utworzyć klienta",
    );
  }

  return await response.json();
}

/**
 * updateClient - zaktualizuj klienta (PUT)
 */
export async function updateClient(id: string | number, clientData: any): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/clients/${id}`, {
    method: "PUT",
    body: JSON.stringify(clientData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.error || "Nie udało się zaktualizować klienta",
    );
  }

  return await response.json();
}

// ============================================================================
// CONTRACTS API
// ============================================================================

/**
 * fetchContracts - pobierz umowy (z autoryzacją, filtrowanie po roli)
 */
export async function fetchContracts(): Promise<any[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/contracts`);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.statusText,
      "Nie udało się pobrać umów",
    );
  }

  return await response.json();
}

/**
 * fetchContractById - pobierz pojedynczą umowę (z autoryzacją)
 */
export async function fetchContractById(id: string | number): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/contracts/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(response.status, response.statusText, "Umowa nie została znaleziona");
    }
    throw new ApiError(
      response.status,
      response.statusText,
      "Nie udało się pobrać umowy",
    );
  }

  return await response.json();
}

/**
 * createContract - utwórz nową umowę
 */
export async function createContract(contractData: any): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/contracts`, {
    method: "POST",
    body: JSON.stringify(contractData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.error || "Nie udało się utworzyć umowy",
    );
  }

  return await response.json();
}

/**
 * updateContract - zaktualizuj umowę (PUT)
 */
export async function updateContract(id: string | number, contractData: any): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/contracts/${id}`, {
    method: "PUT",
    body: JSON.stringify(contractData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.error || "Nie udało się zaktualizować umowy",
    );
  }

  return await response.json();
}

// ============================================================================
// PRODUCTS API
// ============================================================================

/**
 * fetchProducts - pobierz produkty (z autoryzacją)
 */
export async function fetchProducts(): Promise<any[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/products`);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.statusText,
      "Nie udało się pobrać produktów",
    );
  }

  return await response.json();
}

/**
 * fetchProductById - pobierz pojedynczy produkt (z autoryzacją)
 */
export async function fetchProductById(id: string | number): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/products/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(response.status, response.statusText, "Produkt nie został znaleziony");
    }
    throw new ApiError(
      response.status,
      response.statusText,
      "Nie udało się pobrać produktu",
    );
  }

  return await response.json();
}

/**
 * createProduct - utwórz nowy produkt
 */
export async function createProduct(productData: any): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/products`, {
    method: "POST",
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.error || "Nie udało się utworzyć produktu",
    );
  }

  return await response.json();
}

/**
 * updateProduct - zaktualizuj produkt (PUT)
 */
export async function updateProduct(id: string | number, productData: any): Promise<any> {
  const response = await fetchWithAuth(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.error || "Nie udało się zaktualizować produktu",
    );
  }

  return await response.json();
}

/**
 * deleteProduct - usuń produkt
 */
export async function deleteProduct(id: string | number): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.error || "Nie udało się usunąć produktu",
    );
  }
}

// ============================================================================
// REPORTS API
// ============================================================================

/**
 * fetchRepActivity - pobierz raport aktywności przedstawiciela
 */
export async function fetchRepActivity(
  repId: number,
  from: string,
  to: string
): Promise<any> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/reports/rep-activity?rep_id=${repId}&from=${from}&to=${to}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.error || "Nie udało się pobrać raportu aktywności",
    );
  }

  return await response.json();
}

/**
 * fetchRepAgenda - pobierz harmonogram dnia przedstawiciela
 */
export async function fetchRepAgenda(
  repId: number,
  day: string
): Promise<any> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/reports/rep-agenda?rep_id=${repId}&day=${day}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.error || "Nie udało się pobrać harmonogramu",
    );
  }

  return await response.json();
}

/**
 * fetchClientTurnover - pobierz obroty klienta
 */
export async function fetchClientTurnover(
  clientId: number,
  from: string,
  to: string
): Promise<any> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/reports/client-turnover?client_id=${clientId}&from=${from}&to=${to}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(
      response.status,
      response.statusText,
      errorData.error || "Nie udało się pobrać obrotów klienta",
    );
  }

  return await response.json();
}
