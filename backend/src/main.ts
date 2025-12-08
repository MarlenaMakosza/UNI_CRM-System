import { Application, Router} from "oak";
import { clientsRouter } from "./routes/clients.ts";
import { healthcheck } from "./routes/health.ts";

const app = new Application();

// proste logowanie + obsługa błędów
app.use(async (ctx, next) => {
  try {
    console.log(`${ctx.request.method} ${ctx.request.url.pathname}`);
    await next();
  } catch (err) {
    console.error("Unhandled error:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
});

const router = new Router();

app.use(router.routes());
app.use(router.allowedMethods());

// nasze API klientów
app.use(clientsRouter.routes());
app.use(clientsRouter.allowedMethods());
app.use(healthcheck.routes());
app.use(healthcheck.allowedMethods());

const PORT = Number(Deno.env.get("PORT") ?? "8080");
console.log(`API listening at http://localhost:${PORT}`);
console.log(`Check health there -> http://localhost:${PORT}/api/health`);
console.log(`Check clients there -? http://localhost:${PORT}/api/clients`)
await app.listen({ port: PORT });
