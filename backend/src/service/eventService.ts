import * as eventRepo from "../repository/eventRepository.ts";
import {
  createEventToNewEvent,
  dbEventToEvent,
} from "../mappers/eventMapper.ts";
import {
  CreateEvent,
  Event,
  NewEvent,
  UpdateEvent,
} from "../types/index.ts";
import { validateId } from "../utils/validation.ts";
import {
  validateCreateEvent,
  validateUpdateEvent,
} from "../utils/eventValidation.ts";

/**
 * Pobierz listę wszystkich wydarzeń
 * @param {number} [przedstawicielId] - opcjonalny filtr po ID przedstawiciela (dla pracowników)
 * @returns {Promise<Event[]>} - lista wszystkich wydarzeń
 */
export async function listEvents(przedstawicielId?: number): Promise<Event[]> {
  const dbEvents = await eventRepo.getAllEvents(przedstawicielId);
  return dbEvents.map(dbEventToEvent);
}

/**
 * Pobierz pełne dane wydarzenia o podanym ID
 * @param {number} id - ID wydarzenia
 * @returns {Promise<Event>} - pełne dane wydarzenia
 * @throws {InvalidInputError} gdy ID jest niepoprawne
 * @throws Error gdy wydarzenie nie istnieje
 */
export async function getEventDetails(id: number): Promise<Event> {
  validateId(id);
  const dbEvent = await eventRepo.getEventById(id);
  return dbEventToEvent(dbEvent);
}

/**
 * Tworzy nowe wydarzenie w systemie
 * @param {CreateEvent} request - dane nowego wydarzenia
 * @returns {Promise<Event>} - utworzone wydarzenie
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export async function createEvent(request: CreateEvent): Promise<Event> {
  // 1. Walidacja
  validateCreateEvent(request);

  // 2. Pobierz ID typu zdarzenia
  const typId = await eventRepo.getTypZdarzeniaId(request.details.typ_nazwa);

  // 3. Mapuj request → NewEvent
  const newEvent = createEventToNewEvent(request, typId);

  // 4. Zapisz w bazie
  const dbEvent = await eventRepo.insertEvent(newEvent);

  // 5. Zwróć w strukturze domenowej
  return dbEventToEvent(dbEvent);
}

/**
 * Aktualizuje wydarzenie (PATCH - częściowa aktualizacja)
 * @param {number} id - ID wydarzenia
 * @param {UpdateEvent} request - pola do aktualizacji
 * @returns {Promise<Event>} - zaktualizowane wydarzenie
 * @throws {InvalidInputError} gdy ID jest niepoprawne
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export async function updateEvent(
  id: number,
  request: UpdateEvent,
): Promise<Event> {
  // 1. Waliduj ID
  validateId(id);

  // 2. Pobierz obecne wydarzenie z bazy
  const dbEvent = await eventRepo.getEventById(id);

  // 3. Waliduj update request
  validateUpdateEvent(request);

  // 4. Pobierz typ_id jeśli typ się zmienił
  const typId: number = request.details?.typ_nazwa
    ? await eventRepo.getTypZdarzeniaId(request.details.typ_nazwa)
    : dbEvent.typ_id;

  // 5. Zmerguj dane wydarzenia
  const mergedEvent: NewEvent = {
    klient_id: request.relations?.klient_id ?? dbEvent.klient_id,
    przedstawiciel_id: request.relations?.przedstawiciel_id ??
      dbEvent.przedstawiciel_id,
    typ_id: typId,
    umowa_id: request.relations?.umowa_id ?? dbEvent.umowa_id,
    data_planowana: request.schedule?.data_planowana ?? dbEvent.data_planowana,
    data_realizacji: request.schedule?.data_realizacji ??
      dbEvent.data_realizacji,
    status: request.details?.status ?? dbEvent.status,
    opis: request.details?.opis ?? dbEvent.opis,
    notatki: request.details?.notatki ?? dbEvent.notatki,
  };

  // 6. Zaktualizuj wydarzenie
  const updatedDbEvent = await eventRepo.updateEvent(id, mergedEvent);
  return dbEventToEvent(updatedDbEvent);
}

/**
 * Usuwa wydarzenie
 * @param {number} id - ID wydarzenia
 * @throws {InvalidInputError} gdy ID jest niepoprawne
 */
export async function deleteEvent(id: number): Promise<void> {
  validateId(id);

  // Sprawdź czy istnieje
  await eventRepo.getEventById(id);

  // Usuń
  await eventRepo.deleteEvent(id);
}
