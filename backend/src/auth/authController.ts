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

    const result = await authService.login(data.email, data.password);

    ctx.response.status = 200;
    ctx.response.body = result;
  } catch (error) {
    handleError(ctx, error);
  }
});
