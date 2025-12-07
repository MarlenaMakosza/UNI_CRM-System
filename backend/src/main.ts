import { Application, Router} from "oak";
import { clientsRouter } from "./routes/clients.ts";

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

// health-check: GET /health
router.get("/health", (ctx) => {
  ctx.response.body = { status: "ok" };
});

app.use(router.routes());
app.use(router.allowedMethods());

// nasze API klientów
app.use(clientsRouter.routes());
app.use(clientsRouter.allowedMethods());

const PORT = Number(Deno.env.get("PORT") ?? "8080");
console.log(`API listening at http://localhost:${PORT}`);
await app.listen({ port: PORT });
