// ============================================================================
// EXPORT WSZYSTKIEGO
// ============================================================================

// Domain - Clients
export type {
  Address,
  Client,
  ClientMetadata,
  CompanyData,
  ContactData,
  ContactPerson,
  UpsertClient,
  StatusKlienta,
} from "./clients.ts";

// Auth
export type {
  AuthUser,
  CustomJwtPayload,
  LoginRequest,
  LoginResponse,
  RolaPracownika,
} from "./auth.ts";

// Domain - Events
export type {
  Event,
  EventDetails,
  EventMetadata,
  EventRelations,
  EventSchedule,
  StatusZdarzenia,
  TypZdarzenia,
  UpsertEvent,
} from "./events.ts";

// Database
export type {
  DbClient,
  DbEvent,
  DbPrzedstawiciel,
  DbUpsertAddress,
  DbUpsertClient,
  DbUpsertEvent,
} from "./database.ts";

// Errors
export type { ErrorResponse } from "./errors.ts";
