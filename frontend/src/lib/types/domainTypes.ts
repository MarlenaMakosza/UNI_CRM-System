// ============================================================================
// ENCJE DOMENOWE - odzwierciedlają strukturę z backendu
// ============================================================================

export type StatusKlienta = "PROSPEKT" | "W TRAKCIE" | "AKTYWNY" | "NIEAKTYWNY" | "VIP";

export type Address = {
  ulica: string;
  numer_budynku: string;
  numer_lokalu: string;
  kod_pocztowy: string;
  miejscowosc: string;
  wojewodztwo: string;
};

export type ContactData = {
  email: string;
  telefon: string;
};

export type ContactPerson = {
  imie: string;
  nazwisko: string;
  stanowisko: string;
  contact_data: ContactData;
};

export type CompanyData = {
  nip: string;
  nazwa_firmy: string;
};

export type ClientMetadata = {
  id: number;
  created_at: string;
};

/**
 * Client - pełne dane klienta
 */
export type Client = {
  client_metadata: ClientMetadata;
  contact_person: ContactPerson;
  company_data: CompanyData;
  adres: Address;
  status_kod: StatusKlienta;
};

// Alias dla kompatybilności
export type ClientDetails = Client;

// ============================================================================
// WYDARZENIA (EVENTS)
// ============================================================================

export type StatusZdarzenia = "zaplanowane" | "zrealizowane" | "odwołane";
export type TypZdarzenia = "telefon" | "wizyta" | "follow-up" | "telefon_po_dostawie" | "newsletter";

export type EventMetadata = {
  id: number;
  created_at: string;
};

export type EventSchedule = {
  data_planowana: string;
  data_realizacji: string;
};

export type EventDetails = {
  typ_nazwa: TypZdarzenia;
  status: StatusZdarzenia;
  opis: string;
  notatki: string;
};

export type EventRelations = {
  klient_id: number;
  przedstawiciel_id: number;
  umowa_id: number;
};

export type Event = {
  event_metadata: EventMetadata;
  relations: EventRelations;
  details: EventDetails;
  schedule: EventSchedule;
};

// ============================================================================
// UMOWY (CONTRACTS)
// ============================================================================

export type TypUmowy = "ramowa" | "jednorazowa";
export type StatusUmowy = "Aktywna" | "Zakończona" | "Anulowana" | "Wstrzymana";

export type ContractMetadata = {
  id: number;
  created_at: string;
};

export type ContractRelations = {
  klient_id: number;
  przedstawiciel_id: number;
};

export type ContractDetails = {
  typ_umowy: TypUmowy;
  status: StatusUmowy;
  data_od: string;
  data_do: string;
  wartosc_umowy: number;
};

export type ContractItem = {
  item_metadata: {
    id: number;
  };
  product_info: {
    produkt_id: number;
    nazwa: string;
    opis: string;
  };
  item_details: {
    ilosc: number;
    jednostka: string;
    cena_jednostkowa: number;
    wartosc: number;
  };
};

export type Contract = {
  contract_metadata: ContractMetadata;
  relations: ContractRelations;
  details: ContractDetails;
  items: ContractItem[];
};

// ============================================================================
// PRODUKTY (PRODUCTS)
// ============================================================================

export type Product = {
  id: number;
  nazwa: string;
  opis: string;
  cena: number;
};

// ============================================================================
// RAPORTY (REPORTS)
// ============================================================================

export type RepActivity = {
  przedstawiciel_id: number;
  okres: {
    od: string;
    do: string;
  };
  statystyki: {
    liczba_wizyt_zrealizowanych: number;
    liczba_telefonow_wykonanych: number;
    liczba_zawartych_umow: number;
    suma_wartosci_umow: number;
    liczba_wizyt_zaplanowanych: number;
  };
};

export type AgendaItem = {
  zdarzenie_id: number;
  typ_nazwa: string;
  klient_id: number;
  klient_nazwa: string;
  godzina: string;
  opis: string;
  adres: {
    ulica: string;
    numer_budynku: string;
    numer_lokalu: string;
    miejscowosc: string;
    kod_pocztowy: string;
  };
};

export type RepAgenda = {
  przedstawiciel_id: number;
  data: string;
  zdarzenia: AgendaItem[];
};

// ============================================================================
// OBROTY KLIENTA (CLIENT TURNOVER)
// ============================================================================

export type MonthlyTurnover = {
  miesiac: string; // format: "2024-01"
  wartosc: number;
  liczba_umow: number;
};

export type ClientTurnover = {
  klient_id: number;
  klient_nazwa: string;
  okres: {
    od: string;
    do: string;
  };
  suma_obrotow: number;
  liczba_umow_ogolem: number;
  miesiace: MonthlyTurnover[];
};
