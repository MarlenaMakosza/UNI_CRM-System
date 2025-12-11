// ============================================================================
// ENCJE DOMENOWE - odzwierciedlają schemat bazy danych
// ============================================================================

/**
 * Adres - tabela `adres`
 * Zamiast null używamy pustego stringa ""
 */
export type Address = {
  id: number;
  ulica: string;
  numer_budynku: string;
  numer_lokalu: string;
  kod_pocztowy: string;
  miejscowosc: string;
  wojewodztwo: string;
};

/**
 * Wspólne pola klienta (podstawowe dane biznesowe)
 */
export type ClientBase = {
  nip: string;
  nazwa_firmy: string;
  imie: string;
  nazwisko: string;
  stanowisko: string;
  email: string;
  telefon: string;
};

/**
 * Nowy klient (do utworzenia w bazie)
 */
export type NewClient = ClientBase & {
  adres_id: number;
  status_klienta_id: number;
};

/**
 * Klient - pełny obiekt z danymi
 */
export type Client = ClientBase & {
  id: number;
  adres: Address;
  status_kod: string;
  created_at: Date;
};
