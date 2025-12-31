import { Router } from "oak";
import * as eventService from "../service/eventService.ts";
import { handleError } from "../utils/errorHandler.ts";
import { AuthUser } from "../types/index.ts";

export const eventsRouter = new Router({ prefix: "/api/events" });

// ===== ENDPOINTS =====

// GET /api/events – lista wydarzeń (filtrowane po roli)
eventsRouter.get("/", async (ctx) => {
  try {
    const user = ctx.state.user as AuthUser;
    const events = await eventService.listEvents(user);
    ctx.response.body = events;
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// GET /api/events/:id – pobranie wydarzenia
eventsRouter.get("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    const event = await eventService.getEventDetails(id);

    ctx.response.body = event;
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// POST /api/events – dodanie wydarzenia
eventsRouter.post("/", async (ctx) => {
  try {
    const body = ctx.request.body({ type: "json" });
    const data = await body.value;

    const newEvent = await eventService.createEvent(data);

    ctx.response.body = newEvent;
    ctx.response.status = 201;
  } catch (error) {
    handleError(ctx, error);
  }
});

// PATCH /api/events/:id – częściowa aktualizacja wydarzenia
eventsRouter.patch("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    const body = ctx.request.body({ type: "json" });
    const data = await body.value;

    const updatedEvent = await eventService.updateEvent(id, data);

    ctx.response.body = updatedEvent;
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// DELETE /api/events/:id – usunięcie wydarzenia
eventsRouter.delete("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    await eventService.removeEvent(id);

    ctx.response.status = 204;
  } catch (error) {
    handleError(ctx, error);
  }
});
