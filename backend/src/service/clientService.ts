import * as clientRepo from "../repository/clientRepository.ts";
import {
  mapUpsertClientToDbUpsertAddress,
  mapUpsertClientToDbUpsertClient,
  mapDbClientToClient,
} from "../mappers/clientMapper.ts";

import {
  Client,
  UpsertClient,
  DbUpsertAddress,
  DbUpsertClient,
} from "../types/index.ts";
import {
  validateUpsertClient,
  validateId,
  validateUpdateClient, ValidationError,
} from "../utils/clientValidation.ts";

/**
 * Pobierz listę wszystkich klientów
 * @returns {Promise<Client[]>} - lista wszystkich klientów
 */
export async function listClients(): Promise<Client[]> {
  const dbClients = await clientRepo.getAllClients();
  return dbClients.map(mapDbClientToClient);
}

/**
 * Pobierz pełne dane klienta o podanym ID
 * @param {number} id - ID klienta
 * @returns {Promise<Client>} - pełne dane klienta
 * @throws {InvalidInputError} gdy ID jest niepoprawne
 * @throws {ClientNotFoundError} gdy klient nie istnieje
 */
export async function getClientDetails(id: number): Promise<Client> {
  validateId(id);
  const dbClient = await clientRepo.getClientById(id);
  return mapDbClientToClient(dbClient);
}

/**
 * Tworzy nowego klienta w systemie
 * @param {UpsertClient} request - dane nowego klienta (zagnieżdżona struktura)
 * @returns {Promise<Client>} - utworzony klient w pełnej strukturze domenowej
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export async function createClient(
  request: UpsertClient,
): Promise<Client> {
  // 1. Walidacja
  await validateUpsertClient(request);

  // 2. Pobierz status_klienta_id
  const statusId = await clientRepo.getStatusId(request.status_kod);

  // 3. Utwórz adres
  const newAddress = mapUpsertClientToDbUpsertAddress(request);
  const adresId = await clientRepo.createAddress(newAddress);

  // 4. Utwórz klienta
  const newClient = mapUpsertClientToDbUpsertClient(request, adresId, statusId);
  const clientId = await clientRepo.createClient(newClient);

  // 5. Pobierz utworzonego klienta z bazy i zmapuj na domenowy typ Client
  const dbClient = await clientRepo.getClientById(clientId);

  // 6. Użyj istniejącego mappera!
  return mapDbClientToClient(dbClient);
}

/**
 * Częściowa aktualizacja klienta (PATCH)
 * @param {number} id - ID klienta do aktualizacji
 * @param request
 * @returns {Promise<Client>} - zaktualizowany klient
 * @throws {InvalidInputError} gdy ID jest niepoprawne
 * @throws {ClientNotFoundError} gdy klient nie istnieje
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export async function updateClient(
    id: number,
    request: UpsertClient,
): Promise<Client> {
  validateId(id);

  const dbClient = await clientRepo.getClientById(id);

  // walidacja pełnego payloadu
  await validateUpdateClient(request);

  if (request.company_data.nip !== dbClient.nip) {
    throw new ValidationError("NIP cannot be changed");
  }

  const statusId = await clientRepo.getStatusId(request.status_kod);

  const upsertAddress: DbUpsertAddress = mapUpsertClientToDbUpsertAddress(request);
  const upsertClient: DbUpsertClient = mapUpsertClientToDbUpsertClient(
      request,
      dbClient.adres_id,
      statusId,
  );

  await clientRepo.updateAddress(dbClient.adres_id, upsertAddress);
  await clientRepo.updateClient(id, upsertClient);

  return mapDbClientToClient(await clientRepo.getClientById(id));
}


/**
 * Usuwa klienta z systemu
 * Operacja jest idempotentna - wielokrotne usunięcie tego samego ID nie powoduje błędu
 * @param {number} id - ID klienta do usunięcia
 * @returns {Promise<void>}
 * @throws {InvalidInputError} gdy ID jest niepoprawne
 * @throws {Error} gdy klient ma powiązane zdarzenia lub umowy (FK constraint)
 */
export async function removeClient(id: number): Promise<void> {
  validateId(id);
  await clientRepo.deleteClient(id);
}
