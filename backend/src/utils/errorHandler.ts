import { Context } from "oak";
import { ValidationError } from "../utils/validation.ts";

// ===== ERROR HANDLER =====
export function handleError(ctx: Context, error: unknown): void {
  if (error instanceof ValidationError) {
    ctx.response.status = error.statusCode;
    ctx.response.body = { error: error.message };
  } else if (error instanceof Error && error.message === "Invalid ID") {
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid ID" };
  } else {
    console.error("Error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
}
