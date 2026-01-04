/**
 * Raport aktywności przedstawiciela handlowego
 */
export type RepActivity = {
  przedstawiciel_id: number;
  okres: {
    od: string; // ISO date
    do: string; // ISO date
  };
  statystyki: {
    liczba_wizyt_zrealizowanych: number;
    liczba_telefonow_wykonanych: number;
    liczba_zawartych_umow: number;
    suma_wartosci_umow: number;
    liczba_wizyt_zaplanowanych: number;
  };
};

/**
 * Pojedyncze zdarzenie w harmonogramie
 */
export type AgendaItem = {
  zdarzenie_id: number;
  typ_nazwa: string;
  klient_id: number;
  klient_nazwa: string;
  godzina: string; // HH:MM z data_planowana
  opis: string;
  adres: {
    ulica: string;
    numer_budynku: string;
    numer_lokalu: string;
    miejscowosc: string;
    kod_pocztowy: string;
  };
};

/**
 * Harmonogram dnia przedstawiciela
 */
export type RepAgenda = {
  przedstawiciel_id: number;
  data: string; // ISO date (YYYY-MM-DD)
  zdarzenia: AgendaItem[];
};

/**
 * Obroty z klientem w miesiącach (opcjonalnie)
 */
export type ClientTurnover = {
  klient_id: number;
  obroty_miesieczne: {
    miesiac: string; // YYYY-MM
    suma_wartosci: number;
  }[];
};
