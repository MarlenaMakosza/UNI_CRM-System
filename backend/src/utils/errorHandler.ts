import { Context } from "oak";
import { ValidationError } from "../utils/validation.ts";

export function handleError(ctx: Context, error: unknown): void {
  if (error instanceof ClientNotFoundError) {
    ctx.response.status = 404;
    ctx.response.body = {
      error: `Client with id: ${error.clientId} does not exist`,
    };
    return;
  }
  if (error instanceof ValidationError) {
    ctx.response.status = error.statusCode;
    ctx.response.body = { error: error.message };
    return;
  }
  if (error instanceof Error && error.message === "Invalid ID") {
    ctx.response.status = 400;
    ctx.response.body = { error: "Invalid ID" };
    return;
  }
  console.error("Error:", error);
  ctx.response.status = 500;
  ctx.response.body = { error: "Internal server error" };
}

export class ClientNotFoundError extends Error {
  constructor(public clientId: number) {
    super(`Client with id=${clientId} not found`);
    this.name = "ClientNotFoundError";
  }
}
