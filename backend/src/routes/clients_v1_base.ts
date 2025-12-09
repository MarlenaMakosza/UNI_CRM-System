import { sql } from "db";
import { Context, Router } from "oak";
import {
  CreateClientRequest,
  UpdateClientRequest,
} from "../Requests/CreateClientRequest.ts";
import { ClientDetail, ClientListItem } from "../types/clients.ts";

export const clientsRouter = new Router({ prefix: "/api/clients" });

// GET /api/clients  – lista klientów
clientsRouter.get("/", async (ctx) => {
  try {
    const clients = await sql<ClientListItem[]>`
      SELECT
        k.id,
        k.nip,
        k.nazwa_firmy,
        k.email,
        k.telefon,
        a.miejscowosc,
        a.kod_pocztowy,
        s.kod AS status_kod
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
        k.id,
        k.nip,
        k.nazwa_firmy,
        k.imie,
        k.nazwisko,
        k.stanowisko,
        k.email,
        k.telefon,
        s.kod AS status_kod,
        a.ulica,
        a.numer_budynku,
        a.numer_lokalu,
        a.kod_pocztowy,
        a.miejscowosc,
        a.wojewodztwo
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

    // Walidacja wymaganych pól
    if (
      !data.nip || !data.nazwa_firmy || !data.email || !data.status_kod ||
      !data.adres
    ) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing required fields" };
      return;
    }

    // Sprawdź czy NIP już istnieje
    if (await checkNipExists(data.nip)) {
      ctx.response.status = 409;
      ctx.response.body = { error: "Client with this NIP already exists" };
      return;
    }

    // Walidacja formatów
    if (!/^\d{10}$/.test(data.nip)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "NIP must be 10 digits" };
      return;
    }

    // Walidacja email (podstawowa)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid email format" };
      return;
    }

    // Walidacja kodu pocztowego (XX-XXX)
    if (!/^\d{2}-\d{3}$/.test(data.adres.kod_pocztowy)) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Invalid postal code format (XX-XXX)" };
      return;
    }

    const statusId = await getStatusId(data.status_kod);
    if (!statusId) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Unknown status_kod" };
      return;
    }

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

    // Sprawdź czy body nie jest pusty
    if (!data || Object.keys(data).length === 0) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Empty body" };
      return;
    }

    // 1) Pobierz aktualne dane klienta + adres
    const rows = await sql`
      SELECT
        k.id,
        k.nip,
        k.nazwa_firmy,
        k.imie,
        k.nazwisko,
        k.stanowisko,
        k.email,
        k.telefon,
        k.status_klienta_id,
        k.adres_id,
        a.ulica,
        a.numer_budynku,
        a.numer_lokalu,
        a.kod_pocztowy,
        a.miejscowosc,
        a.wojewodztwo
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

    // 2) Wyciągamy z body to, co ewentualnie przyszło
    const {
      nip,
      nazwa_firmy,
      imie,
      nazwisko,
      stanowisko,
      email,
      telefon,
      status_kod,
      adres,
    } = data;

    // Jeśli zmienia NIP, sprawdź duplikat
    if (nip && nip !== current.nip) {
      if (await checkNipExists(nip, id)) {
        ctx.response.status = 409;
        ctx.response.body = { error: "Client with this NIP already exists" };
        return;
      }
    }

    // 3) Ustalenie nowego statusu (jeśli podano status_kod)
    let statusId = current.status_klienta_id;
    if (typeof status_kod === "string") {
      const newStatusId = await getStatusId(status_kod);
      if (!newStatusId) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Unknown status_kod" };
        return;
      }
      statusId = newStatusId;
    }

    // 4) Zmergowane dane adresu
    const mergedAddress = {
      ulica: adres?.ulica ?? current.ulica,
      numer_budynku: adres?.numer_budynku ?? current.numer_budynku,
      numer_lokalu: adres?.numer_lokalu ?? current.numer_lokalu,
      kod_pocztowy: adres?.kod_pocztowy ?? current.kod_pocztowy,
      miejscowosc: adres?.miejscowosc ?? current.miejscowosc,
      wojewodztwo: adres?.wojewodztwo ?? current.wojewodztwo,
    };

    // 5) Zmergowane dane klienta
    const mergedClient = {
      nip: nip ?? current.nip,
      nazwa_firmy: nazwa_firmy ?? current.nazwa_firmy,
      imie: imie ?? current.imie,
      nazwisko: nazwisko ?? current.nazwisko,
      stanowisko: stanowisko ?? current.stanowisko,
      email: email ?? current.email,
      telefon: telefon ?? current.telefon,
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

// ===== HELPER FUNCTIONS =====

function validateId(id: number): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid ID");
  }
}

async function getStatusId(status_kod: string): Promise<number | null> {
  const statusRows = await sql`
    SELECT id FROM status_klienta
    WHERE kod = ${status_kod}
    LIMIT 1
  `;
  return statusRows.length > 0 ? statusRows[0].id : null;
}

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

function handleError(ctx: Context, error: unknown): void {
  if (error instanceof Error && error.message === "Invalid ID") {
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid ID" };
  } else {
    console.error("Error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
}
