import {Router} from "oak";
import * as eventService from "../service/eventService.ts";
import {handleError} from "../utils/errorHandler.ts";
import {AuthUser} from "../types/auth.ts";

export const eventsRouter = new Router({ prefix: "/api/events" });

// GET /api/events – lista wydarzeń
// Pracownicy widzą tylko swoje wydarzenia, szef widzi wszystko
eventsRouter.get("/", async (ctx) => {
  try {
    const user = ctx.state.user as AuthUser;

    // Jeśli pracownik - filtruj po przedstawiciel_id
    // Jeśli szef - pokaż wszystko (undefined = brak filtra)
    const przedstawicielId = user.rola === "pracownik" ? user.id : undefined;

    ctx.response.body = await eventService.listEvents(przedstawicielId);
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// GET /api/events/:id – szczegóły wydarzenia
eventsRouter.get("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    ctx.response.body = await eventService.getEventDetails(id);
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// POST /api/events – utworzenie wydarzenia
eventsRouter.post("/", async (ctx) => {
  try {
    const body = ctx.request.body({ type: "json" });
    const data = await body.value;

    ctx.response.body = await eventService.createEvent(data);
    ctx.response.status = 201;
  } catch (error) {
    handleError(ctx, error);
  }
});
// TODO "data_planowana": "2025-01-15 10:00:00", przesuwa o godzinę do tyłu gówno

// PUT /api/events/:id – aktualizacja wydarzenia (pełna zamiana)
eventsRouter.put("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    const body = ctx.request.body({ type: "json" });
    const data = await body.value;

    ctx.response.body = await eventService.updateEvent(id, data);
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// DELETE /api/events/:id – usunięcie wydarzenia
eventsRouter.delete("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    await eventService.deleteEvent(id);

    ctx.response.status = 204;
  } catch (error) {
    handleError(ctx, error);
  }
});
