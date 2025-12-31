import { Application, Router } from "oak";
import { oakCors } from "oakCors";
import { authRouter } from "./auth/authController.ts";
import { clientsRouter } from "./routes/clientsController.ts";
import { eventsRouter } from "./routes/eventsController.ts";
import { healthcheck } from "./routes/health.ts";

const app = new Application();

// CORS - zezwól na żądania z frontendu
app.use(oakCors({
  origin: "*", // W produkcji ustaw konkretny origin
}));

// Logowanie żądań
app.use(async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url.pathname}`);
  await next();
});

const router = new Router();

app.use(router.routes());
app.use(router.allowedMethods());

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());
app.use(clientsRouter.routes());
app.use(clientsRouter.allowedMethods());
app.use(eventsRouter.routes());
app.use(eventsRouter.allowedMethods());
app.use(healthcheck.routes());
app.use(healthcheck.allowedMethods());

// Global error handler
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Global error handler caught:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
});

// Event listener dla nieobsłużonych błędów
app.addEventListener("error", (evt) => {
  console.error("Uncaught error:", evt.error);
});

const PORT = Number(Deno.env.get("PORT") ?? "8080");
console.log(`API listening at http://localhost:${PORT}`);
console.log(`Check health there -> http://localhost:${PORT}/api/health`);
console.log(`Check clients there -> http://localhost:${PORT}/api/clients`);
console.log(`Check events there -> http://localhost:${PORT}/api/events`);
await app.listen({ port: PORT });
