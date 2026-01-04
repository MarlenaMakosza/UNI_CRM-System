// ============================================================================
// TYPY ENUMERACYJNE
// ============================================================================

export type TypUmowy = "ramowa" | "jednorazowa";

export type StatusUmowy =
  | "Aktywna"
  | "Zakończona"
  | "Anulowana"
  | "Wstrzymana";

export type JednostkaIlosci = "kg" | "szt" | "opakowanie";

// ============================================================================
// TYPY DOMENOWE - UMOWA (CONTRACT)
// ============================================================================

/**
 * Metadane umowy
 */
export type ContractMetadata = {
  id: number;
  created_at: string; // ISO string
};

/**
 * Powiązania umowy
 */
export type ContractRelations = {
  klient_id: number;
  przedstawiciel_id: number;
};

/**
 * Szczegóły umowy
 */
export type ContractDetails = {
  typ_umowy: TypUmowy;
  status: StatusUmowy;
  data_od: string; // ISO string (DATE z bazy)
  data_do: string; // ISO string (DATE z bazy), pusty string jeśli NULL
  wartosc_umowy: number; // NUMERIC(14,2)
};

/**
 * Pojedyncza pozycja umowy
 */
export type ContractItem = {
  item_metadata: {
    id: number;
  };
  product_info: {
    produkt_id: number;
    nazwa: string;
    opis: string;
  };
  item_details: {
    ilosc: number; // NUMERIC(10,2)
    jednostka: string;
    cena_jednostkowa: number; // NUMERIC(12,2)
    wartosc: number; // NUMERIC(14,2) - GENERATED column
  };
};

/**
 * Pełne dane umowy
 */
export type Contract = {
  contract_metadata: ContractMetadata;
  relations: ContractRelations;
  details: ContractDetails;
  items: ContractItem[]; // Pozycje umowy
};

// ============================================================================
// TYPY REQUEST - UPSERT
// ============================================================================

/**
 * Request dla tworzenia/aktualizacji pozycji umowy
 */
export type UpsertContractItem = {
  produkt_id: number;
  ilosc: number;
  jednostka: string;
  cena_jednostkowa: number;
  // wartosc jest auto-generowane przez bazę (GENERATED column)
};

/**
 * Request dla tworzenia/aktualizacji umowy
 */
export type UpsertContract = {
  relations: {
    klient_id: number;
    przedstawiciel_id: number;
  };
  details: {
    typ_nazwa: TypUmowy;
    status: StatusUmowy;
    data_od: string; // ISO string lub format YYYY-MM-DD
    data_do?: string; // ISO string lub format YYYY-MM-DD, opcjonalne
  };
  items?: UpsertContractItem[]; // Opcjonalne przy tworzeniu, można dodać później
};

// ============================================================================
// TYPY POMOCNICZE - PRODUKT
// ============================================================================

/**
 * Dane produktu z katalogu
 */
export type Product = {
  id: number;
  nazwa: string;
  opis: string;
  cena: number; // NUMERIC(12,2) - cena katalogowa
};

/**
 * Request dla tworzenia/aktualizacji produktu
 */
export type UpsertProduct = {
  nazwa: string;
  opis: string;
  cena: number;
};
