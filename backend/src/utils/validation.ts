import { sql } from "db";
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

// Sprawdź czy NIP już istnieje
async function checkNipExists(
  nip: string,
  excludeId?: number,
): Promise<boolean> {
  if (excludeId) {
    const result = await sql`
      SELECT id FROM klient WHERE nip = ${nip} AND id != ${excludeId} LIMIT 1
    `;
    return result.length > 0;
  }

  const result = await sql`
    SELECT id FROM klient WHERE nip = ${nip} LIMIT 1
  `;
  return result.length > 0;
}

// Pobierz status_id po kodzie
async function getStatusId(status_kod: string): Promise<number> {
  const statusRows = await sql`
    SELECT id FROM status_klienta
    WHERE kod = ${status_kod}
    LIMIT 1
  `;
  return statusRows.length > 0 ? statusRows[0].id : 0;
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

// Walidacja formatów dla CreateClientRequest
export function validateCreateClient(data: Client): void {
  validateRequiredFields(data);
  validateNipFormat(data.nip);
  validateEmailFormat(data.email);
  validatePostalCodeFormat(data.adres.kod_pocztowy);
  validateNipNotDuplicated(data.nip);
  validateStatusExists(data.status_kod);
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

// Walidacja dla tworzenia klienta (POST)
export async function validateClientForCreation(
  data: Client,
): Promise<void> {
  // Walidacja formatów
  validateCreateClient(data);

  // Sprawdź duplikat NIP
  await validateNipNotDuplicated(data.nip);

  // Sprawdź czy status istnieje
  await validateStatusExists(data.status_kod);
}

// Walidacja dla aktualizacji klienta (PATCH)
export async function validateClientForUpdate(
  data: Client,
  currentNip: string,
  clientId: number,
): Promise<void> {
  // Sprawdź czy body nie jest pusty
  if (!data || Object.keys(data).length === 0) {
    throw new ValidationError("Empty body");
  }

  // Jeśli zmienia NIP, sprawdź duplikat
  if (data.nip && data.nip !== currentNip) {
    if (await checkNipExists(data.nip, clientId)) {
      throw new ValidationError("Client with this NIP already exists", 409);
    }
  }

  // Jeśli podano status, sprawdź czy istnieje
  if (data.status_kod) {
    const statusId = await getStatusId(data.status_kod);
    if (!statusId) {
      throw new ValidationError("Unknown status_kod");
    }
  }
}
