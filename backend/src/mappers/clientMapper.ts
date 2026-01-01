import {
  Address,
  Client,
  ClientMetadata,
  CompanyData,
  ContactPerson,
  CreateClient,
  StatusKlienta,
} from "../types/index.ts";
import {
  DbClient,
  NewAddress,
  NewClient,
} from "../types/database.ts";

/**
 * Konwertuje surowy rekord z bazy (DbClient) na strukturę Client
 * @param dbClient - surowa rekord z bazy
 * @returns Client - uproszczona struktura
 */
export function dbClientToClient(dbClient: DbClient): Client {
  const clientMetadata: ClientMetadata = {
    id: dbClient.id,
    created_at: dbClient.created_at.toISOString(),
  };

  const contactPerson: ContactPerson = {
    imie: dbClient.imie,
    nazwisko: dbClient.nazwisko,
    stanowisko: dbClient.stanowisko,
    contact_data: {
      email: dbClient.email,
      telefon: dbClient.telefon,
    },
  };

  const companyData: CompanyData = {
    nip: dbClient.nip,
    nazwa_firmy: dbClient.nazwa_firmy,
  };

  const adres: Address = {
    ulica: dbClient.ulica,
    numer_budynku: dbClient.numer_budynku,
    numer_lokalu: dbClient.numer_lokalu,
    kod_pocztowy: dbClient.kod_pocztowy,
    miejscowosc: dbClient.miejscowosc,
    wojewodztwo: dbClient.wojewodztwo,
  };

  return {
    client_metadata: clientMetadata,
    contact_person: contactPerson,
    company_data: companyData,
    adres: adres,
    status_kod: dbClient.status_kod as StatusKlienta,
  };
}

/**
 * Mapuje CreateClientRequest na NewAddress dla repository
 * @param request - request z zagnieżdżoną strukturą
 * @returns NewAddress - płaska struktura dla INSERT do bazy
 */
export function createClientRequestToNewAddress(
  request: CreateClient,
): NewAddress {
  return {
    ulica: request.adres.ulica,
    numer_budynku: request.adres.numer_budynku,
    numer_lokalu: request.adres.numer_lokalu || "",
    kod_pocztowy: request.adres.kod_pocztowy,
    miejscowosc: request.adres.miejscowosc,
    wojewodztwo: request.adres.wojewodztwo,
  };
}

/**
 * Mapuje CreateClientRequest na NewClient dla repository
 * @param request - request z zagnieżdżoną strukturą
 * @param adresId - ID utworzonego adresu (FK)
 * @param statusId - ID statusu klienta (FK)
 * @returns NewClient - płaska struktura dla INSERT do bazy
 */
export function createClientRequestToNewClient(
  request: CreateClient,
  adresId: number,
  statusId: number,
): NewClient {
  return {
    nip: request.company_data.nip,
    nazwa_firmy: request.company_data.nazwa_firmy,
    imie: request.contact_person.imie,
    nazwisko: request.contact_person.nazwisko,
    stanowisko: request.contact_person.stanowisko,
    email: request.contact_person.contact_data.email,
    telefon: request.contact_person.contact_data.telefon,
    adres_id: adresId,
    status_klienta_id: statusId,
  };
}
