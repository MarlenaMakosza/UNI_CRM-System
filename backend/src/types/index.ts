// ============================================================================
// EXPORT WSZYSTKIEGO
// ============================================================================

// Domain
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

// Database
export type {
  DbClientDetails,
  DbClientSummaryRow as DbClientSummaryRow,
  NewAddress,
  NewClient,
} from "./database.ts";

// Errors
export type { ErrorResponse } from "./errors.ts";
