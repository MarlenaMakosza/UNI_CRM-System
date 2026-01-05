import { ValidationError } from "./clientValidation.ts";

/**
 * Waliduje parametry raportu aktywności przedstawiciela
 * @param repId - ID przedstawiciela (string z query params)
 * @param from - data od (YYYY-MM-DD)
 * @param to - data do (YYYY-MM-DD)
 * @returns {number} - zwalidowane ID przedstawiciela
 * @throws {ValidationError} gdy parametry są niepoprawne
 */
export function validateRepActivityParams(
  repId: string | null,
  from: string | null,
  to: string | null,
): number {
  // Sprawdź czy wszystkie parametry są obecne
  if (!repId || !from || !to) {
    throw new ValidationError(
      "Missing required query parameters: rep_id, from, to",
    );
  }

  // Waliduj rep_id
  const repIdNumber = Number(repId);
  if (isNaN(repIdNumber) || repIdNumber <= 0) {
    throw new ValidationError("rep_id must be a positive number");
  }

  // Waliduj format dat
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(from)) {
    throw new ValidationError(
      "Parameter 'from' must be in YYYY-MM-DD format",
    );
  }
  if (!dateRegex.test(to)) {
    throw new ValidationError("Parameter 'to' must be in YYYY-MM-DD format");
  }

  return repIdNumber;
}

/**
 * Waliduje parametry harmonogramu dnia przedstawiciela
 * @param repId - ID przedstawiciela (string z query params)
 * @param day - data (YYYY-MM-DD)
 * @returns {number} - zwalidowane ID przedstawiciela
 * @throws {ValidationError} gdy parametry są niepoprawne
 */
export function validateRepAgendaParams(
  repId: string | null,
  day: string | null,
): number {
  // Sprawdź czy wszystkie parametry są obecne
  if (!repId || !day) {
    throw new ValidationError(
      "Missing required query parameters: rep_id, day",
    );
  }

  // Waliduj rep_id
  const repIdNumber = Number(repId);
  if (isNaN(repIdNumber) || repIdNumber <= 0) {
    throw new ValidationError("rep_id must be a positive number");
  }

  // Waliduj format daty
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(day)) {
    throw new ValidationError("Parameter 'day' must be in YYYY-MM-DD format");
  }

  return repIdNumber;
}

/**
 * Waliduje parametry raportu obrotów klienta
 * @param clientId - ID klienta (string z query params)
 * @param from - data od (YYYY-MM-DD)
 * @param to - data do (YYYY-MM-DD)
 * @returns {number} - zwalidowane ID klienta
 * @throws {ValidationError} gdy parametry są niepoprawne
 */
export function validateClientTurnoverParams(
  clientId: string | null,
  from: string | null,
  to: string | null,
): number {
  // Sprawdź czy wszystkie parametry są obecne
  if (!clientId || !from || !to) {
    throw new ValidationError(
      "Missing required query parameters: client_id, from, to",
    );
  }

  // Waliduj client_id
  const clientIdNumber = Number(clientId);
  if (isNaN(clientIdNumber) || clientIdNumber <= 0) {
    throw new ValidationError("client_id must be a positive number");
  }

  // Waliduj format dat
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(from)) {
    throw new ValidationError(
      "Parameter 'from' must be in YYYY-MM-DD format",
    );
  }
  if (!dateRegex.test(to)) {
    throw new ValidationError("Parameter 'to' must be in YYYY-MM-DD format");
  }

  return clientIdNumber;
}
