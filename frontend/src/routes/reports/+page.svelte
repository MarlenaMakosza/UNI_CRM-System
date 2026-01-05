<script lang="ts">
  import { fetchRepActivity, fetchRepAgenda, fetchClientTurnover, fetchClients, authStore } from "$lib";
  import type { RepActivity, RepAgenda, ClientTurnover, Client } from "$lib";
  import { onMount } from "svelte";

  // Raport aktywności
  let activityRepId = $state("");
  let activityFrom = $state("");
  let activityTo = $state("");
  let activityReport = $state<RepActivity | null>(null);
  let activityLoading = $state(false);
  let activityError = $state("");

  // Harmonogram dnia
  let agendaRepId = $state("");
  let agendaDay = $state("");
  let agendaReport = $state<RepAgenda | null>(null);
  let agendaLoading = $state(false);
  let agendaError = $state("");

  // Obroty klienta
  let turnoverClientId = $state("");
  let turnoverFrom = $state("");
  let turnoverTo = $state("");
  let turnoverReport = $state<ClientTurnover | null>(null);
  let turnoverLoading = $state(false);
  let turnoverError = $state("");
  let clients = $state<Client[]>([]);
  let clientsLoading = $state(true);

  // Auto-ustaw przedstawiciel_id dla pracownika
  $effect(() => {
    if ($authStore.user && $authStore.user.rola === "pracownik") {
      activityRepId = String($authStore.user.id);
      agendaRepId = String($authStore.user.id);
    }
  });

  // Pobierz listę klientów do selecta
  onMount(async () => {
    try {
      clients = await fetchClients();
    } catch (err) {
      console.error("Nie udało się pobrać klientów:", err);
    } finally {
      clientsLoading = false;
    }
  });

  async function loadActivityReport() {
    if (!activityRepId || !activityFrom || !activityTo) {
      activityError = "Wypełnij wszystkie pola";
      return;
    }

    activityLoading = true;
    activityError = "";

    try {
      activityReport = await fetchRepActivity(
        Number(activityRepId),
        activityFrom,
        activityTo
      );
    } catch (err) {
      activityError = err instanceof Error ? err.message : "Nieznany błąd";
      activityReport = null;
    } finally {
      activityLoading = false;
    }
  }

  async function loadAgenda() {
    if (!agendaRepId || !agendaDay) {
      agendaError = "Wypełnij wszystkie pola";
      return;
    }

    agendaLoading = true;
    agendaError = "";

    try {
      agendaReport = await fetchRepAgenda(Number(agendaRepId), agendaDay);
    } catch (err) {
      agendaError = err instanceof Error ? err.message : "Nieznany błąd";
      agendaReport = null;
    } finally {
      agendaLoading = false;
    }
  }

  async function loadTurnover() {
    if (!turnoverClientId || !turnoverFrom || !turnoverTo) {
      turnoverError = "Wypełnij wszystkie pola";
      return;
    }

    turnoverLoading = true;
    turnoverError = "";

    try {
      turnoverReport = await fetchClientTurnover(
        Number(turnoverClientId),
        turnoverFrom,
        turnoverTo
      );
    } catch (err) {
      turnoverError = err instanceof Error ? err.message : "Nieznany błąd";
      turnoverReport = null;
    } finally {
      turnoverLoading = false;
    }
  }

  function formatMonth(monthStr: string): string {
    const [year, month] = monthStr.split("-");
    const monthNames = [
      "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
      "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }

  function formatMoney(amount: number): string {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  }

  function formatAddress(adres: any): string {
    let result = `${adres.ulica} ${adres.numer_budynku}`;
    if (adres.numer_lokalu) result += `/${adres.numer_lokalu}`;
    result += `, ${adres.kod_pocztowy} ${adres.miejscowosc}`;
    return result;
  }
</script>

<div class="container">
  <h1>Raporty</h1>

  <!-- RAPORT AKTYWNOŚCI -->
  <section class="report-section">
    <h2>Raport aktywności przedstawiciela</h2>

    <div class="form-card">
      <div class="form-row">
        {#if $authStore.user?.rola === "szef"}
          <div class="form-group">
            <label for="activityRepId">Przedstawiciel ID</label>
            <input
              type="number"
              id="activityRepId"
              bind:value={activityRepId}
              min="1"
              placeholder="ID przedstawiciela"
            />
          </div>
        {:else}
          <div class="info-box">
            <p>Raport dla: {$authStore.user?.imie} {$authStore.user?.nazwisko}</p>
          </div>
        {/if}

        <div class="form-group">
          <label for="activityFrom">Od</label>
          <input type="date" id="activityFrom" bind:value={activityFrom} />
        </div>

        <div class="form-group">
          <label for="activityTo">Do</label>
          <input type="date" id="activityTo" bind:value={activityTo} />
        </div>

        <div class="form-group">
          <button
            class="btn-primary"
            onclick={loadActivityReport}
            disabled={activityLoading}
          >
            {activityLoading ? "Ładowanie..." : "Pokaż raport"}
          </button>
        </div>
      </div>

      {#if activityError}
        <div class="error">{activityError}</div>
      {/if}

      {#if activityReport}
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{activityReport.statystyki.liczba_telefonow_wykonanych}</div>
            <div class="stat-label">Wykonanych telefonów</div>
          </div>

          <div class="stat-card">
            <div class="stat-value">{activityReport.statystyki.liczba_wizyt_zrealizowanych}</div>
            <div class="stat-label">Zrealizowanych wizyt</div>
          </div>

          <div class="stat-card">
            <div class="stat-value">{activityReport.statystyki.liczba_zawartych_umow}</div>
            <div class="stat-label">Zawartych umów</div>
          </div>

          <div class="stat-card highlight">
            <div class="stat-value">{formatMoney(activityReport.statystyki.suma_wartosci_umow)}</div>
            <div class="stat-label">Suma wartości umów</div>
          </div>

          <div class="stat-card">
            <div class="stat-value">{activityReport.statystyki.liczba_wizyt_zaplanowanych}</div>
            <div class="stat-label">Zaplanowanych wizyt</div>
          </div>
        </div>

        <div class="report-period">
          Okres: <strong>{activityReport.okres.od}</strong> do <strong>{activityReport.okres.do}</strong>
        </div>
      {/if}
    </div>
  </section>

  <!-- HARMONOGRAM DNIA -->
  <section class="report-section">
    <h2>Harmonogram dnia</h2>

    <div class="form-card">
      <div class="form-row">
        {#if $authStore.user?.rola === "szef"}
          <div class="form-group">
            <label for="agendaRepId">Przedstawiciel ID</label>
            <input
              type="number"
              id="agendaRepId"
              bind:value={agendaRepId}
              min="1"
              placeholder="ID przedstawiciela"
            />
          </div>
        {:else}
          <div class="info-box">
            <p>Harmonogram dla: {$authStore.user?.imie} {$authStore.user?.nazwisko}</p>
          </div>
        {/if}

        <div class="form-group">
          <label for="agendaDay">Data</label>
          <input type="date" id="agendaDay" bind:value={agendaDay} />
        </div>

        <div class="form-group">
          <button
            class="btn-primary"
            onclick={loadAgenda}
            disabled={agendaLoading}
          >
            {agendaLoading ? "Ładowanie..." : "Pokaż harmonogram"}
          </button>
        </div>
      </div>

      {#if agendaError}
        <div class="error">{agendaError}</div>
      {/if}

      {#if agendaReport}
        <div class="agenda-header">
          <h3>Zaplanowane zdarzenia na {agendaReport.data}</h3>
          <span class="event-count">{agendaReport.zdarzenia.length} zdarzeń</span>
        </div>

        {#if agendaReport.zdarzenia.length === 0}
          <p class="no-events">Brak zaplanowanych zdarzeń na ten dzień</p>
        {:else}
          <div class="agenda-list">
            {#each agendaReport.zdarzenia as event}
              <div class="agenda-item">
                <div class="time">{event.godzina}</div>
                <div class="event-details">
                  <div class="event-header">
                    <span class="event-type">{event.typ_nazwa}</span>
                    <a href="/clients/{event.klient_id}" class="client-link">
                      {event.klient_nazwa}
                    </a>
                  </div>
                  <p class="event-description">{event.opis}</p>
                  <div class="event-address">
                    {formatAddress(event.adres)}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  </section>

  <!-- OBROTY KLIENTA -->
  <section class="report-section">
    <h2>Obroty klienta</h2>

    <div class="form-card">
      <div class="form-row">
        <div class="form-group">
          <label for="turnoverClientId">Klient</label>
          {#if clientsLoading}
            <select id="turnoverClientId" disabled>
              <option>Ładowanie...</option>
            </select>
          {:else}
            <select id="turnoverClientId" bind:value={turnoverClientId}>
              <option value="">-- Wybierz klienta --</option>
              {#each clients as client}
                <option value={client.client_metadata.id}>
                  {client.company_data.nazwa_firmy} (NIP: {client.company_data.nip})
                </option>
              {/each}
            </select>
          {/if}
        </div>

        <div class="form-group">
          <label for="turnoverFrom">Od</label>
          <input type="date" id="turnoverFrom" bind:value={turnoverFrom} />
        </div>

        <div class="form-group">
          <label for="turnoverTo">Do</label>
          <input type="date" id="turnoverTo" bind:value={turnoverTo} />
        </div>

        <div class="form-group">
          <button
            class="btn-primary"
            onclick={loadTurnover}
            disabled={turnoverLoading}
          >
            {turnoverLoading ? "Ładowanie..." : "Pokaż obroty"}
          </button>
        </div>
      </div>

      {#if turnoverError}
        <div class="error">{turnoverError}</div>
      {/if}

      {#if turnoverReport}
        <div class="turnover-header">
          <h3>
            <a href="/clients/{turnoverReport.klient_id}" class="client-link">
              {turnoverReport.klient_nazwa}
            </a>
          </h3>
          <div class="turnover-summary">
            <div class="summary-item">
              <span class="summary-label">Suma obrotów:</span>
              <span class="summary-value highlight">{formatMoney(turnoverReport.suma_obrotow)}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Liczba umów:</span>
              <span class="summary-value">{turnoverReport.liczba_umow_ogolem}</span>
            </div>
          </div>
        </div>

        <div class="report-period">
          Okres: <strong>{turnoverReport.okres.od}</strong> do <strong>{turnoverReport.okres.do}</strong>
        </div>

        {#if turnoverReport.miesiace.length === 0}
          <p class="no-data">Brak umów w wybranym okresie</p>
        {:else}
          <div class="turnover-table">
            <table>
              <thead>
                <tr>
                  <th>Miesiąc</th>
                  <th class="number">Liczba umów</th>
                  <th class="number">Wartość</th>
                </tr>
              </thead>
              <tbody>
                {#each turnoverReport.miesiace as month}
                  <tr>
                    <td>{formatMonth(month.miesiac)}</td>
                    <td class="number">{month.liczba_umow}</td>
                    <td class="number">{formatMoney(month.wartosc)}</td>
                  </tr>
                {/each}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Razem</strong></td>
                  <td class="number"><strong>{turnoverReport.liczba_umow_ogolem}</strong></td>
                  <td class="number"><strong>{formatMoney(turnoverReport.suma_obrotow)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        {/if}
      {/if}
    </div>
  </section>
</div>

<style>
  /* Style specyficzne dla raportów */
  .report-section {
    margin-bottom: 40px;
  }

  .form-row {
    display: flex;
    gap: 15px;
    align-items: end;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .form-row .form-group {
    flex: 1;
    min-width: 150px;
    margin-bottom: 0;
  }

  /* Karty statystyk */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 15px;
    margin-top: 20px;
  }

  .stat-card {
    background: #f5f5f5;
    border: 1px solid #ddd;
    padding: 20px;
    text-align: center;
  }

  .stat-card.highlight {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }

  .stat-value {
    font-size: 28px;
    font-weight: bold;
    color: #2c5282;
    margin-bottom: 5px;
  }

  .stat-card.highlight .stat-value {
    color: white;
  }

  .stat-label {
    font-size: 13px;
    color: #666;
  }

  .stat-card.highlight .stat-label {
    color: white;
  }

  .report-period {
    margin-top: 20px;
    padding: 15px;
    background: #f5f5f5;
    text-align: center;
  }

  /* Harmonogram dnia */
  .agenda-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .agenda-header h3 {
    margin: 0;
    color: #2c5282;
  }

  .event-count {
    background: #667eea;
    color: white;
    padding: 5px 10px;
    font-size: 13px;
    font-weight: bold;
  }

  .agenda-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .agenda-item {
    display: flex;
    gap: 15px;
    padding: 15px;
    background: #f5f5f5;
    border-left: 4px solid #667eea;
  }

  .time {
    font-size: 18px;
    font-weight: bold;
    color: #667eea;
    min-width: 60px;
  }

  .event-details {
    flex: 1;
  }

  .event-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
  }

  .event-type {
    background: #ddd;
    color: #333;
    padding: 3px 8px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
  }

  .client-link {
    color: #2c5282;
    font-weight: bold;
  }

  .client-link:hover {
    color: #667eea;
  }

  .event-description {
    margin: 5px 0;
    color: #666;
  }

  .event-address {
    color: #999;
    font-size: 13px;
    margin-top: 5px;
  }

  /* Obroty klienta */
  .turnover-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 15px;
  }

  .turnover-header h3 {
    margin: 0;
  }

  .turnover-summary {
    display: flex;
    gap: 20px;
  }

  .summary-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .summary-label {
    color: #666;
    font-size: 14px;
  }

  .summary-value {
    font-weight: bold;
    font-size: 18px;
    color: #2c5282;
  }

  .summary-value.highlight {
    color: #667eea;
    font-size: 22px;
  }

  .turnover-table {
    margin-top: 20px;
  }

  .turnover-table .number {
    text-align: right;
  }

  .turnover-table tfoot {
    background: #f5f5f5;
  }

  .turnover-table tfoot td {
    border-top: 2px solid #667eea;
  }
</style>
