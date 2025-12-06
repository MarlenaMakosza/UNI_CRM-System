import { Application } from "oak";

const app = new Application();

app.use((ctx) => {
  if (ctx.request.url.pathname === "/health") {
    ctx.response.body = { status: "ok" };
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "Not found" };
  }
});

const port = Number(Deno.env.get("PORT") ?? "8080");
console.log(`Server running on http://localhost:${port}`);
await app.listen({ port });