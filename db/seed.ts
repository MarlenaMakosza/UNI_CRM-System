import { sql } from "db";
import { dirname, fromFileUrl, join } from "mod";

async function seed() {
  console.log("➡️ Loading seed data from seed.sql...");

  // Pobierz ścieżkę do pliku seed.sql
  const currentDir = dirname(fromFileUrl(import.meta.url));
  const seedFilePath = join(currentDir, "seed.sql");

  // Wczytaj zawartość pliku seed.sql
  const seedSQL = await Deno.readTextFile(seedFilePath);

  console.log("➡️ Executing seed.sql...");

  // Wykonaj zapytania z pliku seed.sql
  await sql.unsafe(seedSQL);

  console.log("✔️ Database seeded successfully!");
  await sql.end();
}

await seed();
