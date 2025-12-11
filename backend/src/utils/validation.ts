import { checkNipExists, getStatusId } from "../repository/clientRepository.ts";
import { Client } from "../types/index.ts";

// Custom error class
export class ValidationError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = "ValidationError";
  }
}

// Walidacja ID
export function validateId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid ID");
  }
}

// Walidacja formatów dla CreateClientRequest
export async function validateClient(data: Client): Promise<void> {
  validateRequiredFields(data);
  validateNipFormat(data.nip);
  validateEmailFormat(data.email);
  validatePostalCodeFormat(data.adres.kod_pocztowy);
  await validateNipNotDuplicated(data.nip);
  await validateStatusExists(data.status_kod);
}

export async function validateUpdateClient(data: Client): Promise<void> {
  validateRequiredFields(data);
  validateEmailFormat(data.email);
  validatePostalCodeFormat(data.adres.kod_pocztowy);
  await validateStatusExists(data.status_kod);
}

// Sprawdź czy wszystkie wymagane pola są wypełnione
function validateRequiredFields(data: Client): void {
  if (
    !data.nip || !data.nazwa_firmy || !data.email || !data.status_kod ||
    !data.adres
  ) {
    throw new ValidationError("Missing required fields");
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
