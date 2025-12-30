export type StatusZdarzenia = "zaplanowane" | "zrealizowane" | "odwolane";

export type TypZdarzenia =
  | "telefon"
  | "wizyta"
  | "newsletter"
  | "follow-up"
  | "telefon_po_dostawie";

/**
 * Pełne dane wydarzenia (domenowa struktura)
 */
export type Event = {
  id: number;
  klient_id: number;
  przedstawiciel_id: number;
  typ_nazwa: TypZdarzenia;
  umowa_id: number; // 0 jeśli brak umowy
  data_planowana: string; // ISO 8601, OBOWIĄZKOWE
  data_realizacji: string; // ISO 8601, pusty string jeśli nie zrealizowane
  status: StatusZdarzenia;
  opis: string;
  notatki: string;
  created_at: string; // ISO 8601
};

/**
 * Uproszczona struktura dla listy wydarzeń
 */
export type EventSummary = {
  id: number;
  klient_id: number;
  typ_nazwa: TypZdarzenia;
  data_planowana: string;
  status: StatusZdarzenia;
  opis: string;
};

/**
 * Request dla tworzenia nowego wydarzenia
 */
export type CreateEvent = {
  klient_id: number;
  przedstawiciel_id: number;
  typ_nazwa: TypZdarzenia;
  umowa_id?: number; // opcjonalne, 0 jeśli brak
  data_planowana: string; // ISO 8601, OBOWIĄZKOWE
  data_realizacji?: string; // ISO 8601, opcjonalne
  status: StatusZdarzenia; // OBOWIĄZKOWE
  opis: string;
  notatki?: string; // opcjonalne, pusty string jeśli brak
};

/**
 * Request dla częściowej aktualizacji wydarzenia (PATCH)
 */
export type UpdateEvent = {
  klient_id?: number;
  przedstawiciel_id?: number;
  typ_nazwa?: TypZdarzenia;
  umowa_id?: number; // 0 = brak umowy
  data_planowana?: string;
  data_realizacji?: string;
  status?: StatusZdarzenia;
  opis?: string;
  notatki?: string;
};
