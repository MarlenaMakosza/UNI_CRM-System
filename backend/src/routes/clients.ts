import { Router } from "oak";
import { sql } from "../../../db/db.ts";

export const clientsRouter = new Router({ prefix: "/api/clients" });

type ClientListItem = {
  id: number;
  nip: string;
  nazwa_firmy: string;
  email: string;
  telefon: string | null;
  miejscowosc: string;
  kod_pocztowy: string;
  status_kod: string;
};

// GET /api/clients  – lista klientów
clientsRouter.get("/", async (ctx) => {
  const rows = await sql<ClientListItem[]>`
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

  ctx.response.body = rows;
});

// POST /api/clients - dodanie klienta
clientsRouter.post("/", async (ctx) => {
  const body = ctx.request.body({ type: "json" });
  const data = await body.value;

  //destrukturyzacja, żeby nie pisać 20 razy const nip = data.nip
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

  // walidacja
  if (
    !nip || !nazwa_firmy || !email || !status_kod || !adres ||
    !adres.numer_budynku || !adres.kod_pocztowy || !adres.miejscowosc
  ) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Missing required fields" };
    return;
  }

  // 1) status_klienta_id
  const statusRows = await sql`
    SELECT id FROM status_klienta
    WHERE kod = ${status_kod}
    LIMIT 1
  `;
  if (statusRows.length === 0) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Unknown status_kod" };
    return;
  }
  const statusId = statusRows[0].id;

  // 2) adres
  const adresRows = await sql`
    INSERT INTO adres (
      ulica, numer_budynku, numer_lokalu,
      kod_pocztowy, miejscowosc, wojewodztwo
    )
    VALUES (
      ${adres.ulica ?? null},
      ${adres.numer_budynku},
      ${adres.numer_lokalu ?? null},
      ${adres.kod_pocztowy},
      ${adres.miejscowosc},
      ${adres.wojewodztwo ?? null}
    )
    RETURNING id
  `;
  const adresId = adresRows[0].id;

  // 3) klient
  const klientRows = await sql`
    INSERT INTO klient (
      nip, nazwa_firmy, imie, nazwisko, stanowisko,
      email, telefon, adres_id, status_klienta_id
    )
    VALUES (
      ${nip},
      ${nazwa_firmy},
      ${imie ?? null},
      ${nazwisko ?? null},
      ${stanowisko ?? null},
      ${email},
      ${telefon ?? null},
      ${adresId},
      ${statusId}
    )
    RETURNING *
  `;

  ctx.response.status = 201;
  ctx.response.body = klientRows[0];
});


// PATCH /api/clients - zaaktualizowanie klienta
clientsRouter.patch("/:id", async (ctx) => {
  const idParam = ctx.params.id;
  const id = Number(idParam);

  //walidacja id
  if (!Number.isInteger(id)) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid client id" };
    return;
  }

  const body = ctx.request.body({ type: "json" });
  const data = await body.value;

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

   // 3) Ustalenie nowego statusu (jeśli podano status_kod)
   let statusId = current.status_klienta_id;

   if (typeof status_kod === "string") {
     const statusRows = await sql`
       SELECT id FROM status_klienta
       WHERE kod = ${status_kod}
       LIMIT 1
     `;
     if (statusRows.length === 0) {
       ctx.response.status = 400;
       ctx.response.body = { error: "Unknown status_kod" };
       return;
     }
     statusId = statusRows[0].id;
   }

   // 4) Zmergowane dane adresu
   const mergedAddress = {
     ulica:       adres?.ulica           ?? current.ulica,
     numer_budynku: adres?.numer_budynku ?? current.numer_budynku,
     numer_lokalu:  adres?.numer_lokalu  ?? current.numer_lokalu,
     kod_pocztowy:  adres?.kod_pocztowy  ?? current.kod_pocztowy,
     miejscowosc:   adres?.miejscowosc   ?? current.miejscowosc,
     wojewodztwo:   adres?.wojewodztwo   ?? current.wojewodztwo,
   };

   // 5) Zmergowane dane klienta
   const mergedClient = {
     nip:         nip         ?? current.nip,
     nazwa_firmy: nazwa_firmy ?? current.nazwa_firmy,
     imie:        imie        ?? current.imie,
     nazwisko:    nazwisko    ?? current.nazwisko,
     stanowisko:  stanowisko  ?? current.stanowisko,
     email:       email       ?? current.email,
     telefon:     telefon     ?? current.telefon,
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

   ctx.response.status = 200;
   ctx.response.body = updatedClientRows[0];
});

// DELETE /api/clients  – usunięcie
clientsRouter.delete("/:id", async (ctx) => {
  const id = Number(ctx.params.id);

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
});
