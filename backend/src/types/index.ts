// ============================================================================
// EXPORT WSZYSTKIEGO
// ============================================================================

// Domain
export type { Address, ClientBase, NewClient, Client } from "./domain.ts";

// Requests
export type { CreateClientRequest, UpdateClientRequest } from "./requests.ts";
export { toEmptyString } from "./requests.ts";

// Responses
export type { ClientListResponse, ClientDetailResponse } from "./responses.ts";

// Utils
export { nullToEmpty, undefinedToEmpty, isEmpty } from "./utils.ts";
