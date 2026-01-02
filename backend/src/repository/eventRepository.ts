import { sql } from "db";
import { DbEvent, NewEvent } from "../types/database.ts";

/**
 * Pobierz listę wszystkich wydarzeń (pełne dane)
 * @param {number} [przedstawicielId] - opcjonalny filtr po ID przedstawiciela (dla pracowników)
 * @returns {Promise<DbEvent[]>} - lista wszystkich wydarzeń
 */
export function getAllEvents(przedstawicielId?: number): Promise<DbEvent[]> {
  if (przedstawicielId !== undefined) {
    // Filtruj wydarzenia tylko dla konkretnego przedstawiciela
    return sql<DbEvent[]>`
      SELECT
        z.id, z.klient_id, z.przedstawiciel_id, z.typ_id, z.umowa_id,
        COALESCE(z.data_planowana::TEXT, '') AS data_planowana,
        COALESCE(z.data_realizacji::TEXT, '') AS data_realizacji,
        z.status, z.opis, z.notatki,
        z.created_at::TEXT AS created_at,
        t.nazwa AS typ_nazwa,
        COALESCE(z.umowa_id, 0) AS umowa_id
      FROM zdarzenie z
      JOIN typ_zdarzenia t ON z.typ_id = t.id
      WHERE z.przedstawiciel_id = ${przedstawicielId}
      ORDER BY z.id DESC
    `;
  }

  // Bez filtra - wszystkie wydarzenia (dla szefa)
  return sql<DbEvent[]>`
    SELECT
      z.id, z.klient_id, z.przedstawiciel_id, z.typ_id, z.umowa_id,
      COALESCE(z.data_planowana::TEXT, '') AS data_planowana,
      COALESCE(z.data_realizacji::TEXT, '') AS data_realizacji,
      z.status, z.opis, z.notatki,
      z.created_at::TEXT AS created_at,
      t.nazwa AS typ_nazwa,
      COALESCE(z.umowa_id, 0) AS umowa_id
    FROM zdarzenie z
    JOIN typ_zdarzenia t ON z.typ_id = t.id
    ORDER BY z.id DESC
  `;
}

/**
 * Pobierz wydarzenie po jego ID
 * @param {number} id - ID wydarzenia
 * @returns {Promise<DbEvent>} - surowe dane wydarzenia z bazy
 * @throws Error gdy wydarzenie nie istnieje
 */
export async function getEventById(id: number): Promise<DbEvent> {
  const events = await sql<DbEvent[]>`
    SELECT
      z.id, z.klient_id, z.przedstawiciel_id, z.typ_id, z.umowa_id,
      COALESCE(z.data_planowana::TEXT, '') AS data_planowana,
      COALESCE(z.data_realizacji::TEXT, '') AS data_realizacji,
      z.status, z.opis, z.notatki,
      z.created_at::TEXT AS created_at,
      t.nazwa AS typ_nazwa,
      COALESCE(z.umowa_id, 0) AS umowa_id
    FROM zdarzenie z
    JOIN typ_zdarzenia t ON z.typ_id = t.id
    WHERE z.id = ${id}
    LIMIT 1
  `;

  if (events.length === 0) {
    throw new Error(`Event with id=${id} not found`);
  }

  return events[0];
}

/**
 * Pobierz ID typu zdarzenia po nazwie
 * @param {string} typNazwa - nazwa typu zdarzenia
 * @returns {Promise<number>} - ID typu zdarzenia
 * @throws Error gdy typ nie istnieje
 */
export async function getTypZdarzeniaId(typNazwa: string): Promise<number> {
  const result = await sql<{ id: number }[]>`
    SELECT id FROM typ_zdarzenia WHERE nazwa = ${typNazwa} LIMIT 1
  `;

  if (result.length === 0) {
    throw new Error(`Event type '${typNazwa}' not found`);
  }

  return result[0].id;
}

/**
 * Dodaj nowe wydarzenie do bazy
 * @param {NewEvent} event - dane nowego wydarzenia
 * @returns {Promise<DbEvent>} - utworzone wydarzenie
 */
export async function insertEvent(event: NewEvent): Promise<DbEvent> {
  // Konwersja pustych stringów na NULL dla timestampów
  const dataPlanowana = event.data_planowana || null;
  const dataRealizacji = event.data_realizacji || null;
  const umowaId = event.umowa_id === 0 ? null : event.umowa_id;

  const result = await sql<{ id: number }[]>`
    INSERT INTO zdarzenie (
      klient_id, przedstawiciel_id, typ_id, umowa_id,
      data_planowana, data_realizacji, status, opis, notatki
    ) VALUES (
      ${event.klient_id}, ${event.przedstawiciel_id}, ${event.typ_id}, ${umowaId},
      ${dataPlanowana}, ${dataRealizacji}, ${event.status}, ${event.opis}, ${event.notatki}
    )
    RETURNING id
  `;

  return await getEventById(result[0].id);
}

/**
 * Aktualizuj wydarzenie
 * @param {number} id - ID wydarzenia
 * @param {NewEvent} event - pełne dane wydarzenia (już zmergowane)
 * @returns {Promise<DbEvent>} - zaktualizowane wydarzenie
 */
export async function updateEvent(
  id: number,
  event: NewEvent,
): Promise<DbEvent> {
  // Konwersja pustych stringów na NULL dla timestampów
  const dataPlanowana = event.data_planowana || null;
  const dataRealizacji = event.data_realizacji || null;
  const umowaId = event.umowa_id === 0 ? null : event.umowa_id;

  await sql`
    UPDATE zdarzenie
    SET
      klient_id = ${event.klient_id},
      przedstawiciel_id = ${event.przedstawiciel_id},
      typ_id = ${event.typ_id},
      umowa_id = ${umowaId},
      data_planowana = ${dataPlanowana},
      data_realizacji = ${dataRealizacji},
      status = ${event.status},
      opis = ${event.opis},
      notatki = ${event.notatki}
    WHERE id = ${id}
  `;

  return await getEventById(id);
}

/**
 * Usuń wydarzenie
 * @param {number} id - ID wydarzenia
 */
export async function deleteEvent(id: number): Promise<void> {
  await sql`DELETE FROM zdarzenie WHERE id = ${id}`;
}
