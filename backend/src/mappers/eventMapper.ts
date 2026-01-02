import {
  CreateEvent,
  DbEvent,
  Event,
  EventDetails,
  EventMetadata,
  EventRelations,
  EventSchedule,
  NewEvent,
  StatusZdarzenia,
  TypZdarzenia,
} from "../types/index.ts";

/**
 * Konwertuje surowy rekord z bazy (DbEvent) na strukturę Event
 * @param dbEvent - surowe dane z bazy
 * @returns Event - zagnieżdżona struktura domenowa
 */
export function dbEventToEvent(dbEvent: DbEvent): Event {
  const eventMetadata: EventMetadata = {
    id: dbEvent.id,
    created_at: dbEvent.created_at,
  };

  const relations: EventRelations = {
    klient_id: dbEvent.klient_id,
    przedstawiciel_id: dbEvent.przedstawiciel_id,
    umowa_id: dbEvent.umowa_id,
  };

  const details: EventDetails = {
    typ_nazwa: dbEvent.typ_nazwa as TypZdarzenia,
    status: dbEvent.status as StatusZdarzenia,
    opis: dbEvent.opis,
    notatki: dbEvent.notatki,
  };

  const schedule: EventSchedule = {
    data_planowana: dbEvent.data_planowana,
    data_realizacji: dbEvent.data_realizacji,
  };

  return {
    event_metadata: eventMetadata,
    relations: relations,
    details: details,
    schedule: schedule,
  };
}

/**
 * Mapuje CreateEvent na NewEvent dla repository
 * @param request - request z zagnieżdżoną strukturą
 * @param typId - ID typu zdarzenia z bazy (FK)
 * @returns NewEvent - płaska struktura dla INSERT do bazy
 */
export function createEventToNewEvent(
  request: CreateEvent,
  typId: number,
): NewEvent {
  return {
    klient_id: request.relations.klient_id,
    przedstawiciel_id: request.relations.przedstawiciel_id,
    typ_id: typId,
    umowa_id: request.relations.umowa_id ?? 0,
    data_planowana: request.schedule.data_planowana, // Wymagane
    data_realizacji: request.schedule.data_realizacji ?? "", // Opcjonalne
    status: request.details.status ?? "zaplanowane",
    opis: request.details.opis,
    notatki: request.details.notatki ?? "",
  };
}
