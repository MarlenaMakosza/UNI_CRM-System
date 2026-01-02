import * as eventRepo from "../repository/eventRepository.ts";
import {
  mapUpsertEventToDbUpsertEvent,
  mapDbEventToEvent,
} from "../mappers/eventMapper.ts";
import {
  DbUpsertEvent,
  Event, UpsertEvent,
} from "../types/index.ts";
import { validateId, ValidationError } from "../utils/clientValidation.ts";
import {
  validateUpsertEvent,
} from "../utils/eventValidation.ts";

/**
 * Pobierz listę wszystkich wydarzeń
 * @param {number} [przedstawicielId] - opcjonalny filtr po ID przedstawiciela (dla pracowników)
 * @returns {Promise<Event[]>} - lista wszystkich wydarzeń
 */
//TODO Niech backend filtruje po przedstawicielu, które wydarzenia ma przekazać
export async function listEvents(przedstawicielId?: number): Promise<Event[]> {
  const dbEvents = await eventRepo.getAllEvents(przedstawicielId);
  return dbEvents.map(mapDbEventToEvent);
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
  return mapDbEventToEvent(dbEvent);
}

/**
 * Tworzy nowe wydarzenie w systemie
 * @param {UpsertEvent} request - dane nowego wydarzenia
 * @returns {Promise<Event>} - utworzone wydarzenie
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export async function createEvent(request: UpsertEvent): Promise<Event> {
  // 1. Walidacja
  validateUpsertEvent(request);

  // 2. Pobierz ID typu zdarzenia
  const typId = await eventRepo.getTypZdarzeniaId(request.details.typ_nazwa);

  // 2a. Waliduj umowa_id jeśli jest podane
  if (request.relations.umowa_id !== undefined && request.relations.umowa_id > 0) {
    const exists = await eventRepo.umowaExists(request.relations.umowa_id);
    if (!exists) {
      throw new ValidationError(`Contract with id=${request.relations.umowa_id} not found`);
    }
  }

  // 3. Mapuj request → NewEvent
  const newEvent = mapUpsertEventToDbUpsertEvent(request, typId);

  // 4. Zapisz w bazie
  const dbEvent = await eventRepo.insertEvent(newEvent);

  // 5. Zwróć w strukturze domenowej
  return mapDbEventToEvent(dbEvent);
}

/**
 * Aktualizuje wydarzenie
 * @param {number} id - ID wydarzenia
 * @param {UpsertEvent} request - pełne dane wydarzenia
 * @returns {Promise<Event>} - zaktualizowane wydarzenie
 * @throws {InvalidInputError} gdy ID jest niepoprawne
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export async function updateEvent(
  id: number,
  request: UpsertEvent,
): Promise<Event> {
  // 1. Waliduj ID
  validateId(id);

  // 2. Sprawdź czy wydarzenie istnieje
  await eventRepo.getEventById(id);

  // 3. Waliduj request
  validateUpsertEvent(request);

  // 4. Pobierz ID typu zdarzenia
  const typId = await eventRepo.getTypZdarzeniaId(request.details.typ_nazwa);

  // 5. Waliduj umowa_id jeśli jest podane
  if (request.relations.umowa_id !== undefined && request.relations.umowa_id > 0) {
    const exists = await eventRepo.umowaExists(request.relations.umowa_id);
    if (!exists) {
      throw new ValidationError(`Contract with id=${request.relations.umowa_id} not found`);
    }
  }

  // 6. Mapuj request
  const newEvent = mapUpsertEventToDbUpsertEvent(request, typId);

  // 7. Zaktualizuj wydarzenie
  const updatedDbEvent = await eventRepo.updateEvent(id, newEvent);
  return mapDbEventToEvent(updatedDbEvent);
}

/**
 * Usuwa wydarzenie
 * @param {number} id - ID wydarzenia
 * @throws {InvalidInputError} gdy ID jest niepoprawne
 */
export async function deleteEvent(id: number): Promise<void> {
  validateId(id);

  // Sprawdź, czy istnieje
  await eventRepo.getEventById(id);

  // Usuń
  await eventRepo.deleteEvent(id);
}
