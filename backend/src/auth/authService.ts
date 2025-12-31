import * as bcrypt from "bcrypt";
import { create, getNumericDate, verify } from "djwt";
import { sql } from "db";
import { JwtPayload, LoginResponse, RolaPracownika } from "../types/index.ts";

const JWT_SECRET_STRING = Deno.env.get("JWT_SECRET") || "super-secret-key-change-in-production";
const JWT_EXPIRY_HOURS = 24;

// Konwertuj secret string na CryptoKey (wymagane przez djwt v3)
const encoder = new TextEncoder();
const keyData = encoder.encode(JWT_SECRET_STRING);
const JWT_SECRET = await crypto.subtle.importKey(
  "raw",
  keyData,
  { name: "HMAC", hash: "SHA-512" },
  true,
  ["sign", "verify"],
);

type DbPrzedstawiciel = {
  id: number;
  imie: string;
  nazwisko: string;
  email: string;
  haslo_hash: string;
  rola: string;
  aktywny: boolean;
};

/**
 * Logowanie użytkownika
 * @param email - email przedstawiciela
 * @param password - hasło w plain text
 * @returns JWT token i dane użytkownika
 * @throws Error jeśli nieprawidłowe dane logowania
 */
export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  // 1. Pobierz użytkownika z bazy
  const users = await sql<DbPrzedstawiciel[]>`
    SELECT id, imie, nazwisko, email, haslo_hash, rola, aktywny
    FROM przedstawiciel_handlowy
    WHERE email = ${email}
    LIMIT 1
  `;

  if (users.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = users[0];

  // 2. Sprawdź czy użytkownik jest aktywny
  if (!user.aktywny) {
    throw new Error("User account is inactive");
  }

  // 3. Porównaj hasło
  const isPasswordValid = await bcrypt.compare(password, user.haslo_hash);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // 4. Utwórz JWT token
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    rola: user.rola as RolaPracownika,
  };

  const token = await create(
    { alg: "HS512", typ: "JWT" },
    { ...payload, exp: getNumericDate(JWT_EXPIRY_HOURS * 60 * 60) },
    JWT_SECRET,
  );

  // 5. Zwróć token i dane użytkownika
  return {
    token,
    user: {
      id: user.id,
      imie: user.imie,
      nazwisko: user.nazwisko,
      email: user.email,
      rola: user.rola as RolaPracownika,
    },
  };
}

/**
 * Weryfikuje JWT token
 * @param token - JWT token do weryfikacji
 * @returns Zdekodowany payload
 * @throws Error jeśli token jest nieprawidłowy lub wygasły
 */
export async function verifyToken(token: string): Promise<JwtPayload> {
  try {
    const payload = await verify(token, JWT_SECRET);
    return payload as JwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
