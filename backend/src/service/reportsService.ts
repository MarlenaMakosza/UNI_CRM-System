import * as reportsRepo from "../repository/reportsRepository.ts";
import type { AgendaItem, RepActivity, RepAgenda } from "../types/index.ts";

/**
 * Pobierz raport aktywności przedstawiciela
 * @param przedstawicielId - ID przedstawiciela
 * @param dateFrom - data od (ISO string YYYY-MM-DD)
 * @param dateTo - data do (ISO string YYYY-MM-DD)
 */
export async function getRepActivity(
  przedstawicielId: number,
  dateFrom: string,
  dateTo: string,
): Promise<RepActivity> {
  const stats = await reportsRepo.getRepActivityStats(
    przedstawicielId,
    dateFrom,
    dateTo,
  );

  return {
    przedstawiciel_id: przedstawicielId,
    okres: {
      od: dateFrom,
      do: dateTo,
    },
    statystyki: stats,
  };
}

/**
 * Pobierz harmonogram dnia przedstawiciela
 * @param przedstawicielId - ID przedstawiciela
 * @param date - data w formacie YYYY-MM-DD
 */
export async function getRepAgenda(
  przedstawicielId: number,
  date: string,
): Promise<RepAgenda> {
  const dbItems = await reportsRepo.getRepAgendaForDay(przedstawicielId, date);

  // Mapuj surowe dane z bazy na format API
  const zdarzenia: AgendaItem[] = dbItems.map((item) => {
    // Wyciągnij godzinę z timestamp
    const dataPlanowana = new Date(item.data_planowana);
    const godzina = dataPlanowana.toTimeString().substring(0, 5); // HH:MM

    return {
      zdarzenie_id: item.zdarzenie_id,
      typ_nazwa: item.typ_nazwa,
      klient_id: item.klient_id,
      klient_nazwa: item.klient_nazwa,
      godzina: godzina,
      opis: item.opis,
      adres: {
        ulica: item.ulica,
        numer_budynku: item.numer_budynku,
        numer_lokalu: item.numer_lokalu,
        miejscowosc: item.miejscowosc,
        kod_pocztowy: item.kod_pocztowy,
      },
    };
  });

  return {
    przedstawiciel_id: przedstawicielId,
    data: date,
    zdarzenia: zdarzenia,
  };
}
