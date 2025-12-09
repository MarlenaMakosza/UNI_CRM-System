import { Router } from "oak";
import * as clientService from "../service/clientService.ts";
import { handleError } from "../utils/errorHandler.ts";
import { validateId } from "../utils/validation.ts";
export const clientsRouter = new Router({ prefix: "/api/clients" });

// ===== ENDPOINTS =====

// GET /api/clients – lista klientów
clientsRouter.get("/", async (ctx) => {
  try {
    const clients = await clientService.listAllClients();
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
    validateId(id);

    const client = await clientService.getClientDetails(id);

    if (!client) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Client not found" };
      return;
    }

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

    const newClient = await clientService.createNewClient(data);

    ctx.response.body = newClient;
    ctx.response.status = 201;
  } catch (error) {
    handleError(ctx, error);
  }
});

// PATCH /api/clients/:id – aktualizacja klienta
clientsRouter.patch("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    validateId(id);

    const body = ctx.request.body({ type: "json" });
    const data = await body.value;

    const updatedClient = await clientService.updateExistingClient(id, data);

    if (!updatedClient) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Client not found" };
      return;
    }

    ctx.response.body = updatedClient;
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// DELETE /api/clients/:id – usunięcie
clientsRouter.delete("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    validateId(id);

    const deleted = await clientService.removeClient(id);

    if (!deleted) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Client not found" };
      return;
    }

    ctx.response.status = 204;
  } catch (error) {
    handleError(ctx, error);
  }
});
