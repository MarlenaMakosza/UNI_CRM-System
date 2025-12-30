export type StatusKlienta = "PROSPEKT" | "AKTYWNY" | "NIEAKTYWNY" | "VIP";

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

export type AddressSummary = {
  kod_pocztowy: string;
  miejscowosc: string;
};

export type ClientSummary = {
  company_data: CompanyData;
  contact_data: ContactData;
  adres: AddressSummary;
  status_kod: StatusKlienta;
};

/**
 * Request dla tworzenia nowego klienta
 * Używa zagnieżdżonej struktury zgodnej z domeną biznesową
 * Wszystkie pola wymagane (brak client_metadata - generowane automatycznie)
 */
export type CreateClient = {
  contact_person: ContactPerson;
  company_data: CompanyData;
  adres: Address;
  status_kod: StatusKlienta;
};

/**
 * Request dla częściowej aktualizacji klienta (PATCH)
 * Wszystkie pola opcjonalne - wysyłaj tylko te które chcesz zmienić
 * NIP nie może być zmieniony (jest w company_data ale będzie walidowane w service)
 */
export type UpdateClient = {
  contact_person?: {
    imie?: string;
    nazwisko?: string;
    stanowisko?: string;
    contact_data?: {
      email?: string;
      telefon?: string;
    };
  };
  company_data?: {
    nip?: string; // NIP nie powinien być zmieniany - walidacja w service
    nazwa_firmy?: string;
  };
  adres?: {
    ulica?: string;
    numer_budynku?: string;
    numer_lokalu?: string;
    kod_pocztowy?: string;
    miejscowosc?: string;
    wojewodztwo?: string;
  };
  status_kod?: StatusKlienta;
};
