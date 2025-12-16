import {
  Address,
  AddressSummary,
  Client,
  ClientMetadata,
  ClientSummary,
  CompanyData,
  ContactData,
  ContactPerson,
  StatusKlienta,
} from "../types/index.ts";
import { DbClientDetails, DbClientSummaryRow } from "../types/database.ts";

/**
 * Konwertuje surowy rekord z bazy (DbClientSummaryRow) na uproszczony
 * strukturę ClientSummary
 * @param dbClient - surowa rekord z bazy
 * @returns ClientSummary - uproszczona struktura
 */
export function dbClientToClientSummary(
  dbClient: DbClientSummaryRow,
): ClientSummary {
  const companyData: CompanyData = {
    nip: dbClient.nip,
    nazwa_firmy: dbClient.nazwa_firmy,
  };

  const contactData: ContactData = {
    email: dbClient.email,
    telefon: dbClient.telefon,
  };

  const adres: AddressSummary = {
    kod_pocztowy: dbClient.kod_pocztowy,
    miejscowosc: dbClient.miejscowosc,
  };

  return {
    company_data: companyData,
    contact_data: contactData,
    adres: adres,
    status_kod: dbClient.status_kod as StatusKlienta,
  };
}

/**
 * Konwertuje surowy rekord z bazy (DbClientDetails) na strukturę Client
 * @param dbClient - surowa rekord z bazy
 * @returns Client - uproszczona struktura
 */
export function dbClientDetailsToClient(dbClient: DbClientDetails): Client {
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
