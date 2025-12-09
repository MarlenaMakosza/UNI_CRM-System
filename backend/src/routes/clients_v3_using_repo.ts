import { Router } from "oak";
import {
  CreateClientRequest,
  UpdateClientRequest,
} from "../Requests/CreateClientRequest.ts";
import {
  validateClientForCreation,
  validateClientForUpdate,
  validateId,
} from "../utils/validation.ts";
import { handleError } from "../utils/errorHandler.ts";
import { getStatusId } from "../utils/database.ts";
import * as clientRepo from "../repository/clientRepository.ts";

export const clientsRouter = new Router({ prefix: "/api/clients" });

// ===== ENDPOINTS =====

// GET /api/clients – lista klientów
clientsRouter.get("/", async (ctx) => {
  try {
    const clients = await clientRepo.getAllClients();
    ctx.response.body = clients;
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// GET /api/clients/:id – pobranie klienta
clientsRouter.get("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    validateId(id);

    const client = await clientRepo.getClientById(id);

    if (!client) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Client not found" };
      return;
    }

    ctx.response.body = client;
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// POST /api/clients – dodanie klienta
clientsRouter.post("/", async (ctx) => {
  try {
    const body = ctx.request.body({ type: "json" });
    const data = await body.value as CreateClientRequest;

    await validateClientForCreation(data);

    const statusId = (await getStatusId(data.status_kod))!;
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

    ctx.response.body = newClient;
    ctx.response.status = 201;
  } catch (error) {
    handleError(ctx, error);
  }
});

// PATCH /api/clients/:id – aktualizacja klienta
clientsRouter.patch("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    validateId(id);

    const body = ctx.request.body({ type: "json" });
    const data = await body.value as UpdateClientRequest;

    const current = await clientRepo.getClientWithAddress(id);

    if (!current) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Client not found" };
      return;
    }

    await validateClientForUpdate(data, current.nip, id);

    let statusId = current.status_klienta_id;
    if (data.status_kod) {
      statusId = (await getStatusId(data.status_kod))!;
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

    ctx.response.body = updatedClient;
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// DELETE /api/clients/:id – usunięcie
clientsRouter.delete("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    validateId(id);

    const deleted = await clientRepo.deleteClient(id);

    if (!deleted) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Client not found" };
      return;
    }

    ctx.response.status = 204;
  } catch (error) {
    handleError(ctx, error);
  }
});
