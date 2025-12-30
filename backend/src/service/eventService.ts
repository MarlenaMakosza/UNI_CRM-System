import * as eventRepo from "../repository/eventRepository.ts";
import {
  createEventRequestToNewEvent,
  dbEventDetailsToEvent,
  dbEventToEventSummary,
} from "../mappers/eventMapper.ts";

import {
  AuthUser,
  CreateEvent,
  Event,
  EventSummary,
  NewEvent,
  UpdateEvent,
} from "../types/index.ts";
import { validateId } from "../utils/validation.ts";
import {
  validateCreateEvent,
  validateUpdateEvent,
} from "../utils/eventValidation.ts";

/**
 * Pobierz listę wszystkich wydarzeń (z filtrowaniem po roli)
 * @param user - zalogowany użytkownik (z auth middleware)
 */
export async function listEvents(user: AuthUser): Promise<EventSummary[]> {
  const dbEvents = await eventRepo.getAllEvents();

  // Jeśli pracownik - pokaż tylko jego wydarzenia
  if (user.rola === "pracownik") {
    const filtered = dbEvents.filter(e => e.przedstawiciel_id === user.id);
    return filtered.map(dbEventToEventSummary);
  }

  // Jeśli szef - pokaż wszystkie
  return dbEvents.map(dbEventToEventSummary);
}

/**
 * Pobierz pełne dane wydarzenia o podanym ID
 */
export async function getEventDetails(id: number): Promise<Event> {
  validateId(id);
  const dbEvent = await eventRepo.getEventById(id);
  return dbEventDetailsToEvent(dbEvent);
}

/**
 * Tworzy nowe wydarzenie w systemie
 */
export async function createEvent(request: CreateEvent): Promise<Event> {
  // 1. Walidacja
  await validateCreateEvent(request);

  // 2. Pobierz typ_id
  const typId = await eventRepo.getTypZdarzeniaId(request.typ_nazwa);

  // 3. Utwórz wydarzenie
  const newEvent = createEventRequestToNewEvent(request, typId);
  const eventId = await eventRepo.createEvent(newEvent);

  // 4. Pobierz utworzone wydarzenie z bazy i zmapuj
  const dbEvent = await eventRepo.getEventById(eventId);
  return dbEventDetailsToEvent(dbEvent);
}

/**
 * Częściowa aktualizacja wydarzenia (PATCH)
 */
export async function updateEvent(
  id: number,
  updateData: UpdateEvent,
): Promise<Event> {
  // 1. Waliduj ID
  validateId(id);

  // 2. Pobierz obecne wydarzenie z bazy
  const dbEvent = await eventRepo.getEventById(id);

  // 3. Waliduj update request
  await validateUpdateEvent(updateData);

  // 4. Pobierz typ_id jeśli zmieniono typ
  const typId = updateData.typ_nazwa
    ? await eventRepo.getTypZdarzeniaId(updateData.typ_nazwa)
    : dbEvent.typ_id;

  // 5. Zmerguj dane
  const mergedEvent: NewEvent = {
    klient_id: updateData.klient_id ?? dbEvent.klient_id,
    przedstawiciel_id: updateData.przedstawiciel_id ??
      dbEvent.przedstawiciel_id,
    typ_id: typId,
    umowa_id: updateData.umowa_id !== undefined
      ? updateData.umowa_id
      : dbEvent.umowa_id,
    data_planowana: updateData.data_planowana ?? dbEvent.data_planowana,
    data_realizacji: updateData.data_realizacji ?? dbEvent.data_realizacji,
    status: updateData.status ?? dbEvent.status,
    opis: updateData.opis ?? dbEvent.opis,
    notatki: updateData.notatki ?? dbEvent.notatki,
  };

  // 6. Zaktualizuj wydarzenie
  await eventRepo.updateEvent(id, mergedEvent);

  // 7. Pobierz zaktualizowane wydarzenie
  const updatedDbEvent = await eventRepo.getEventById(id);
  return dbEventDetailsToEvent(updatedDbEvent);
}

/**
 * Usuwa wydarzenie z systemu
 * Operacja idempotentna
 */
export async function removeEvent(id: number): Promise<void> {
  validateId(id);
  await eventRepo.deleteEvent(id);
}
