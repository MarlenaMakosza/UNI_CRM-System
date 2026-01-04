import { UpsertProduct } from "../types/index.ts";
import { ValidationError } from "./clientValidation.ts";

/**
 * Walidacja dla tworzenia i aktualizacji produktu
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export function validateUpsertProduct(data: UpsertProduct): void {
  if (!data.nazwa || data.nazwa.trim() === "") {
    throw new ValidationError("Missing or empty field: nazwa");
  }

  if (data.nazwa.length > 100) {
    throw new ValidationError("Field 'nazwa' is too long (max 100 characters)");
  }

  if (!data.opis) {
    throw new ValidationError("Missing field: opis");
  }

  if (!data.cena || data.cena <= 0) {
    throw new ValidationError("Invalid field: cena (must be > 0)");
  }
}
