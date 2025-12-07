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
