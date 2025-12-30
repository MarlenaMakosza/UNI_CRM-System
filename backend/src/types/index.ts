// ============================================================================
// EXPORT WSZYSTKIEGO
// ============================================================================

// Domain - Clients
export type {
  Address,
  AddressSummary,
  Client,
  ClientMetadata,
  ClientSummary,
  CompanyData,
  ContactData,
  ContactPerson,
  CreateClient,
  StatusKlienta,
  UpdateClient,
} from "./clients.ts";

// Domain - Events
export type {
  CreateEvent,
  Event,
  EventSummary,
  StatusZdarzenia,
  TypZdarzenia,
  UpdateEvent,
} from "./events.ts";

// Auth
export type {
  AuthUser,
  JwtPayload,
  LoginRequest,
  LoginResponse,
  RolaPracownika,
} from "./auth.ts";

// Database
export type {
  DbClientDetails,
  DbClientSummaryRow as DbClientSummaryRow,
  DbEventDetails,
  DbEventSummaryRow,
  NewAddress,
  NewClient,
  NewEvent,
} from "./database.ts";

// Errors
export type { ErrorResponse } from "./errors.ts";
