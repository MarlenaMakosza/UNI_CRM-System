import { sql } from "db";
import {
  DbEventDetails,
  DbEventSummaryRow,
  NewEvent,
} from "../types/index.ts";
import { EventNotFoundError } from "../utils/errorHandler.ts";

/**
 * Pobierz wszystkie wydarzenia (uproszczona lista)
 */
export async function getAllEvents(): Promise<DbEventSummaryRow[]> {
  const rows = await sql<DbEventSummaryRow[]>`
    SELECT
      z.id,
      z.klient_id,
      z.przedstawiciel_id,
      tz.nazwa as typ_nazwa,
      COALESCE(z.data_planowana::text, '') as data_planowana,
      z.status,
      z.opis
    FROM zdarzenie z
    JOIN typ_zdarzenia tz ON z.typ_id = tz.id
    ORDER BY z.data_planowana DESC, z.id DESC
  `;
  return rows;
}

/**
 * Pobierz pełne dane wydarzenia o podanym ID
 */
export async function getEventById(id: number): Promise<DbEventDetails> {
  const rows = await sql<DbEventDetails[]>`
    SELECT
      z.id,
      z.klient_id,
      z.przedstawiciel_id,
      z.typ_id,
      tz.nazwa as typ_nazwa,
      COALESCE(z.umowa_id, 0) as umowa_id,
      COALESCE(z.data_planowana::text, '') as data_planowana,
      COALESCE(z.data_realizacji::text, '') as data_realizacji,
      z.status,
      COALESCE(z.opis, '') as opis,
      COALESCE(z.notatki, '') as notatki,
      z.created_at::text as created_at
    FROM zdarzenie z
    JOIN typ_zdarzenia tz ON z.typ_id = tz.id
    WHERE z.id = ${id}
    LIMIT 1
  `;

  if (rows.length === 0) {
    throw new EventNotFoundError(id);
  }

  return rows[0];
}

/**
 * Utwórz nowe wydarzenie
 */
export async function createEvent(event: NewEvent): Promise<number> {
  const umowa_id_value = event.umowa_id === 0 ? null : event.umowa_id;
  const data_planowana_value = event.data_planowana === "" ? null : event.data_planowana;
  const data_realizacji_value = event.data_realizacji === "" ? null : event.data_realizacji;

  const result = await sql<{ id: number }[]>`
    INSERT INTO zdarzenie (
      klient_id,
      przedstawiciel_id,
      typ_id,
      umowa_id,
      data_planowana,
      data_realizacji,
      status,
      opis,
      notatki
    ) VALUES (
      ${event.klient_id},
      ${event.przedstawiciel_id},
      ${event.typ_id},
      ${umowa_id_value},
      ${data_planowana_value},
      ${data_realizacji_value},
      ${event.status},
      ${event.opis},
      ${event.notatki}
    )
    RETURNING id
  `;

  return result[0].id;
}

/**
 * Aktualizuje wydarzenie o podanym ID
 */
export async function updateEvent(
  id: number,
  event: NewEvent,
): Promise<void> {
  const umowa_id_value = event.umowa_id === 0 ? null : event.umowa_id;
  const data_planowana_value = event.data_planowana === "" ? null : event.data_planowana;
  const data_realizacji_value = event.data_realizacji === "" ? null : event.data_realizacji;

  const result = await sql<{ id: number }[]>`
    UPDATE zdarzenie
    SET
      klient_id = ${event.klient_id},
      przedstawiciel_id = ${event.przedstawiciel_id},
      typ_id = ${event.typ_id},
      umowa_id = ${umowa_id_value},
      data_planowana = ${data_planowana_value},
      data_realizacji = ${data_realizacji_value},
      status = ${event.status},
      opis = ${event.opis},
      notatki = ${event.notatki}
    WHERE id = ${id}
    RETURNING id
  `;

  if (result.length === 0) {
    throw new Error(`Event with id ${id} not found`);
  }
}

/**
 * Usuwa wydarzenie o podanym ID
 * Operacja idempotentna
 */
export async function deleteEvent(id: number): Promise<void> {
  await sql`DELETE FROM zdarzenie WHERE id = ${id}`;
}

/**
 * Pobierz ID typu zdarzenia na podstawie nazwy
 */
export async function getTypZdarzeniaId(nazwa: string): Promise<number> {
  const rows = await sql<{ id: number }[]>`
    SELECT id FROM typ_zdarzenia
    WHERE nazwa = ${nazwa}
    LIMIT 1
  `;

  if (rows.length === 0) {
    throw new Error(`Typ zdarzenia '${nazwa}' not found`);
  }

  return rows[0].id;
}
