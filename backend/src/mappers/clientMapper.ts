// Mapper do konwersji między typami bazy danych a typami domenowymi

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
import { nullToEmpty } from "../types/utils.ts";

/**
 * Konwertuje surowy rekord z bazy (DbClientListItem) na domenowy ClientSummary
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
 * Konwertuje surowy rekord z bazy (DbClientDetails) na domenowy Client
 */
export function dbClientDetailsToClient(dbClient: DbClientDetails): Client {
  const clientMetadata: ClientMetadata = {
    id: dbClient.id,
    created_at: dbClient.created_at.toISOString(),
  };

  const contactPerson: ContactPerson = {
    imie: nullToEmpty(dbClient.imie),
    nazwisko: nullToEmpty(dbClient.nazwisko),
    stanowisko: nullToEmpty(dbClient.stanowisko),
    contact_data: {
      email: nullToEmpty(dbClient.email),
      telefon: nullToEmpty(dbClient.telefon),
    },
  };

  const companyData: CompanyData = {
    nip: nullToEmpty(dbClient.nip),
    nazwa_firmy: nullToEmpty(dbClient.nazwa_firmy),
  };

  const adres: Address = {
    ulica: nullToEmpty(dbClient.ulica),
    numer_budynku: nullToEmpty(dbClient.numer_budynku),
    numer_lokalu: nullToEmpty(dbClient.numer_lokalu),
    kod_pocztowy: nullToEmpty(dbClient.kod_pocztowy),
    miejscowosc: nullToEmpty(dbClient.miejscowosc),
    wojewodztwo: nullToEmpty(dbClient.wojewodztwo),
  };

  return {
    client_metadata: clientMetadata,
    contact_person: contactPerson,
    company_data: companyData,
    adres: adres,
    status_kod: dbClient.status_kod as StatusKlienta,
  };
}
