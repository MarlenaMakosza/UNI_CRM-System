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
  StatusKlienta,
} from "./clients.ts";

// Database
export type {
  DbClientDetails,
  DbClientSummaryRow as DbClientSummaryRow,
} from "./database.ts";

// Utils
export { isEmpty, nullToEmpty, undefinedToEmpty } from "./utils.ts";
