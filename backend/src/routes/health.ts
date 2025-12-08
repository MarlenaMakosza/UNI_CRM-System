import { Router } from "oak";

export const healthcheck = new Router({ prefix: "/api/health" });

healthcheck.get("/", (ctx) => {
  if (ctx.request.url.pathname === "/api/health") {
    ctx.response.body = { status: "ok" };
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "Not found" };
  }
});
