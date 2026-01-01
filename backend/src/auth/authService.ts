import * as bcrypt from "bcrypt";
import { jwtVerify, SignJWT } from "jose";
import { sql } from "db";
import { CustomJwtPayload, LoginResponse, RolaPracownika, DbPrzedstawiciel } from "../types/index.ts";
import { AuthenticationError } from "../utils/errorHandler.ts";

const JWT_SECRET_STRING = Deno.env.get("JWT_SECRET") || "super-secret-key-change-in-production";
const JWT_EXPIRY_HOURS = 24;

// Konwertuj secret string do Uint8Array (wymagane przez jose)
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

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
  // 1. Walidacja inputu
  if (!email || !password) {
    throw new AuthenticationError("Email and password are required");
  }

  // 2. Pobierz użytkownika z bazy
  const users = await sql<DbPrzedstawiciel[]>`
    SELECT id, imie, nazwisko, email, haslo_hash, rola, aktywny
    FROM przedstawiciel_handlowy
    WHERE email = ${email}
    LIMIT 1
  `;

  if (users.length === 0) {
    throw new AuthenticationError("Invalid email or password");
  }

  const user = users[0];

  // 3. Sprawdź czy użytkownik jest aktywny
  if (!user.aktywny) {
    throw new AuthenticationError("User account is inactive");
  }

  // 4. Porównaj hasło
  const isPasswordValid = await bcrypt.compare(password, user.haslo_hash);
  if (!isPasswordValid) {
    throw new AuthenticationError("Invalid email or password");
  }

  // 4. Utwórz JWT token
  const payload = {
    userId: user.id,
    email: user.email,
    rola: user.rola as RolaPracownika,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${JWT_EXPIRY_HOURS}h`)
    .sign(JWT_SECRET);

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
export async function verifyToken(token: string): Promise<CustomJwtPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as CustomJwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}
