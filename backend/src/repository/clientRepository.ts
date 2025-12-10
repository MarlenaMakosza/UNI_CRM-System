import { sql } from "db";
import { ClientDetail, ClientListItem } from "../types/clients.ts";
import * as Dto from "../dto/dto.ts";

export function getAllClients(): Promise<ClientListItem[]> {
  return sql<ClientListItem[]>`
    SELECT
      k.id, k.nip, k.nazwa_firmy, k.email, k.telefon,
      a.miejscowosc, a.kod_pocztowy, s.kod AS status_kod
    FROM klient k
    JOIN adres a ON k.adres_id = a.id
    JOIN status_klienta s ON k.status_klienta_id = s.id
    ORDER BY k.created_at DESC
  `;
}

// Wywalić null? Jak?
export async function getClientById(id: number): Promise<ClientDetail | null> {
  const raw = await sql`
    SELECT
      k.id, k.nip, k.nazwa_firmy, k.imie, k.nazwisko, k.stanowisko,
      k.email, k.telefon, s.kod AS status_kod,
      a.ulica, a.numer_budynku, a.numer_lokalu,
      a.kod_pocztowy, a.miejscowosc, a.wojewodztwo
    FROM klient k
    JOIN adres a ON k.adres_id = a.id
    JOIN status_klienta s ON k.status_klienta_id = s.id
    WHERE k.id = ${id}
    LIMIT 1
  `;

  if (raw.length === 0) {
    // TODO ZMIEŃ NULLA NA COŚ Z SENSEM
    return null;
  }

  const row = raw[0];
  return {
    id: row.id,
    nip: row.nip,
    nazwa_firmy: row.nazwa_firmy,
    imie: row.imie,
    nazwisko: row.nazwisko,
    stanowisko: row.stanowisko,
    email: row.email,
    telefon: row.telefon,
    status_kod: row.status_kod,
    adres: {
      ulica: row.ulica,
      numer_budynku: row.numer_budynku,
      numer_lokalu: row.numer_lokalu,
      kod_pocztowy: row.kod_pocztowy,
      miejscowosc: row.miejscowosc,
      wojewodztwo: row.wojewodztwo,
    },
  };
}

export async function createAddress(
  adres: Dto.CreateAddressData,
): Promise<number> {
  const adresRows = await sql`
    INSERT INTO adres (
      ulica, numer_budynku, numer_lokalu,
      kod_pocztowy, miejscowosc, wojewodztwo
    )
    VALUES (
      ${adres.ulica ?? null},
      ${adres.numer_budynku},
      ${adres.numer_lokalu ?? null},
      ${adres.kod_pocztowy},
      ${adres.miejscowosc},
      ${adres.wojewodztwo ?? null}
    )
    RETURNING id
  `;
  return adresRows[0].id;
}

export async function createClient(
  client: Dto.CreateClientData,
): Promise<Dto.ClientRow> {
  const clientRows = await sql<Dto.ClientRow[]>`
    INSERT INTO klient (
      nip, nazwa_firmy, imie, nazwisko, stanowisko,
      email, telefon, adres_id, status_klienta_id
    )
    VALUES (
      ${client.nip},
      ${client.nazwa_firmy},
      ${client.imie ?? null},
      ${client.nazwisko ?? null},
      ${client.stanowisko ?? null},
      ${client.email},
      ${client.telefon ?? null},
      ${client.adres_id},
      ${client.status_klienta_id}
    )
    RETURNING *
  `;
  return clientRows[0];
}

export async function getClientWithAddress(
  id: number,
): Promise<Dto.ClientWithAddress | null> {
  const rows = await sql<Dto.ClientWithAddress[]>`
    SELECT
      k.id, k.nip, k.nazwa_firmy, k.imie, k.nazwisko, k.stanowisko,
      k.email, k.telefon, k.status_klienta_id, k.adres_id,
      a.ulica, a.numer_budynku, a.numer_lokalu,
      a.kod_pocztowy, a.miejscowosc, a.wojewodztwo
    FROM klient k
    JOIN adres a ON k.adres_id = a.id
    WHERE k.id = ${id}
    LIMIT 1
  `;

  return rows.length > 0 ? rows[0] : null;
}

export async function updateAddress(
  adresId: number,
  adres: Dto.UpdateAddressData,
): Promise<void> {
  await sql`
    UPDATE adres
    SET
      ulica = ${adres.ulica},
      numer_budynku = ${adres.numer_budynku},
      numer_lokalu = ${adres.numer_lokalu},
      kod_pocztowy = ${adres.kod_pocztowy},
      miejscowosc = ${adres.miejscowosc},
      wojewodztwo = ${adres.wojewodztwo}
    WHERE id = ${adresId}
  `;
}

export async function updateClient(
  id: number,
  client: Dto.UpdateClientData,
): Promise<Dto.ClientRow> {
  const updatedClientRows = await sql<Dto.ClientRow[]>`
    UPDATE klient
    SET
      nip = ${client.nip},
      nazwa_firmy = ${client.nazwa_firmy},
      imie = ${client.imie},
      nazwisko = ${client.nazwisko},
      stanowisko = ${client.stanowisko},
      email = ${client.email},
      telefon = ${client.telefon},
      status_klienta_id = ${client.status_klienta_id}
    WHERE id = ${id}
    RETURNING *
  `;
  return updatedClientRows[0];
}

export async function deleteClient(id: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM klient WHERE id = ${id}
    RETURNING id
  `;
  return result.length > 0;
}
