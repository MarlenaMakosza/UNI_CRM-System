import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://crm_user:crm_password@localhost:5432/crm_db";

// Disable prefetch for Deno compatibility
const client = postgres(DATABASE_URL, { prepare: false });

export const db = drizzle(client, { schema });
