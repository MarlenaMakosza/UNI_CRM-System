import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const password = "password123";
const hash = await bcrypt.hash(password);

console.log(`Password: ${password}`);
console.log(`Hash: ${hash}`);
console.log(`\nUse this hash in seed.sql`);
