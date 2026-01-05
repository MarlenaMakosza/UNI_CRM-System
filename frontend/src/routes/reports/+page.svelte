<script lang="ts">
  import { fetchRepActivity, fetchRepAgenda, authStore } from "$lib";
  import type { RepActivity, RepAgenda } from "$lib";

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

  // Auto-ustaw przedstawiciel_id dla pracownika
  $effect(() => {
    if ($authStore.user && $authStore.user.rola === "pracownik") {
      activityRepId = String($authStore.user.id);
      agendaRepId = String($authStore.user.id);
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
</style>
