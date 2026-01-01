import * as clientRepo from "../repository/clientRepository.ts";
import {
  createClientRequestToNewAddress as mapToNewAddress,
  createClientRequestToNewClient as mapToNewClient,
  dbClientDetailsToClient,
} from "../mappers/clientMapper.ts";

import {
  Client,
  CreateClient,
  NewAddress,
  NewClient,
  UpdateClient,
} from "../types/index.ts";
import {
  validateCreateClient,
  validateId,
  validateUpdateClient,
} from "../utils/validation.ts";

/**
 * Pobierz listę wszystkich klientów
 * @returns {Promise<Client[]>} - lista wszystkich klientów
 */
export async function listClients(): Promise<Client[]> {
  const dbClients = await clientRepo.getAllClients();
  return dbClients.map(dbClientDetailsToClient);
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
  return dbClientDetailsToClient(dbClient);
}

/**
 * Tworzy nowego klienta w systemie
 * @param {CreateClient} request - dane nowego klienta (zagnieżdżona struktura)
 * @returns {Promise<Client>} - utworzony klient w pełnej strukturze domenowej
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export async function createClient(
  request: CreateClient,
): Promise<Client> {
  // 1. Walidacja
  await validateCreateClient(request);

  // 2. Pobierz status_klienta_id
  const statusId = await clientRepo.getStatusId(request.status_kod);

  // 3. Utwórz adres
  const newAddress = mapToNewAddress(request);
  const adresId = await clientRepo.createAddress(newAddress);

  // 4. Utwórz klienta
  const newClient = mapToNewClient(request, adresId, statusId);
  const clientId = await clientRepo.createClient(newClient);

  // 5. Pobierz utworzonego klienta z bazy i zmapuj na domenowy typ Client
  const dbClient = await clientRepo.getClientById(clientId);

  // 6. Użyj istniejącego mappera!
  return dbClientDetailsToClient(dbClient);
}

/**
 * Częściowa aktualizacja klienta (PATCH)
 * @param {number} id - ID klienta do aktualizacji
 * @param {UpdateClient} updateData - częściowe dane do aktualizacji
 * @returns {Promise<Client>} - zaktualizowany klient
 * @throws {InvalidInputError} gdy ID jest niepoprawne
 * @throws {ClientNotFoundError} gdy klient nie istnieje
 * @throws {ValidationError} gdy dane są niepoprawne
 */
export async function updateClient(
  id: number,
  updateData: UpdateClient,
): Promise<Client> {
  // 1. Waliduj ID
  validateId(id);

  // 2. Pobierz obecnego klienta z bazy (DbClientDetails - surowe dane)
  const dbClient = await clientRepo.getClientById(id);

  // 3. Waliduj update request (sprawdź formaty, NIP nie zmieniony, etc.)
  await validateUpdateClient(updateData, dbClient.nip, id);

  // 4. Zmerguj dane adresu jeśli zostały przesłane
  const mergedAddress: NewAddress = {
    ulica: updateData.adres?.ulica ?? dbClient.ulica,
    numer_budynku: updateData.adres?.numer_budynku ?? dbClient.numer_budynku,
    numer_lokalu: (updateData.adres?.numer_lokalu ?? dbClient.numer_lokalu) || "",
    kod_pocztowy: updateData.adres?.kod_pocztowy ?? dbClient.kod_pocztowy,
    miejscowosc: updateData.adres?.miejscowosc ?? dbClient.miejscowosc,
    wojewodztwo: updateData.adres?.wojewodztwo ?? dbClient.wojewodztwo,
  };

  // 5. Pobierz status_klienta_id (jeśli status się zmienił)
  const statusId: number = updateData.status_kod
    ? await clientRepo.getStatusId(updateData.status_kod)
    : await clientRepo.getStatusId(dbClient.status_kod);

  // 6. Zmerguj dane klienta
  const mergedClient: NewClient = {
    nip: dbClient.nip, // NIP nie może się zmienić
    nazwa_firmy: updateData.company_data?.nazwa_firmy ?? dbClient.nazwa_firmy,
    imie: updateData.contact_person?.imie ?? dbClient.imie,
    nazwisko: updateData.contact_person?.nazwisko ?? dbClient.nazwisko,
    stanowisko: updateData.contact_person?.stanowisko ?? dbClient.stanowisko,
    email: updateData.contact_person?.contact_data?.email ?? dbClient.email,
    telefon: updateData.contact_person?.contact_data?.telefon ??
      dbClient.telefon,
    adres_id: dbClient.adres_id,
    status_klienta_id: statusId,
  };

  // 7. Zaktualizuj adres jeśli jakieś pola adresu zostały przesłane
  if (updateData.adres) {
    await clientRepo.updateAddress(dbClient.adres_id, mergedAddress);
  }

  // 8. Zaktualizuj klienta jeśli jakieś pola klienta zostały przesłane
  const shouldUpdateClient = updateData.company_data ||
    updateData.contact_person || updateData.status_kod;

  if (shouldUpdateClient) {
    await clientRepo.updateClient(id, mergedClient);
  }

  // 9. Pobierz zaktualizowanego klienta i zmapuj na domenowy typ Client
  const updatedDbClient = await clientRepo.getClientById(id);
  return dbClientDetailsToClient(updatedDbClient);
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
