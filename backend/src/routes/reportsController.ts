import { Router } from "oak";
import * as reportsService from "../service/reportsService.ts";
import { handleError } from "../utils/errorHandler.ts";
import {
  validateRepActivityParams,
  validateRepAgendaParams,
  validateClientTurnoverParams,
} from "../utils/reportsValidation.ts";

export const reportsRouter = new Router({ prefix: "/api/reports" });

/**
 * GET /api/reports/rep-activity
 * Raport aktywności przedstawiciela
 *
 * Query params:
 * - rep_id: ID przedstawiciela (number)
 * - from: data od (YYYY-MM-DD)
 * - to: data do (YYYY-MM-DD)
 */
reportsRouter.get("/rep-activity", async (ctx) => {
  try {
    const repId = ctx.request.url.searchParams.get("rep_id");
    const from = ctx.request.url.searchParams.get("from");
    const to = ctx.request.url.searchParams.get("to");

    // Walidacja parametrów
    const repIdNumber = validateRepActivityParams(repId, from, to);

    const report = await reportsService.getRepActivity(
      repIdNumber,
      from!,
      to!,
    );

    ctx.response.status = 200;
    ctx.response.body = report;
  } catch (error) {
    handleError(ctx, error);
  }
});

/**
 * GET /api/reports/rep-agenda
 * Harmonogram dnia przedstawiciela
 *
 * Query params:
 * - rep_id: ID przedstawiciela (number)
 * - day: data (YYYY-MM-DD)
 */
reportsRouter.get("/rep-agenda", async (ctx) => {
  try {
    const repId = ctx.request.url.searchParams.get("rep_id");
    const day = ctx.request.url.searchParams.get("day");

    // Walidacja parametrów
    const repIdNumber = validateRepAgendaParams(repId, day);

    const agenda = await reportsService.getRepAgenda(repIdNumber, day!);

    ctx.response.status = 200;
    ctx.response.body = agenda;
  } catch (error) {
    handleError(ctx, error);
  }
});

/**
 * GET /api/reports/client-turnover
 * Obroty klienta w podziale na miesiące
 *
 * Query params:
 * - client_id: ID klienta (number)
 * - from: data od (YYYY-MM-DD)
 * - to: data do (YYYY-MM-DD)
 */
reportsRouter.get("/client-turnover", async (ctx) => {
  try {
    const clientId = ctx.request.url.searchParams.get("client_id");
    const from = ctx.request.url.searchParams.get("from");
    const to = ctx.request.url.searchParams.get("to");

    // Walidacja parametrów
    const clientIdNumber = validateClientTurnoverParams(clientId, from, to);

    const report = await reportsService.getClientTurnover(
      clientIdNumber,
      from!,
      to!,
    );

    ctx.response.status = 200;
    ctx.response.body = report;
  } catch (error) {
    handleError(ctx, error);
  }
});
