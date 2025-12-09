import {
  CreateClientRequest,
  UpdateClientRequest,
} from "../Requests/CreateClientRequest.ts";
import { ClientDetail, ClientListItem } from "../Types/clients.ts";
import { ClientRow } from "../dto/dto.ts";
import * as clientRepo from "../repository/clientRepository.ts";
import { getStatusId } from "../utils/database.ts";
import {
  validateClientForCreation,
  validateClientForUpdate,
} from "../utils/validation.ts";

export async function listAllClients(): Promise<ClientListItem[]> {
  return await clientRepo.getAllClients();
}

export async function getClientDetails(
  id: number,
): Promise<ClientDetail | null> {
  return await clientRepo.getClientById(id);
}

export async function createNewClient(
  data: CreateClientRequest,
): Promise<ClientRow> {
  await validateClientForCreation(data);

  const statusId = await getStatusId(data.status_kod);
  if (!statusId) {
    throw new Error("Status not found");
  }

  const adresId = await clientRepo.createAddress(data.adres);

  const newClient = await clientRepo.createClient({
    nip: data.nip,
    nazwa_firmy: data.nazwa_firmy,
    imie: data.imie,
    nazwisko: data.nazwisko,
    stanowisko: data.stanowisko,
    email: data.email,
    telefon: data.telefon,
    adres_id: adresId,
    status_klienta_id: statusId,
  });

  return newClient;
}

export async function updateExistingClient(
  id: number,
  data: UpdateClientRequest,
): Promise<ClientRow | null> {
  const current = await clientRepo.getClientWithAddress(id);
  if (!current) {
    return null;
  }

  await validateClientForUpdate(data, current.nip, id);

  let statusId = current.status_klienta_id;
  if (data.status_kod) {
    const newStatusId = await getStatusId(data.status_kod);
    if (!newStatusId) {
      throw new Error("Status not found");
    }
    statusId = newStatusId;
  }

  const mergedAddress = {
    ulica: data.adres?.ulica ?? current.ulica,
    numer_budynku: data.adres?.numer_budynku ?? current.numer_budynku,
    numer_lokalu: data.adres?.numer_lokalu ?? current.numer_lokalu,
    kod_pocztowy: data.adres?.kod_pocztowy ?? current.kod_pocztowy,
    miejscowosc: data.adres?.miejscowosc ?? current.miejscowosc,
    wojewodztwo: data.adres?.wojewodztwo ?? current.wojewodztwo,
  };

  const mergedClient = {
    nip: data.nip ?? current.nip,
    nazwa_firmy: data.nazwa_firmy ?? current.nazwa_firmy,
    imie: data.imie ?? current.imie,
    nazwisko: data.nazwisko ?? current.nazwisko,
    stanowisko: data.stanowisko ?? current.stanowisko,
    email: data.email ?? current.email,
    telefon: data.telefon ?? current.telefon,
    status_klienta_id: statusId,
  };

  await clientRepo.updateAddress(current.adres_id, mergedAddress);
  const updatedClient = await clientRepo.updateClient(id, mergedClient);

  return updatedClient;
}

export async function removeClient(id: number): Promise<boolean> {
  return await clientRepo.deleteClient(id);
}
