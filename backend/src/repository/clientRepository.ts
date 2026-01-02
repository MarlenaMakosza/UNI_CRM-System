import { sql } from "db";

import {
  DbClient,
  DbUpsertAddress,
  DbUpsertClient,
} from "../types/database.ts";
import { ClientNotFoundError } from "../utils/errorHandler.ts";

/**
 * Pobierz listę wszystkich klientów
 * @returns {Promise<DbClient[]>} - lista wszystkich klientów
 */
export function getAllClients(): Promise<DbClient[]> {
  return sql<DbClient[]>`
    SELECT
      k.id, k.nip, k.nazwa_firmy, k.imie, k.nazwisko, k.stanowisko,
      k.email, k.telefon, k.created_at, s.kod AS status_kod,
      a.id AS adres_id, a.ulica, a.numer_budynku, a.numer_lokalu,
      a.kod_pocztowy, a.miejscowosc, a.wojewodztwo
    FROM klient k
    JOIN adres a ON k.adres_id = a.id
    JOIN status_klienta s ON k.status_klienta_id = s.id
    ORDER BY k.id DESC
  `;
}

/**
 * Pobierz klienta po jego ID
 * @param {number} id - ID klienta
 * @returns {Promise<DbClient>} - surowe dane klienta z bazy
 * @throws {ClientNotFoundError} - jeśli klient nie istnieje
 */
export async function getClientById(id: number): Promise<DbClient> {
  const raw = await sql<DbClient[]>`
    SELECT
      k.id, k.nip, k.nazwa_firmy, k.imie, k.nazwisko, k.stanowisko,
      k.email, k.telefon, k.created_at, s.kod AS status_kod,
      a.id AS adres_id, a.ulica, a.numer_budynku, a.numer_lokalu,
      a.kod_pocztowy, a.miejscowosc, a.wojewodztwo
    FROM klient k
    JOIN adres a ON k.adres_id = a.id
    JOIN status_klienta s ON k.status_klienta_id = s.id
    WHERE k.id = ${id}
    LIMIT 1
  `;

  if (raw.length === 0) {
    throw new ClientNotFoundError(id);
  }

  return raw[0];
}

/**
 * Tworzy nowy rekord w tabeli `adres`
 * @param {DbUpsertAddress} adres - dane nowego adresu
 * @returns {Promise<number>} - ID nowo utworzonego rekordu
 */
export async function createAddress(
  adres: DbUpsertAddress,
): Promise<number> {
  const adresRows = await sql<{ id: number }[]>`
    INSERT INTO adres (
      ulica, numer_budynku, numer_lokalu,
      kod_pocztowy, miejscowosc, wojewodztwo
    )
    VALUES (
      ${adres.ulica},
      ${adres.numer_budynku},
      ${adres.numer_lokalu},
      ${adres.kod_pocztowy},
      ${adres.miejscowosc},
      ${adres.wojewodztwo}
    )
    RETURNING id
  `;

  if (adresRows.length === 0) {
    throw new Error("Failed to create address");
  }

  return adresRows[0].id;
}

/**
 * Tworzy nowy rekord w tabeli `klient`
 * @param {DbUpsertClient} client - dane nowego klienta
 * @returns {Promise<number>} - ID utworzonego klienta
 */
export async function createClient(
  client: DbUpsertClient,
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
  if (clientRows.length === 0) {
    throw new Error("Failed to create client");
  }
  return clientRows[0].id;
}

/**
 * Aktualizuje adres o podanym ID
 * @param {number} id - ID adresu do aktualizacji
 * @param {DbUpsertAddress} adres - nowe dane adresu
 * @returns {Promise<void>}
 * @throws {Error} jeśli adres nie istnieje
 */
export async function updateAddress(
  id: number,
  adres: DbUpsertAddress,
): Promise<void> {
  const result = await sql`
     UPDATE adres
     SET
       ulica = ${adres.ulica},
       numer_budynku = ${adres.numer_budynku},
       numer_lokalu = ${adres.numer_lokalu},
       kod_pocztowy = ${adres.kod_pocztowy},
       miejscowosc = ${adres.miejscowosc},
       wojewodztwo = ${adres.wojewodztwo}
     WHERE id = ${id}
     RETURNING id
   `;

  if (result.length === 0) {
    throw new Error(`Address with id ${id} not found`);
  }
}

/**
 * Aktualizuje klienta o podanym ID
 * @param {number} id - ID klienta do aktualizacji
 * @param {DbUpsertClient} client - nowe dane klienta
 * @returns {Promise<void>}
 * @throws {Error} jeśli klient nie istnieje
 */
export async function updateClient(
  id: number,
  client: DbUpsertClient,
): Promise<void> {
  const result = await sql<{ id: number }[]>`
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
    RETURNING id
  `;
  if (result.length === 0) {
    throw new ClientNotFoundError(id);
  }
}

export async function getStatusId(status_kod: string): Promise<number> {
  const statusRows = await sql`
    SELECT id FROM status_klienta
    WHERE kod = ${status_kod}
    LIMIT 1
  `;
  if (statusRows.length === 0) {
    throw new Error(`Status with code '${status_kod}' not found`);
  }

  return statusRows[0].id;
}

/**
 * Usuwa klienta o podanym ID z bazy
 * Operacja jest idempotentna - jeśli klient nie istnieje, nic się nie stanie
 * @param {number} id - ID klienta do usunięcia
 * @returns {Promise<void>}
 * @throws {Error} jeśli klient ma powiązane zdarzenia lub umowy (FK constraint violation)
 */
export async function deleteClient(id: number): Promise<void> {
  await sql`DELETE FROM klient WHERE id = ${id}`;
}

// Sprawdź czy NIP już istnieje
export async function checkNipExists(
  nip: string,
  excludeId?: number,
): Promise<boolean> {
  if (excludeId) {
    const result = await sql`
      SELECT id FROM klient WHERE nip = ${nip} AND id != ${excludeId} LIMIT 1
    `;
    return result.length > 0;
  }

  const result = await sql`
    SELECT id FROM klient WHERE nip = ${nip} LIMIT 1
  `;
  return result.length > 0;
}
