import { sql } from "./db.ts";

async function seed() {
  console.log("➡️ Seeding lookup tables...");

  // --- STATUS KLIENTA ---
  await sql`
    INSERT INTO status_klienta (kod, nazwa)
    VALUES ('PROSPEKT', 'Potencjalny klient')
    ON CONFLICT (kod) DO NOTHING
  `;

  await sql`
    INSERT INTO status_klienta (kod, nazwa)
    VALUES ('AKTYWNY', 'Aktywny klient')
    ON CONFLICT (kod) DO NOTHING
  `;

  await sql`
    INSERT INTO status_klienta (kod, nazwa)
    VALUES ('NIEAKTYWNY', 'Nieaktywny klient')
    ON CONFLICT (kod) DO NOTHING
  `;

  // --- TYPY ZDARZEŃ ---
  const zdarzenia = [
    "telefon_pierwszy_kontakt",
    "telefon_follow_up",
    "telefon_po_dostawie",
    "wizyta",
    "newsletter",
  ];

  for (const n of zdarzenia) {
    await sql`
      INSERT INTO typ_zdarzenia (nazwa)
      VALUES (${n})
      ON CONFLICT (nazwa) DO NOTHING
    `;
  }

  // --- TYPY UMOWY ---
  const typUmowy = ["ramowa", "jednorazowa"];

  for (const n of typUmowy) {
    await sql`
      INSERT INTO typ_umowy (nazwa)
      VALUES (${n})
      ON CONFLICT (nazwa) DO NOTHING
    `;
  }

  console.log("✔️ Dictionary tables seeded.");

  // --- Przykładowy adres ---
  const insertedAddress = await sql`
    INSERT INTO adres (
      ulica, numer_budynku, numer_lokalu, kod_pocztowy, miejscowosc, wojewodztwo
    )
    VALUES (
      'Nowa', '12A', NULL, '65-100', 'Zielona Góra', 'Lubuskie'
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `;

  // Jeśli rekord już istnieje, pobierz id istniejący
  let adresId = insertedAddress[0]?.id;
  if (!adresId) {
    const existing = await sql`
      SELECT id FROM adres
      WHERE miejscowosc='Zielona Góra'
      LIMIT 1
    `;
    adresId = existing[0].id;
  }

  // Pobierz id statusu „AKTYWNY”
  const status = await sql`
    SELECT id FROM status_klienta
    WHERE kod='AKTYWNY'
    LIMIT 1
  `;
  const statusId = status[0].id;

  // --- Przykładowy klient ---
  await sql`
    INSERT INTO klient (
      nip, nazwa_firmy, imie, nazwisko, stanowisko,
      email, telefon, adres_id, status_klienta_id
    )
    VALUES (
      '1234567890',
      'Warzywniak Marlenki',
      'Marek',
      'Kowalski',
      'Właściciel',
      'kontakt@warzywniak.pl',
      '123456789',
      ${adresId},
      ${statusId}
    )
    ON CONFLICT (nip) DO NOTHING
  `;

  console.log("✔️ Sample client seeded.");
  await sql.end();
}

await seed();
