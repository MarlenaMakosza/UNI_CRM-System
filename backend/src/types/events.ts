export type StatusZdarzenia = "zaplanowane" | "zrealizowane" | "odwołane";

export type TypZdarzenia =
  | "telefon"
  | "wizyta"
  | "follow-up"
  | "telefon_po_dostawie"
  | "newsletter";

/**
 * Metadane wydarzenia
 */
export type EventMetadata = {
  id: number;
  created_at: string;
};

/**
 * Dane terminu wydarzenia
 */
export type EventSchedule = {
  data_planowana: string; // ISO string, pusty string jeśli brak
  data_realizacji: string; // ISO string, pusty string jeśli brak
};

/**
 * Szczegóły wydarzenia
 */
export type EventDetails = {
  typ_nazwa: TypZdarzenia;
  status: StatusZdarzenia;
  opis: string;
  notatki: string;
};

/**
 * Powiązania wydarzenia
 */
export type EventRelations = {
  klient_id: number;
  przedstawiciel_id: number;
  umowa_id: number; // 0 jeśli brak
};

/**
 * Event - pełne dane wydarzenia
 */
export type Event = {
  event_metadata: EventMetadata;
  relations: EventRelations;
  details: EventDetails;
  schedule: EventSchedule;
};

/**
 * Request dla tworzenia nowego wydarzenia
 * Używa zagnieżdżonej struktury zgodnej z domeną biznesową
 */
export type CreateEvent = {
  relations: {
    klient_id: number;
    przedstawiciel_id: number;
    umowa_id?: number; // Opcjonalne - może nie być powiązane z umową
  };
  details: {
    typ_nazwa: TypZdarzenia;
    status?: StatusZdarzenia; // Opcjonalne - domyślnie "zaplanowane"
    opis: string;
    notatki?: string;
  };
  schedule: {
    data_planowana?: string; // ISO string
    data_realizacji?: string; // ISO string
  };
};

/**
 * Request dla częściowej aktualizacji wydarzenia (PATCH)
 * Wszystkie pola opcjonalne - wysyłaj tylko te które chcesz zmienić
 */
export type UpdateEvent = {
  relations?: {
    klient_id?: number;
    przedstawiciel_id?: number;
    umowa_id?: number;
  };
  details?: {
    typ_nazwa?: TypZdarzenia;
    status?: StatusZdarzenia;
    opis?: string;
    notatki?: string;
  };
  schedule?: {
    data_planowana?: string;
    data_realizacji?: string;
  };
};
