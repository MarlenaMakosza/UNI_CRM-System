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
 * Obroty miesięczne klienta
 */
export type MonthlyTurnover = {
  miesiac: string; // format: "YYYY-MM"
  wartosc: number;
  liczba_umow: number;
};

/**
 * Obroty z klientem w miesiącach
 */
export type ClientTurnover = {
  klient_id: number;
  klient_nazwa: string;
  okres: {
    od: string; // ISO date
    do: string; // ISO date
  };
  suma_obrotow: number;
  liczba_umow_ogolem: number;
  miesiace: MonthlyTurnover[];
};
