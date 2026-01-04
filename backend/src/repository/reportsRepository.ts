import { sql } from "db";

/**
 * Pobierz statystyki aktywności przedstawiciela
 * @param przedstawicielId - ID przedstawiciela
 * @param dateFrom - data od (ISO string)
 * @param dateTo - data do (ISO string)
 */
export async function getRepActivityStats(
  przedstawicielId: number,
  dateFrom: string,
  dateTo: string,
): Promise<{
  liczba_wizyt_zrealizowanych: number;
  liczba_telefonow_wykonanych: number;
  liczba_zawartych_umow: number;
  suma_wartosci_umow: number;
  liczba_wizyt_zaplanowanych: number;
}> {
  // Liczba zrealizowanych wizyt
  const wizytResult = await sql<{ count: number }[]>`
    SELECT COUNT(*) as count
    FROM zdarzenie z
    JOIN typ_zdarzenia t ON z.typ_id = t.id
    WHERE z.przedstawiciel_id = ${przedstawicielId}
      AND t.nazwa = 'wizyta'
      AND z.status = 'zrealizowane'
      AND z.data_realizacji >= ${dateFrom}
      AND z.data_realizacji <= ${dateTo}
  `;
  const liczbaWizyt = Number(wizytResult[0]?.count || 0);

  // Liczba wykonanych telefonów (wszystkie typy telefonów)
  const telefonResult = await sql<{ count: number }[]>`
    SELECT COUNT(*) as count
    FROM zdarzenie z
    JOIN typ_zdarzenia t ON z.typ_id = t.id
    WHERE z.przedstawiciel_id = ${przedstawicielId}
      AND t.nazwa IN ('telefon', 'follow-up', 'telefon_po_dostawie')
      AND z.status = 'zrealizowane'
      AND z.data_realizacji >= ${dateFrom}
      AND z.data_realizacji <= ${dateTo}
  `;
  const liczbaTelefonow = Number(telefonResult[0]?.count || 0);

  // Liczba zawartych umów i ich suma
  const umowResult = await sql<{ count: number; suma: number }[]>`
    SELECT
      COUNT(*) as count,
      COALESCE(SUM(wartosc_umowy), 0) as suma
    FROM umowa
    WHERE przedstawiciel_id = ${przedstawicielId}
      AND created_at >= ${dateFrom}
      AND created_at <= ${dateTo}
  `;
  const liczbaUmow = Number(umowResult[0]?.count || 0);
  const sumaUmow = Number(umowResult[0]?.suma || 0);

  // Liczba zaplanowanych wizyt w przyszłości (od dzisiaj)
  const dzisiaj = new Date().toISOString().split("T")[0];
  const planowalneResult = await sql<{ count: number }[]>`
    SELECT COUNT(*) as count
    FROM zdarzenie z
    JOIN typ_zdarzenia t ON z.typ_id = t.id
    WHERE z.przedstawiciel_id = ${przedstawicielId}
      AND t.nazwa = 'wizyta'
      AND z.status = 'zaplanowane'
      AND z.data_planowana >= ${dzisiaj}
  `;
  const liczbaZaplanowanych = Number(planowalneResult[0]?.count || 0);

  return {
    liczba_wizyt_zrealizowanych: liczbaWizyt,
    liczba_telefonow_wykonanych: liczbaTelefonow,
    liczba_zawartych_umow: liczbaUmow,
    suma_wartosci_umow: sumaUmow,
    liczba_wizyt_zaplanowanych: liczbaZaplanowanych,
  };
}

/**
 * Typ dla surowych danych harmonogramu z bazy
 */
type DbAgendaItem = {
  zdarzenie_id: number;
  typ_nazwa: string;
  klient_id: number;
  klient_nazwa: string;
  data_planowana: string; // pełna timestamp ISO
  opis: string;
  ulica: string;
  numer_budynku: string;
  numer_lokalu: string;
  miejscowosc: string;
  kod_pocztowy: string;
};

/**
 * Pobierz harmonogram dnia dla przedstawiciela
 * @param przedstawicielId - ID przedstawiciela
 * @param date - data w formacie YYYY-MM-DD
 */
export async function getRepAgendaForDay(
  przedstawicielId: number,
  date: string,
): Promise<DbAgendaItem[]> {
  // Pobierz wszystkie zaplanowane zdarzenia na dany dzień z adresami klientów
  const items = await sql<DbAgendaItem[]>`
    SELECT
      z.id as zdarzenie_id,
      t.nazwa as typ_nazwa,
      z.klient_id,
      k.nazwa_firmy as klient_nazwa,
      z.data_planowana,
      z.opis,
      a.ulica,
      a.numer_budynku,
      a.numer_lokalu,
      a.miejscowosc,
      a.kod_pocztowy
    FROM zdarzenie z
    JOIN typ_zdarzenia t ON z.typ_id = t.id
    JOIN klient k ON z.klient_id = k.id
    JOIN adres a ON k.adres_id = a.id
    WHERE z.przedstawiciel_id = ${przedstawicielId}
      AND z.status = 'zaplanowane'
      AND DATE(z.data_planowana) = ${date}
    ORDER BY z.data_planowana ASC
  `;

  return items;
}
