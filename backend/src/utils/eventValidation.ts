import {DbUpsertEvent, UpsertEvent} from "../types/index.ts";
import { ValidationError } from "./clientValidation.ts";

/**
 * Walidacja dla tworzenia i aktualizacji wydarzenia
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export function validateUpsertEvent(data: UpsertEvent): void {
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

  // Walidacja schedule
  if (!data.schedule) {
    throw new ValidationError("Missing required field: schedule");
  }

  if (!data.schedule.data_planowana || data.schedule.data_planowana.trim() === "") {
    throw new ValidationError("Missing or empty field: schedule.data_planowana");
  }
}