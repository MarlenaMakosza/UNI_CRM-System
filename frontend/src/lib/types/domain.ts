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
