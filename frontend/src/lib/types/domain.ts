// ============================================================================
// ENCJE DOMENOWE - odzwierciedlają schemat bazy danych
// ============================================================================

/**
 * Adres - tabela `adres`
 * Zamiast null używamy pustego stringa ""
 */
type Client = {
  id: number;
  nip: string;
  nazwa_firmy: string;
  email: string;
  telefon: number;
  miejscowosc: string;
  kod_pocztowy: string;
  status_kod: string;
};
