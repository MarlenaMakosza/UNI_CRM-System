import {
  CreateEvent,
  DbEventDetails,
  DbEventSummaryRow,
  Event,
  EventSummary,
  NewEvent,
  StatusZdarzenia,
  TypZdarzenia,
} from "../types/index.ts";

/**
 * Konwertuje surowy rekord z bazy (DbEventSummaryRow) na EventSummary
 */
export function dbEventToEventSummary(
  dbEvent: DbEventSummaryRow,
): EventSummary {
  return {
    id: dbEvent.id,
    klient_id: dbEvent.klient_id,
    typ_nazwa: dbEvent.typ_nazwa as TypZdarzenia,
    data_planowana: dbEvent.data_planowana,
    status: dbEvent.status as StatusZdarzenia,
    opis: dbEvent.opis,
  };
}

/**
 * Konwertuje surowy rekord z bazy (DbEventDetails) na Event
 */
export function dbEventDetailsToEvent(dbEvent: DbEventDetails): Event {
  return {
    id: dbEvent.id,
    klient_id: dbEvent.klient_id,
    przedstawiciel_id: dbEvent.przedstawiciel_id,
    typ_nazwa: dbEvent.typ_nazwa as TypZdarzenia,
    umowa_id: dbEvent.umowa_id,
    data_planowana: dbEvent.data_planowana,
    data_realizacji: dbEvent.data_realizacji,
    status: dbEvent.status as StatusZdarzenia,
    opis: dbEvent.opis,
    notatki: dbEvent.notatki,
    created_at: dbEvent.created_at,
  };
}

/**
 * Mapuje CreateEvent na NewEvent dla repository
 */
export function createEventRequestToNewEvent(
  request: CreateEvent,
  typId: number,
): NewEvent {
  return {
    klient_id: request.klient_id,
    przedstawiciel_id: request.przedstawiciel_id,
    typ_id: typId,
    umowa_id: request.umowa_id || 0,
    data_planowana: request.data_planowana,
    data_realizacji: request.data_realizacji || "",
    status: request.status,
    opis: request.opis,
    notatki: request.notatki || "",
  };
}
