// Typy reprezentujące surowe dane bezpośrednio z bazy danych (snake_case)

/**
 * Surowe dane klienta z listy (getAllClients) - uproszczona struktura
 */
export type DbClientSummaryRow = {
  nip: string;
  nazwa_firmy: string;
  email: string;
  telefon: string;
  miejscowosc: string;
  kod_pocztowy: string;
  status_kod: string;
};

/**
 * Pełne surowe dane klienta z bazy (getClientById)
 */
export type DbClientDetails = {
  id: number;
  nip: string;
  nazwa_firmy: string;
  imie: string;
  nazwisko: string;
  stanowisko: string;
  email: string;
  telefon: string;
  created_at: Date;
  status_kod: string;
  adres_id: number;
  ulica: string;
  numer_budynku: string;
  numer_lokalu: string;
  kod_pocztowy: string;
  miejscowosc: string;
  wojewodztwo: string;
};

/**
 * Typ dla wstawiania nowego adresu do bazy
 */
export type NewAddress = {
  ulica: string;
  numer_budynku: string;
  numer_lokalu: string; // NOT NULL DEFAULT '' w bazie
  kod_pocztowy: string;
  miejscowosc: string;
  wojewodztwo: string;
};

/**
 * Typ dla wstawiania nowego klienta do bazy (bez id i created_at)
 */
export type NewClient = {
  nip: string;
  nazwa_firmy: string;
  imie: string;
  nazwisko: string;
  stanowisko: string;
  email: string;
  telefon: string;
  adres_id: number; // FK
  status_klienta_id: number; // FK
};

/**
 * Surowe dane wydarzenia z listy (getAllEvents)
 */
export type DbEventSummaryRow = {
  id: number;
  klient_id: number;
  przedstawiciel_id: number; // dla filtrowania po pracowniku
  typ_nazwa: string;
  data_planowana: string; // ISO string z bazy, pusty string jeśli brak
  status: string;
  opis: string;
};

/**
 * Pełne surowe dane wydarzenia z bazy (getEventById)
 */
export type DbEventDetails = {
  id: number;
  klient_id: number;
  przedstawiciel_id: number;
  typ_id: number;
  typ_nazwa: string;
  umowa_id: number; // 0 jeśli brak
  data_planowana: string; // ISO string, pusty jeśli brak
  data_realizacji: string; // ISO string, pusty jeśli brak
  status: string;
  opis: string;
  notatki: string;
  created_at: string; // ISO string
};

/**
 * Typ dla wstawiania nowego wydarzenia do bazy
 */
export type NewEvent = {
  klient_id: number;
  przedstawiciel_id: number;
  typ_id: number; // FK
  umowa_id: number; // 0 jeśli brak
  data_planowana: string; // ISO string, pusty jeśli brak
  data_realizacji: string; // ISO string, pusty jeśli brak
  status: string;
  opis: string;
  notatki: string;
};
