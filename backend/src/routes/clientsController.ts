import { Router } from "oak";
import * as clientService from "../service/clientService.ts";
import { handleError } from "../utils/errorHandler.ts";

export const clientsRouter = new Router({ prefix: "/api/clients" });

// ===== ENDPOINTS =====

// GET /api/clients – lista klientów
clientsRouter.get("/", async (ctx) => {
  try {
    const clients = await clientService.listClients();
    ctx.response.body = clients;
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// GET /api/clients/:id – pobranie klienta
clientsRouter.get("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    const client = await clientService.getClientDetails(id);

    ctx.response.body = client;
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// POST /api/clients – dodanie klienta
clientsRouter.post("/", async (ctx) => {
  try {
    const body = ctx.request.body({ type: "json" });
    const data = await body.value;

    const newClient = await clientService.createClient(data);
    console.log("Client created successfully");

    ctx.response.body = newClient;
    ctx.response.status = 201;
  } catch (error) {
    handleError(ctx, error);
  }
});

// PATCH /api/clients/:id – częściowa aktualizacja klienta
clientsRouter.patch("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    const body = ctx.request.body({ type: "json" });
    const data = await body.value;

    const updatedClient = await clientService.updateClient(id, data);

    ctx.response.body = updatedClient;
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});
