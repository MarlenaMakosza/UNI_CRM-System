export type CreateAddressData = {
  ulica?: string;
  numer_budynku: string;
  numer_lokalu?: string;
  kod_pocztowy: string;
  miejscowosc: string;
  wojewodztwo?: string;
};

export type CreateClientData = {
  nip: string;
  nazwa_firmy: string;
  imie?: string;
  nazwisko?: string;
  stanowisko?: string;
  email: string;
  telefon?: string;
  adres_id: number;
  status_klienta_id: number;
};

export type UpdateAddressData = {
  ulica: string;
  numer_budynku: string;
  numer_lokalu: string | null;
  kod_pocztowy: string;
  miejscowosc: string;
  wojewodztwo: string | null;
};

export type UpdateClientData = {
  nip: string;
  nazwa_firmy: string;
  imie: string | null;
  nazwisko: string | null;
  stanowisko: string | null;
  email: string;
  telefon: string | null;
  status_klienta_id: number;
};

//TODO typy łączone może?
export type ClientWithAddress = {
  id: number;
  nip: string;
  nazwa_firmy: string;
  imie: string | null;
  nazwisko: string | null;
  stanowisko: string | null;
  email: string;
  telefon: string | null;
  status_klienta_id: number;
  adres_id: number;
  ulica: string;
  numer_budynku: string;
  numer_lokalu: string | null;
  kod_pocztowy: string;
  miejscowosc: string;
  wojewodztwo: string | null;
};

export type ClientRow = {
  id: number;
  nip: string;
  nazwa_firmy: string;
  imie: string | null;
  nazwisko: string | null;
  stanowisko: string | null;
  email: string;
  telefon: string | null;
  adres_id: number;
  status_klienta_id: number;
  created_at: Date;
  updated_at: Date;
};
