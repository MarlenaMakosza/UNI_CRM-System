import * as clientRepo from "../repository/clientRepository.ts";

import { Address, Client, NewClient } from "../types/index.ts";
import { validateClient } from "../utils/validation.ts";

export function listAllClients(): Promise<Client[]> {
  return clientRepo.getAllClients();
}

export function getClientDetails(
  id: number,
): Promise<Client> {
  return clientRepo.getClientById(id);
}

export async function createClient(
  request: Client,
): Promise<Client> {
  validateClient(request);

  const statusId: number = await clientRepo.getStatusId(request.status_kod);
  const adresId: number = await clientRepo.createAddress(request.adres);

  const newClientData: NewClient = {
    nip: request.nip,
    nazwa_firmy: request.nazwa_firmy,
    imie: request.imie,
    nazwisko: request.nazwisko,
    stanowisko: request.stanowisko,
    email: request.email,
    telefon: request.telefon,
    adres_id: adresId,
    status_klienta_id: statusId,
  };

  const createdClientId: number = await clientRepo.createClient(newClientData);

  return await clientRepo.getClientById(createdClientId);
}

export async function updateClient(
  id: number,
  newData: Client,
): Promise<Client> {
  const oldData = await clientRepo.getClientById(id);

  validateClient(newData);

  const statusId: number = await clientRepo.getStatusId(newData.status_kod);

  const mergedAddress: Address = {
    id: oldData.adres.id,
    ulica: newData.adres.ulica ?? oldData.adres.ulica,
    numer_budynku: newData.adres.numer_budynku ??
      oldData.adres.numer_budynku,
    numer_lokalu: newData.adres.numer_lokalu ?? oldData.adres.numer_lokalu,
    kod_pocztowy: newData.adres.kod_pocztowy ?? oldData.adres.kod_pocztowy,
    miejscowosc: newData.adres.miejscowosc ?? oldData.adres.miejscowosc,
    wojewodztwo: newData.adres.wojewodztwo ?? oldData.adres.wojewodztwo,
  };

  const mergedClient: NewClient = {
    nip: newData.nip ?? oldData.nip,
    nazwa_firmy: newData.nazwa_firmy ?? oldData.nazwa_firmy,
    imie: newData.imie ?? oldData.imie,
    nazwisko: newData.nazwisko ?? oldData.nazwisko,
    stanowisko: newData.stanowisko ?? oldData.stanowisko,
    email: newData.email ?? oldData.email,
    telefon: newData.telefon ?? oldData.telefon,
    adres_id: oldData.adres.id,
    status_klienta_id: statusId,
  };

  await clientRepo.updateAddress(mergedAddress);
  await clientRepo.updateClient(id, mergedClient);

  return await clientRepo.getClientById(id);
}

export async function removeClient(id: number): Promise<boolean> {
  return await clientRepo.deleteClient(id);
}
