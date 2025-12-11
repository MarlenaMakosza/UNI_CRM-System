import { sql } from "db";

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
  const client: Client = {
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
      ${adres.numer_lokalu ?? ""},
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
  if (clientRows.length === 0) {
    throw new Error("Failed to create client");
  }
  return clientRows[0].id;
}

export async function updateAddress(adres: Address): Promise<void> {
  const result = await sql`
     UPDATE adres
     SET
       ulica = ${adres.ulica},
       numer_budynku = ${adres.numer_budynku},
       numer_lokalu = ${adres.numer_lokalu ?? ""},
       kod_pocztowy = ${adres.kod_pocztowy},
       miejscowosc = ${adres.miejscowosc},
       wojewodztwo = ${adres.wojewodztwo}
     WHERE id = ${adres.id}
     RETURNING id
   `;

  if (result.length === 0) {
    throw new Error(`Address with id ${adres.id} not found`);
  }
}

export async function updateClient(
  id: number,
  client: NewClient,
): Promise<void> {
  const result = await sql<NewClient[]>`
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
    throw new Error(`Client with id ${id} not found`);
  }
}

export async function deleteClient(id: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM klient WHERE id = ${id}
    RETURNING id
  `;

  if (result.length === 0) {
    throw new ClientNotFoundError(id);
  }

  return true;
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
