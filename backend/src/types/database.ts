// Typy reprezentujące surowe dane bezpośrednio z bazy danych (snake_case)

/**
 * Pełne surowe dane klienta z bazy
 */
export type DbClient = {
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

export type DbPrzedstawiciel = {
  id: number;
  imie: string;
  nazwisko: string;
  email: string;
  haslo_hash: string;
  rola: string;
  aktywny: boolean;
};

/**
 * Pełne surowe dane wydarzenia z bazy
 */
export type DbEvent = {
  id: number;
  klient_id: number;
  przedstawiciel_id: number;
  typ_id: number;
  typ_nazwa: string; // JOIN z typ_zdarzenia
  umowa_id: number; // 0 jeśli NULL w bazie
  data_planowana: string; // ISO string z bazy, pusty string jeśli NULL
  data_realizacji: string; // ISO string z bazy, pusty string jeśli NULL
  status: string;
  opis: string;
  notatki: string;
  created_at: string; // ISO string
};

/**
 * Typ dla wstawiania nowego wydarzenia do bazy (bez id i created_at)
 */
export type NewEvent = {
  klient_id: number;
  przedstawiciel_id: number;
  typ_id: number; // FK do typ_zdarzenia
  umowa_id: number; // 0 jeśli brak
  data_planowana: string; // ISO string, pusty jeśli brak
  data_realizacji: string; // ISO string, pusty jeśli brak
  status: string;
  opis: string;
  notatki: string;
};