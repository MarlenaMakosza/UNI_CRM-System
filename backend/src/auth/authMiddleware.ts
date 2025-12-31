import { Context, Next } from "oak";
import * as authService from "./authService.ts";
import { AuthUser } from "../types/index.ts";

/**
 * Middleware do sprawdzania JWT token
 * Wymaga header: Authorization: Bearer <token>
 * Dodaje user do ctx.state.user
 */
export async function requireAuth(ctx: Context, next: Next) {
  try {
    // 1. Pobierz token z headera Authorization
    const authHeader = ctx.request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Missing or invalid Authorization header" };
      return;
    }

    const token = authHeader.substring(7); // Usuń "Bearer "

    // 2. Zweryfikuj token
    const payload = await authService.verifyToken(token);

    // 3. Dodaj user do state
    ctx.state.user = {
      id: payload.userId,
      email: payload.email,
      rola: payload.rola,
    } as AuthUser;

    // 4. Kontynuuj do następnego middleware/handlera
    await next();
  } catch (error) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid or expired token" };
  }
}

/**
 * Middleware sprawdzający czy user ma rolę 'szef'
 * Używaj TYLKO PO requireAuth!
 */
export async function requireSzef(ctx: Context, next: Next) {
  const user = ctx.state.user as AuthUser | undefined;

  if (!user || user.rola !== "szef") {
    ctx.response.status = 403;
    ctx.response.body = { error: "Access denied: only 'szef' can access this resource" };
    return;
  }

  await next();
}
