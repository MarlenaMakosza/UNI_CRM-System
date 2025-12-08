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
