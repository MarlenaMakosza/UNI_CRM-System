import { CreateEvent, UpdateEvent } from "../types/index.ts";
import { getTypZdarzeniaId } from "../repository/eventRepository.ts";
import { InvalidInputError, ValidationError } from "./validation.ts";

/**
 * Walidacja główna dla tworzenia nowego wydarzenia
 */
export async function validateCreateEvent(
  data: CreateEvent,
): Promise<void> {
  validateRequiredEventFields(data);
  validateEventDates(data.data_planowana, data.data_realizacji);
  await validateTypZdarzeniaExists(data.typ_nazwa);
}

/**
 * Sprawdź czy wszystkie wymagane pola są wypełnione
 */
function validateRequiredEventFields(data: CreateEvent): void {
  if (!data.klient_id || data.klient_id <= 0) {
    throw new ValidationError("klient_id is required and must be > 0");
  }

  if (!data.przedstawiciel_id || data.przedstawiciel_id <= 0) {
    throw new ValidationError("przedstawiciel_id is required and must be > 0");
  }

  if (!data.typ_nazwa || data.typ_nazwa.trim() === "") {
    throw new ValidationError("typ_nazwa is required");
  }

  if (!data.data_planowana || data.data_planowana.trim() === "") {
    throw new ValidationError("data_planowana is required");
  }

  if (!data.status || data.status.trim() === "") {
    throw new ValidationError("status is required");
  }

  if (!data.opis || data.opis.trim() === "") {
    throw new ValidationError("opis is required");
  }
}

/**
 * Walidacja dat (czy są w poprawnym formacie ISO)
 */
function validateEventDates(
  data_planowana?: string,
  data_realizacji?: string,
): void {
  if (data_planowana && data_planowana !== "") {
    const date = new Date(data_planowana);
    if (isNaN(date.getTime())) {
      throw new ValidationError("data_planowana must be valid ISO 8601 date");
    }
  }

  if (data_realizacji && data_realizacji !== "") {
    const date = new Date(data_realizacji);
    if (isNaN(date.getTime())) {
      throw new ValidationError("data_realizacji must be valid ISO 8601 date");
    }
  }
}

/**
 * Sprawdź czy typ zdarzenia istnieje w bazie
 */
async function validateTypZdarzeniaExists(typ_nazwa: string): Promise<void> {
  try {
    await getTypZdarzeniaId(typ_nazwa);
  } catch {
    throw new ValidationError(`Unknown typ_nazwa: ${typ_nazwa}`);
  }
}

/**
 * Walidacja dla częściowej aktualizacji wydarzenia (PATCH)
 */
export async function validateUpdateEvent(
  data: UpdateEvent,
): Promise<void> {
  // Waliduj ID-ki jeśli zostały podane
  if (data.klient_id !== undefined && data.klient_id <= 0) {
    throw new ValidationError("klient_id must be > 0");
  }

  if (data.przedstawiciel_id !== undefined && data.przedstawiciel_id <= 0) {
    throw new ValidationError("przedstawiciel_id must be > 0");
  }

  // Waliduj typ zdarzenia jeśli został podany
  if (data.typ_nazwa) {
    await validateTypZdarzeniaExists(data.typ_nazwa);
  }

  // Waliduj daty jeśli zostały podane
  validateEventDates(data.data_planowana, data.data_realizacji);

  // Sprawdź czy opis nie jest pusty jeśli został podany
  if (data.opis !== undefined && data.opis.trim() === "") {
    throw new ValidationError("opis cannot be empty");
  }
}
