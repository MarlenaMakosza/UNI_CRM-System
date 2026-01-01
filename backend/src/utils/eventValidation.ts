import { CreateEvent, UpdateEvent } from "../types/index.ts";
import { ValidationError } from "./validation.ts";

/**
 * Walidacja dla tworzenia nowego wydarzenia
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export function validateCreateEvent(data: CreateEvent): void {
  // Walidacja relations
  if (!data.relations) {
    throw new ValidationError("Missing required field: relations");
  }

  if (!data.relations.klient_id || data.relations.klient_id <= 0) {
    throw new ValidationError("Invalid or missing field: relations.klient_id");
  }

  if (!data.relations.przedstawiciel_id || data.relations.przedstawiciel_id <= 0) {
    throw new ValidationError(
      "Invalid or missing field: relations.przedstawiciel_id",
    );
  }

  // Walidacja details
  if (!data.details) {
    throw new ValidationError("Missing required field: details");
  }

  if (!data.details.typ_nazwa || data.details.typ_nazwa.trim() === "") {
    throw new ValidationError("Missing or empty field: details.typ_nazwa");
  }

  if (!data.details.opis || data.details.opis.trim() === "") {
    throw new ValidationError("Missing or empty field: details.opis");
  }

  // Walidacja schedule (opcjonalne)
  if (!data.schedule) {
    throw new ValidationError("Missing required field: schedule");
  }
}

/**
 * Walidacja dla aktualizacji wydarzenia (PATCH)
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export function validateUpdateEvent(data: UpdateEvent): void {
  // Sprawdź czy przynajmniej jedno pole do update
  const hasRelations = data.relations &&
    (data.relations.klient_id !== undefined ||
      data.relations.przedstawiciel_id !== undefined ||
      data.relations.umowa_id !== undefined);

  const hasDetails = data.details &&
    (data.details.typ_nazwa !== undefined ||
      data.details.status !== undefined ||
      data.details.opis !== undefined ||
      data.details.notatki !== undefined);

  const hasSchedule = data.schedule &&
    (data.schedule.data_planowana !== undefined ||
      data.schedule.data_realizacji !== undefined);

  if (!hasRelations && !hasDetails && !hasSchedule) {
    throw new ValidationError("No fields to update");
  }

  // Walidacja wartości jeśli podano
  if (data.relations?.klient_id !== undefined && data.relations.klient_id <= 0) {
    throw new ValidationError("Invalid field: relations.klient_id");
  }

  if (
    data.relations?.przedstawiciel_id !== undefined &&
    data.relations.przedstawiciel_id <= 0
  ) {
    throw new ValidationError("Invalid field: relations.przedstawiciel_id");
  }

  if (data.details?.typ_nazwa !== undefined && data.details.typ_nazwa.trim() === "") {
    throw new ValidationError("Empty field: details.typ_nazwa");
  }

  if (data.details?.opis !== undefined && data.details.opis.trim() === "") {
    throw new ValidationError("Empty field: details.opis");
  }
}
