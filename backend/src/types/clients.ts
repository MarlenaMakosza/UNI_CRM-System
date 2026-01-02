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

export type Client = {
  client_metadata: ClientMetadata;
  contact_person: ContactPerson;
  company_data: CompanyData;
  adres: Address;
  status_kod: StatusKlienta;
};

/**
 * Request dla tworzenia nowego klienta
 * Używa zagnieżdżonej struktury zgodnej z domeną biznesową
 * Wszystkie pola wymagane (brak client_metadata - generowane automatycznie)
 */
export type UpsertClient = {
  contact_person: ContactPerson;
  company_data: CompanyData;
  adres: Address;
  status_kod: StatusKlienta;
};