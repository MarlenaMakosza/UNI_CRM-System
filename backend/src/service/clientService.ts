import * as clientRepo from "../repository/clientRepository.ts";
import {
  dbClientDetailsToClient,
  dbClientToClientSummary,
} from "../mappers/clientMapper.ts";

import { Client, ClientSummary } from "../types/index.ts";

export async function listClients(): Promise<ClientSummary[]> {
  const dbClients = await clientRepo.getAllClients();
  return dbClients.map(dbClientToClientSummary);
}

export async function getClientDetails(id: number): Promise<Client> {
  const dbClient = await clientRepo.getClientById(id);
  return dbClientDetailsToClient(dbClient);
}

// export async function createClient(
//   request: Client,
// ): Promise<Client> {
//   await validateClient(request);

//   const statusId: number = await clientRepo.getStatusId(request.status_kod);
//   const adresId: number = await clientRepo.createAddress(request.adres);

//   const newClientData: NewClient = {
//     nip: request.nip,
//     nazwa_firmy: request.nazwa_firmy,
//     imie: request.imie,
//     nazwisko: request.nazwisko,
//     stanowisko: request.stanowisko,
//     email: request.email,
//     telefon: request.telefon,
//     adres_id: adresId,
//     status_klienta_id: statusId,
//   };

//   const createdClientId: number = await clientRepo.createClient(newClientData);

//   return await clientRepo.getClientById(createdClientId);
// }

// export async function updateClient(
//   id: number,
//   newData: Partial<Client>,
// ): Promise<Client> {
//   const oldData = await clientRepo.getClientById(id);

//   // Merge danych przed walidacją
//   const mergedAddress: Address = {
//     id: oldData.adres.id,
//     ulica: newData.adres?.ulica ?? oldData.adres.ulica,
//     numer_budynku: newData.adres?.numer_budynku ?? oldData.adres.numer_budynku,
//     numer_lokalu: newData.adres?.numer_lokalu ?? oldData.adres.numer_lokalu,
//     kod_pocztowy: newData.adres?.kod_pocztowy ?? oldData.adres.kod_pocztowy,
//     miejscowosc: newData.adres?.miejscowosc ?? oldData.adres.miejscowosc,
//     wojewodztwo: newData.adres?.wojewodztwo ?? oldData.adres.wojewodztwo,
//   };

//   const mergedClientData: Client = {
//     id: oldData.id,
//     nip: oldData.nip,
//     nazwa_firmy: newData.nazwa_firmy ?? oldData.nazwa_firmy,
//     imie: newData.imie ?? oldData.imie,
//     nazwisko: newData.nazwisko ?? oldData.nazwisko,
//     stanowisko: newData.stanowisko ?? oldData.stanowisko,
//     email: newData.email ?? oldData.email,
//     telefon: newData.telefon ?? oldData.telefon,
//     created_at: oldData.created_at,
//     status_kod: newData.status_kod ?? oldData.status_kod,
//     adres: mergedAddress,
//   };

//   if (newData.nip && newData.nip !== oldData.nip) {
//     throw new ValidationError("NIP cannot be changed", 400);
//   }

//   // Waliduj POŁĄCZONE dane (wszystkie pola wypełnione)
//   await validateUpdateClient(mergedClientData);

//   const statusId: number = await clientRepo.getStatusId(
//     mergedClientData.status_kod,
//   );

//   const mergedClient: NewClient = {
//     nip: mergedClientData.nip,
//     nazwa_firmy: mergedClientData.nazwa_firmy,
//     imie: mergedClientData.imie,
//     nazwisko: mergedClientData.nazwisko,
//     stanowisko: mergedClientData.stanowisko,
//     email: mergedClientData.email,
//     telefon: mergedClientData.telefon,
//     adres_id: oldData.adres.id,
//     status_klienta_id: statusId,
//   };

//   await clientRepo.updateAddress(mergedAddress);
//   await clientRepo.updateClient(id, mergedClient);

//   return await clientRepo.getClientById(id);
// }

// export async function removeClient(id: number): Promise<boolean> {
//   return await clientRepo.deleteClient(id);
// }
