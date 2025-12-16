// ============================================================================
// EXPORT WSZYSTKIEGO
// ============================================================================

// Domain
export type {
  Address,
  Client,
  ClientMetadata as NewClient,
  ClientSummary,
  StatusKlienta,
} from "./clients.ts";

// Database
export type {
  DbClientDetails,
  DbClientSummaryRow as DbClientSummaryRow,
} from "./database.ts";

// Utils
export { isEmpty, nullToEmpty, undefinedToEmpty } from "./utils.ts";
