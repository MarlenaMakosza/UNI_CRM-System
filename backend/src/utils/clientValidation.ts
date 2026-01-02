import { UpsertClient } from "../types/index.ts";
import { checkNipExists, getStatusId } from "../repository/clientRepository.ts";

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

/**
 * Błąd walidacji - używany gdy dane nie przechodzą walidacji biznesowej
 * Domyślnie zwraca status 400 Bad Request
 */
export class ValidationError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Błąd niepoprawnego inputu - używany gdy format danych jest zły
 * (np. niepoprawne ID, niepoprawny format danych)
 */
export class InvalidInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidInputError";
  }
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Walidacja ID - sprawdza czy ID jest poprawną liczbą całkowitą > 0
 * @throws {InvalidInputError} gdy ID jest niepoprawne
 */
export function validateId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new InvalidInputError("ID must be a positive integer greater than 0");
  }
}

function baseValidate(data: UpsertClient){
  validateRequiredFields(data);
  validateNipFormat(data.company_data.nip);
  validateEmailFormat(data.contact_person.contact_data.email);
  validatePostalCodeFormat(data.adres.kod_pocztowy);
}

/**
 * Główna funkcja walidacji dla tworzenia nowego klienta
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export async function validateUpsertClient(
  data: UpsertClient,
): Promise<void> {
  baseValidate(data);
  await validateStatusExists(data.status_kod);
  await validateNipNotDuplicated(data.company_data.nip);
}

export async function validateUpdateClient(
    data: UpsertClient,
): Promise<void> {
  baseValidate(data);
  await validateStatusExists(data.status_kod);
}

/**
 * Sprawdź, czy wszystkie wymagane pola są wypełnione
 * Dla zagnieżdżonej struktury CreateClientRequest
 */
function validateRequiredFields(data: UpsertClient): void {
  // Sprawdź główne obiekty
  if (!data.contact_person || !data.company_data || !data.adres || !data.status_kod) {
    throw new ValidationError("Missing required top-level fields");
  }

  // Sprawdź company_data
  if (!data.company_data.nip || data.company_data.nip.trim() === "") {
    throw new ValidationError("Missing or empty field: company_data.nip");
  }
  if (!data.company_data.nazwa_firmy || data.company_data.nazwa_firmy.trim() === "") {
    throw new ValidationError("Missing or empty field: company_data.nazwa_firmy");
  }

  // Sprawdź contact_person
  if (!data.contact_person.imie || data.contact_person.imie.trim() === "") {
    throw new ValidationError("Missing or empty field: contact_person.imie");
  }
  if (!data.contact_person.nazwisko || data.contact_person.nazwisko.trim() === "") {
    throw new ValidationError("Missing or empty field: contact_person.nazwisko");
  }
  if (!data.contact_person.stanowisko || data.contact_person.stanowisko.trim() === "") {
    throw new ValidationError("Missing or empty field: contact_person.stanowisko");
  }

  // Sprawdź contact_data
  if (!data.contact_person.contact_data) {
    throw new ValidationError("Missing contact_person.contact_data");
  }
  if (!data.contact_person.contact_data.email || data.contact_person.contact_data.email.trim() === "") {
    throw new ValidationError("Missing or empty field: contact_person.contact_data.email");
  }
  if (!data.contact_person.contact_data.telefon || data.contact_person.contact_data.telefon.trim() === "") {
    throw new ValidationError("Missing or empty field: contact_person.contact_data.telefon");
  }

  // Sprawdź adres (numer_lokalu może być pusty)
  const requiredAddrFields: (keyof typeof data.adres)[] = [
    "ulica",
    "numer_budynku",
    "kod_pocztowy",
    "miejscowosc",
    "wojewodztwo",
  ];
  for (const field of requiredAddrFields) {
    if (!data.adres[field] || data.adres[field].trim() === "") {
      throw new ValidationError(`Missing or empty field: adres.${field}`);
    }
  }
}

// Walidacja formatu NIP (10 cyfr)
function validateNipFormat(nip: string): void {
  if (!/^\d{10}$/.test(nip)) {
    throw new ValidationError("NIP must be 10 digits long");
  }
}

// Walidacja formatu email
function validateEmailFormat(email: string): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError("Invalid email format");
  }
}

// Walidacja formatu kodu pocztowego (XX-XXX)
function validatePostalCodeFormat(kod_pocztowy: string): void {
  if (!/^\d{2}-\d{3}$/.test(kod_pocztowy)) {
    throw new ValidationError("Invalid postal code format (XX-XXX)");
  }
}

// Sprawdź czy NIP nie jest zduplikowany
async function validateNipNotDuplicated(
  nip: string,
  excludeId?: number,
): Promise<void> {
  if (await checkNipExists(nip, excludeId)) {
    throw new ValidationError("Client with this NIP already exists", 409);
  }
}

// Sprawdź czy status_kod istnieje w bazie
async function validateStatusExists(status_kod: string): Promise<void> {
  const statusId = await getStatusId(status_kod);
  if (!statusId) {
    throw new ValidationError("Unknown status_kod");
  }
}