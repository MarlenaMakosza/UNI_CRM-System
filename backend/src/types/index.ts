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
  CreateClient,
  StatusKlienta,
  UpdateClient,
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
  CreateEvent,
  Event,
  EventDetails,
  EventMetadata,
  EventRelations,
  EventSchedule,
  StatusZdarzenia,
  TypZdarzenia,
  UpdateEvent,
} from "./events.ts";

// Database
export type {
  DbClient,
  DbEvent,
  DbPrzedstawiciel,
  NewAddress,
  NewClient,
  NewEvent,
} from "./database.ts";

// Errors
export type { ErrorResponse } from "./errors.ts";
