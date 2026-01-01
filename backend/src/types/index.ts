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

// Auth
export type {
  AuthUser,
  CustomJwtPayload,
  LoginRequest,
  LoginResponse,
  RolaPracownika,
} from "./auth.ts";

// Database
export type {
  DbClientDetails,
  DbClientSummaryRow as DbClientSummaryRow,
  NewAddress,
  NewClient,
  DbPrzedstawiciel,
} from "./database.ts";

// Errors
export type { ErrorResponse } from "./errors.ts";
