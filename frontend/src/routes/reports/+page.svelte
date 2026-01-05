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
  /* Tylko specyficzne style dla raportów - reszta w global.css */
  h1 {
    color: #2c5282;
    margin-bottom: 2rem;
  }

  .report-section {
    margin-bottom: 3rem;
  }

  .report-section h2 {
    color: #2c5282;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }

  .form-row {
    display: flex;
    gap: 1rem;
    align-items: end;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .form-group {
    flex: 1;
    min-width: 150px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .stat-card {
    background: white;
    border: 1px solid white;
    padding: 1.5rem;
    text-align: center;
  }

  .stat-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .stat-card.highlight {
    background: #667eea;
    color: white;
    border: none;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #2c5282;
    margin-bottom: 0.5rem;
  }

  .stat-card.highlight .stat-value {
    color: white;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #666;
  }

  .stat-card.highlight .stat-label {
    color: white;
  }

  .report-period {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #edf2f7;
    text-align: center;
    color: #4a5568;
  }

  .agenda-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .agenda-header h3 {
    margin: 0;
    color: #2c5282;
  }

  .event-count {
    background: #667eea;
    color: white;
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .agenda-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .agenda-item {
    display: flex;
    gap: 1.5rem;
    padding: 1.5rem;
    background: #f7fafc;
    border-left: 4px solid #667eea;
  }

  .agenda-item:hover {
    background: #edf2f7;
  }

  .time {
    font-size: 1.25rem;
    font-weight: 700;
    color: #667eea;
    min-width: 60px;
  }

  .event-details {
    flex: 1;
  }

  .event-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .event-type {
    background: #e2e8f0;
    color: #2c5282;
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .client-link {
    color: #2c5282;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: color 0.2s;
  }

  .client-link:hover {
    color: #667eea;
    text-decoration: underline;
  }

  .event-description {
    margin: 0.5rem 0;
    color: #4a5568;
  }

  .event-address {
    color: #666;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }
</style>
