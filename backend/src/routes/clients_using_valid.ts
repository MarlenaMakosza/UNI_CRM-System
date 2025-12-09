import { sql } from "db";
import { Context, Router } from "oak";
import {
  CreateClientRequest,
  UpdateClientRequest,
} from "../Requests/CreateClientRequest.ts";
import { ClientDetail, ClientListItem } from "../Types/clients.ts";
import {
  validateClientForCreation,
  validateClientForUpdate,
  validateId,
  ValidationError,
} from "../utils/validation.ts";
import { getStatusId } from "../utils/database.ts";

export const clientsRouter = new Router({ prefix: "/api/clients" });

// GET /api/clients  – lista klientów
clientsRouter.get("/", async (ctx) => {
  try {
    const clients = await sql<ClientListItem[]>`
      SELECT
        k.id, k.nip, k.nazwa_firmy, k.email, k.telefon,
        a.miejscowosc, a.kod_pocztowy, s.kod AS status_kod
      FROM klient k
      JOIN adres a ON k.adres_id = a.id
      JOIN status_klienta s ON k.status_klienta_id = s.id
      ORDER BY k.created_at DESC
    `;

    ctx.response.body = clients;
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// GET /api/clients/:id - pobranie klienta
clientsRouter.get("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    validateId(id);

    const raw = await sql`
      SELECT
        k.id, k.nip, k.nazwa_firmy, k.imie, k.nazwisko, k.stanowisko,
        k.email, k.telefon, s.kod AS status_kod,
        a.ulica, a.numer_budynku, a.numer_lokalu,
        a.kod_pocztowy, a.miejscowosc, a.wojewodztwo
      FROM klient k
      JOIN adres a ON k.adres_id = a.id
      JOIN status_klienta s ON k.status_klienta_id = s.id
      WHERE k.id = ${id}
      LIMIT 1
    `;

    if (raw.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Client not found" };
      return;
    }

    const row = raw[0];

    const result: ClientDetail = {
      id: row.id,
      nip: row.nip,
      nazwa_firmy: row.nazwa_firmy,
      imie: row.imie,
      nazwisko: row.nazwisko,
      stanowisko: row.stanowisko,
      email: row.email,
      telefon: row.telefon,
      status_kod: row.status_kod,
      adres: {
        ulica: row.ulica,
        numer_budynku: row.numer_budynku,
        numer_lokalu: row.numer_lokalu,
        kod_pocztowy: row.kod_pocztowy,
        miejscowosc: row.miejscowosc,
        wojewodztwo: row.wojewodztwo,
      },
    };

    ctx.response.body = result;
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// POST /api/clients - dodanie klienta
clientsRouter.post("/", async (ctx) => {
  try {
    const body = ctx.request.body({ type: "json" });
    const data = await body.value as CreateClientRequest;

    // Cała walidacja
    await validateClientForCreation(data);

    // Pobierz status_id (wiemy że istnieje)
    const statusId = (await getStatusId(data.status_kod))!;

    // Wstaw adres
    const adresRows = await sql`
      INSERT INTO adres (
        ulica, numer_budynku, numer_lokalu,
        kod_pocztowy, miejscowosc, wojewodztwo
      )
      VALUES (
        ${data.adres.ulica ?? null},
        ${data.adres.numer_budynku},
        ${data.adres.numer_lokalu ?? null},
        ${data.adres.kod_pocztowy},
        ${data.adres.miejscowosc},
        ${data.adres.wojewodztwo ?? null}
      )
      RETURNING id
    `;
    const adresId = adresRows[0].id;

    // Wstaw klienta
    const clientRows = await sql`
      INSERT INTO klient (
        nip, nazwa_firmy, imie, nazwisko, stanowisko,
        email, telefon, adres_id, status_klienta_id
      )
      VALUES (
        ${data.nip},
        ${data.nazwa_firmy},
        ${data.imie ?? null},
        ${data.nazwisko ?? null},
        ${data.stanowisko ?? null},
        ${data.email},
        ${data.telefon ?? null},
        ${adresId},
        ${statusId}
      )
      RETURNING *
    `;

    ctx.response.body = clientRows[0];
    ctx.response.status = 201;
  } catch (error) {
    handleError(ctx, error);
  }
});

// PATCH /api/clients - zaaktualizowanie klienta
clientsRouter.patch("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    validateId(id);

    const body = ctx.request.body({ type: "json" });
    const data = await body.value as UpdateClientRequest;

    // Pobierz aktualne dane
    const rows = await sql`
      SELECT
        k.id, k.nip, k.nazwa_firmy, k.imie, k.nazwisko, k.stanowisko,
        k.email, k.telefon, k.status_klienta_id, k.adres_id,
        a.ulica, a.numer_budynku, a.numer_lokalu,
        a.kod_pocztowy, a.miejscowosc, a.wojewodztwo
      FROM klient k
      JOIN adres a ON k.adres_id = a.id
      WHERE k.id = ${id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Client not found" };
      return;
    }

    const current = rows[0];

    // Cała walidacja
    await validateClientForUpdate(data, current.nip, id);

    // Ustal status
    let statusId = current.status_klienta_id;
    if (data.status_kod) {
      statusId = (await getStatusId(data.status_kod))!;
    }

    // Merge danych
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
    };

    // 6) UPDATE adres
    await sql`
      UPDATE adres
      SET
        ulica = ${mergedAddress.ulica},
        numer_budynku = ${mergedAddress.numer_budynku},
        numer_lokalu = ${mergedAddress.numer_lokalu},
        kod_pocztowy = ${mergedAddress.kod_pocztowy},
        miejscowosc = ${mergedAddress.miejscowosc},
        wojewodztwo = ${mergedAddress.wojewodztwo}
      WHERE id = ${current.adres_id}
    `;

    // 7) UPDATE klienta + zwrot zaktualizowanego rekordu
    const updatedClientRows = await sql`
      UPDATE klient
      SET
        nip = ${mergedClient.nip},
        nazwa_firmy = ${mergedClient.nazwa_firmy},
        imie = ${mergedClient.imie},
        nazwisko = ${mergedClient.nazwisko},
        stanowisko = ${mergedClient.stanowisko},
        email = ${mergedClient.email},
        telefon = ${mergedClient.telefon},
        status_klienta_id = ${statusId}
      WHERE id = ${id}
      RETURNING *
    `;

    ctx.response.body = updatedClientRows[0];
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// DELETE /api/clients  – usunięcie
clientsRouter.delete("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    validateId(id);

    const result = await sql`
      DELETE FROM klient WHERE id = ${id}
      RETURNING id
    `;

    if (result.length === 0) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Client not found" };
      return;
    }

    ctx.response.status = 204;
  } catch (error) {
    handleError(ctx, error);
  }
});

function handleError(ctx: Context, error: unknown): void {
  if (error instanceof ValidationError) {
    ctx.response.status = error.statusCode;
    ctx.response.body = { error: error.message };
  } else if (error instanceof Error && error.message === "Invalid ID") {
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid ID" };
  } else {
    console.error("Error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
}
