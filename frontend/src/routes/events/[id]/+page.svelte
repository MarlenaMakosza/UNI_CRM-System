<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { type Event, type ClientDetails } from "$lib";
  import { fetchEventById, fetchClientById } from "$lib";

  let event = $state<Event | null>(null);
  let client = $state<ClientDetails | null>(null);
  let loading = $state(true);
  let error = $state("");

  onMount(async () => {
    const eventId = page.params.id;

    if (!eventId) {
      error = "Brak ID eventu w URL";
      loading = false;
      return;
    }

    try {
      event = await fetchEventById(eventId);

      // Jeśli to wizyta, pobierz też dane klienta (z adresem)
      if (event && event.details.typ_nazwa === "wizyta") {
        try {
          client = await fetchClientById(String(event.relations.klient_id));
        } catch (clientErr) {
          console.warn("Nie udało się pobrać danych klienta:", clientErr);
          // Nie przerywamy, wizytę można wyświetlić bez adresu
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Nieznany błąd";
    } finally {
      loading = false;
    }
  });

  function goBack() {
    goto("/events");
  }

  function goToEdit() {
    const eventId = page.params.id;
    goto(`/events/${eventId}/edit`);
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return "Brak daty";
    const date = new Date(dateStr);
    // Korekta strefy czasowej (+1 godzina)
    date.setHours(date.getHours() + 1);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusClass(status: string): string {
    switch (status) {
      case "zaplanowane":
        return "status-planned";
      case "zrealizowane":
        return "status-completed";
      case "odwołane":
        return "status-cancelled";
      default:
        return "";
    }
  }

  function getTypLabel(typ: string): string {
    const labels: Record<string, string> = {
      telefon: "Telefon",
      wizyta: "Wizyta",
      "follow-up": "Follow-up",
      telefon_po_dostawie: "Telefon po dostawie",
      newsletter: "Newsletter",
    };
    return labels[typ] || typ;
  }
</script>

<div class="container">
  <div class="header-buttons">
    <button class="back-button" onclick={goBack}>← Powrót do listy</button>
    {#if event}
      <button class="edit-button" onclick={goToEdit}>Edytuj</button>
    {/if}
  </div>

  <h1>Szczegóły Wydarzenia</h1>

  {#if loading}
    <p>Ładowanie...</p>
  {:else if error}
    <p class="error">Błąd: {error}</p>
  {:else if event}
    <div class="details-card">
      <section class="section">
        <div class="header-section">
          <h2>{getTypLabel(event.details.typ_nazwa)}</h2>
          <span class="status-badge {getStatusClass(event.details.status)}">
            {event.details.status}
          </span>
        </div>
      </section>

      <section class="section">
        <h2>Podstawowe informacje</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">ID wydarzenia:</span>
            <span class="value">{event.event_metadata.id}</span>
          </div>
          <div class="info-item">
            <span class="label">Data utworzenia:</span>
            <span class="value">{formatDate(event.event_metadata.created_at)}</span>
          </div>
          <div class="info-item">
            <span class="label">Typ zdarzenia:</span>
            <span class="value">{getTypLabel(event.details.typ_nazwa)}</span>
          </div>
          <div class="info-item">
            <span class="label">Status:</span>
            <span class="value">{event.details.status}</span>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>Opis</h2>
        <p class="description">{event.details.opis}</p>
      </section>

      {#if event.details.notatki}
        <section class="section">
          <h2>Notatki</h2>
          <div class="notes-box">
            <p>{event.details.notatki}</p>
          </div>
        </section>
      {/if}

      <section class="section">
        <h2>Terminy</h2>
        <div class="info-grid">
          {#if event.schedule.data_planowana}
            <div class="info-item">
              <span class="label">Data planowana:</span>
              <span class="value">{formatDate(event.schedule.data_planowana)}</span>
            </div>
          {:else}
            <div class="info-item">
              <span class="label">Data planowana:</span>
              <span class="value muted">Nie ustalono</span>
            </div>
          {/if}

          {#if event.schedule.data_realizacji}
            <div class="info-item">
              <span class="label">Data realizacji:</span>
              <span class="value">{formatDate(event.schedule.data_realizacji)}</span>
            </div>
          {:else}
            <div class="info-item">
              <span class="label">Data realizacji:</span>
              <span class="value muted">Nie zrealizowano</span>
            </div>
          {/if}
        </div>
      </section>

      <section class="section">
        <h2>Powiązania</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Klient ID:</span>
            <a href="/clients/{event.relations.klient_id}" class="id-link">
              {event.relations.klient_id}
            </a>
          </div>
          <div class="info-item">
            <span class="label">Przedstawiciel ID:</span>
            <span class="value">{event.relations.przedstawiciel_id}</span>
          </div>
          {#if event.relations.umowa_id !== 0}
            <div class="info-item">
              <span class="label">Umowa ID:</span>
              <a href="/contracts/{event.relations.umowa_id}" class="id-link">
                {event.relations.umowa_id}
              </a>
            </div>
          {:else}
            <div class="info-item">
              <span class="label">Umowa:</span>
              <span class="value muted">Brak powiązanej umowy</span>
            </div>
          {/if}
        </div>
      </section>

      {#if client && event.details.typ_nazwa === "wizyta"}
        <section class="section">
          <h2>Adres wizyty</h2>
          <div class="address-box">
            <p class="address-line">
              {client.adres.ulica} {client.adres.numer_budynku}{#if client.adres.numer_lokalu}/{client.adres.numer_lokalu}{/if}
            </p>
            <p class="address-line">
              {client.adres.kod_pocztowy} {client.adres.miejscowosc}
            </p>
            <p class="address-line">
              woj. {client.adres.wojewodztwo}
            </p>
          </div>
        </section>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Style specyficzne dla szczegółów wydarzenia */
  .container {
    max-width: 900px;
  }

  .description {
    margin: 0;
    padding: 15px;
    background: #f5f5f5;
    color: #555;
  }

  .notes-box {
    padding: 15px;
    background: #fffacd;
  }

  .notes-box p {
    margin: 0;
    color: #666;
  }

  .address-box {
    padding: 15px;
    background: #e6f0ff;
  }

  .address-line {
    margin: 5px 0;
    color: #333;
  }

  .address-line:first-child {
    font-weight: bold;
    color: #2c5282;
  }

  .id-link {
    display: inline-block;
    padding: 5px 12px;
    background: #e6f0ff;
    color: #2c5282;
    font-weight: bold;
    text-decoration: none;
    cursor: pointer;
  }

  .id-link:hover {
    background: #cce0ff;
  }
</style>
