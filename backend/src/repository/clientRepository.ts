import { sql } from "db";
import * as Dto from "../dto/dto.ts";

import { Address, Client, NewClient } from "../types/index.ts";
import { ClientNotFoundError } from "../utils/errorHandler.ts";

/**
 * Pobierz listę wszystkich klientów
 * @returns {Promise<Client[]>} - lista wszystkich klientów
 */
export function getAllClients(): Promise<Client[]> {
  return sql<Client[]>`
    SELECT
      k.id, k.nip, k.nazwa_firmy, k.email, k.telefon,
      a.miejscowosc, a.kod_pocztowy, s.kod AS status_kod
    FROM klient k
    JOIN adres a ON k.adres_id = a.id
    JOIN status_klienta s ON k.status_klienta_id = s.id
    ORDER BY k.created_at DESC
  `;
}

/**
 * Pobierz klienta po jego ID
 * @param {number} id - ID klienta
 * @returns {Promise<Client>} - Klient o podanym ID lub null, jeśli klient nie istnieje
 * @throws {ClientNotFoundError} - jeśli klient nie istnieje
 */
export async function getClientById(id: number): Promise<Client> {
  const raw = await sql`
    SELECT
      k.id, k.nip, k.nazwa_firmy, k.imie, k.nazwisko, k.stanowisko,
      k.email, k.telefon, k.created_at, s.kod AS status_kod,
      a.ulica, a.numer_budynku, a.numer_lokalu,
      a.kod_pocztowy, a.miejscowosc, a.wojewodztwo, a.id AS adres_id
    FROM klient k
    JOIN adres a ON k.adres_id = a.id
    JOIN status_klienta s ON k.status_klienta_id = s.id
    WHERE k.id = ${id}
    LIMIT 1
  `;

  if (raw.length === 0) {
    throw new ClientNotFoundError(id);
  }

  const rawClient = raw[0];
  console.log(rawClient);
  const client = {
    id: rawClient.id,
    nip: rawClient.nip,
    nazwa_firmy: rawClient.nazwa_firmy,
    imie: rawClient.imie,
    nazwisko: rawClient.nazwisko,
    stanowisko: rawClient.stanowisko,
    email: rawClient.email,
    telefon: rawClient.telefon,
    status_kod: rawClient.status_kod,
    created_at: rawClient.created_at,
    adres: {
      id: rawClient.adres_id,
      ulica: rawClient.ulica,
      numer_budynku: rawClient.numer_budynku,
      numer_lokalu: rawClient.numer_lokalu,
      kod_pocztowy: rawClient.kod_pocztowy,
      miejscowosc: rawClient.miejscowosc,
      wojewodztwo: rawClient.wojewodztwo,
    },
  };
  return client;
}

/**
 * Tworzy nowy rekord w tabeli `adres` z danymi wartościami
 * @param {Address} adres - obiekt z danymi wartościami
 * @returns {Promise<number>} - ID nowo utworzonego rekordu
 */
export async function createAddress(
  adres: Address,
): Promise<number> {
  const adresRows = await sql`
    INSERT INTO adres (
      ulica, numer_budynku, numer_lokalu,
      kod_pocztowy, miejscowosc, wojewodztwo
    )
    VALUES (
      ${adres.ulica},
      ${adres.numer_budynku},
      ${adres.numer_lokalu ?? null},
      ${adres.kod_pocztowy},
      ${adres.miejscowosc},
      ${adres.wojewodztwo}
    )
    RETURNING id
  `;
  return adresRows[0].id;
}

/**
 * Tworzy nowy rekord w tabeli `klient`
 * @param {NewClient} client - dane nowego klienta
 * @returns {Promise<number>} - ID utworzonego klienta
 */
export async function createClient(
  client: NewClient,
): Promise<number> {
  const clientRows = await sql<{ id: number }[]>`
    INSERT INTO klient (
      nip, nazwa_firmy, imie, nazwisko, stanowisko,
      email, telefon, adres_id, status_klienta_id
    )
    VALUES (
      ${client.nip},
      ${client.nazwa_firmy},
      ${client.imie},
      ${client.nazwisko},
      ${client.stanowisko},
      ${client.email},
      ${client.telefon},
      ${client.adres_id},
      ${client.status_klienta_id}
    )
    RETURNING id
  `;
  return clientRows[0].id;
}

export async function getClientWithAddress(
  id: number,
): Promise<Client> {
  const rows = await sql<Client[]>`
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

  if (rows.length === 0) {
    throw new ClientNotFoundError(id);
  }
  return rows[0];
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
