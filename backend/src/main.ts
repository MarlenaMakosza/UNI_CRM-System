import { Application, Router } from "oak";
import { oakCors } from "oakCors";
import { authRouter } from "./auth/authController.ts";
import { clientsRouter } from "./routes/clientsController.ts";
import { contractsRouter } from "./routes/contractsController.ts";
import { eventsRouter } from "./routes/eventsController.ts";
import { productsRouter } from "./routes/productsController.ts";
import { reportsRouter } from "./routes/reportsController.ts";
import { healthcheck } from "./routes/health.ts";
import { requireAuth } from "./auth/authMiddleware.ts";

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

// GLOBALNY MIDDLEWARE AUTORYZACJI - chroni wszystkie endpointy oprócz publicznych
app.use(async (ctx, next) => {
  const publicPaths = ["/api/auth/login", "/api/health"];
  const isPublic = publicPaths.some((path) => ctx.request.url.pathname.startsWith(path));

  if (isPublic) {
    await next();
  } else {
    await requireAuth(ctx, next);
  }
});

const router = new Router();

app.use(router.routes());
app.use(router.allowedMethods());

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());
app.use(clientsRouter.routes());
app.use(clientsRouter.allowedMethods());
app.use(contractsRouter.routes());
app.use(contractsRouter.allowedMethods());
app.use(eventsRouter.routes());
app.use(eventsRouter.allowedMethods());
app.use(productsRouter.routes());
app.use(productsRouter.allowedMethods());
app.use(reportsRouter.routes());
app.use(reportsRouter.allowedMethods());
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
console.log(`Check contracts there -> http://localhost:${PORT}/api/contracts`);
console.log(`Check events there -> http://localhost:${PORT}/api/events`);
console.log(`Check products there -> http://localhost:${PORT}/api/products`);
console.log(`Check reports there -> http://localhost:${PORT}/api/reports/rep-activity?rep_id=1&from=2025-01-01&to=2025-12-31`);
await app.listen({ port: PORT });
