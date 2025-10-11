import { db } from "./index";
import { users } from "./schema";
import { Argon2id } from "oslo/password";

async function seed() {
  console.log("Seeding database...");

  const argon2id = new Argon2id();

  // Hash password for all test users
  const passwordHash = await argon2id.hash("password");

  // Insert test users
  await db.insert(users).values([
    {
      username: "ph.poznan",
      passwordHash,
      role: "PH",
      firstName: "Jan",
      lastName: "Kowalski",
      territory: "Poznan",
    },
    {
      username: "ph.wroclaw",
      passwordHash,
      role: "PH",
      firstName: "Anna",
      lastName: "Nowak",
      territory: "Wroclaw",
    },
    {
      username: "ph.szczecin",
      passwordHash,
      role: "PH",
      firstName: "Piotr",
      lastName: "Wisniewski",
      territory: "Szczecin",
    },
    {
      username: "manager",
      passwordHash,
      role: "MANAGER",
      firstName: "Maria",
      lastName: "Kowalczyk",
      territory: null,
    },
  ]);

  console.log("Seed completed!");
  console.log("\nTest users created:");
  console.log("- ph.poznan / password (PH - Poznan)");
  console.log("- ph.wroclaw / password (PH - Wroclaw)");
  console.log("- ph.szczecin / password (PH - Szczecin)");
  console.log("- manager / password (Kierownik)");

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
