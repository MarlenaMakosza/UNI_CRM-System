import { Router } from "oak";
import * as authService from "./authService.ts";
import { handleError } from "../utils/errorHandler.ts";
import { LoginRequest } from "../types/index.ts";

export const authRouter = new Router({ prefix: "/api/auth" });

// POST /api/auth/login – logowanie
authRouter.post("/login", async (ctx) => {
  try {
    const body = ctx.request.body({ type: "json" });
    const data: LoginRequest = await body.value;

    // Walidacja
    if (!data.email || !data.password) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Email and password are required" };
      return;
    }

    const result = await authService.login(data.email, data.password);

    ctx.response.body = result;
    ctx.response.status = 200;
  } catch (error) {
    // Obsługa błędów logowania
    if (error instanceof Error &&
        (error.message.includes("Invalid") || error.message.includes("inactive"))) {
      ctx.response.status = 401;
      ctx.response.body = { error: error.message };
      return;
    }
    handleError(ctx, error);
  }
});
