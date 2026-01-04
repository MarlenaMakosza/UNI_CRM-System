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
  DbContract,
  DbContractItem,
  DbEvent,
  DbPrzedstawiciel,
  DbUpsertAddress,
  DbUpsertClient,
  DbUpsertContract,
  DbUpsertContractItem,
  DbUpsertEvent,
} from "./database.ts";

// Errors
export type { ErrorResponse } from "./errors.ts";

// Domain - Contracts
export type {
  Contract,
  ContractDetails,
  ContractItem,
  ContractMetadata,
  ContractRelations,
  JednostkaIlosci,
  Product,
  StatusUmowy,
  TypUmowy,
  UpsertContract,
  UpsertContractItem,
  UpsertProduct,
} from "./contracts.ts";

// Reports
export type {
  AgendaItem,
  ClientTurnover,
  RepActivity,
  RepAgenda,
} from "./reports.ts";
