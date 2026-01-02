<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { type Event } from "$lib";
  import { fetchEventById } from "$lib";

  let event = $state<Event | null>(null);
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
      <button class="edit-button" onclick={goToEdit}>✏️ Edytuj</button>
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
            <span class="value">{event.relations.klient_id}</span>
          </div>
          <div class="info-item">
            <span class="label">Przedstawiciel ID:</span>
            <span class="value">{event.relations.przedstawiciel_id}</span>
          </div>
          {#if event.relations.umowa_id !== 0}
            <div class="info-item">
              <span class="label">Umowa ID:</span>
              <span class="value">{event.relations.umowa_id}</span>
            </div>
          {:else}
            <div class="info-item">
              <span class="label">Umowa:</span>
              <span class="value muted">Brak powiązanej umowy</span>
            </div>
          {/if}
        </div>
      </section>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .back-button {
    background: #4a5568;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .back-button:hover {
    background: #2d3748;
  }

  .edit-button {
    background: #667eea;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.2s ease;
  }

  .edit-button:hover {
    background: #5568d3;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
  }

  .edit-button:active {
    transform: translateY(0);
  }

  h1 {
    color: #333;
    margin-bottom: 2rem;
  }

  .details-card {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .section {
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
  }

  .section:last-child {
    border-bottom: none;
  }

  .section h2 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #2c5282;
    font-size: 1.2rem;
  }

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-section h2 {
    margin-bottom: 0;
  }

  .status-badge {
    padding: 0.5rem 1rem;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .status-planned {
    background-color: #e3f2fd;
    color: #1976d2;
  }

  .status-completed {
    background-color: #e8f5e9;
    color: #388e3c;
  }

  .status-cancelled {
    background-color: #ffebee;
    color: #d32f2f;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .label {
    font-size: 0.85rem;
    color: #666;
    font-weight: 600;
  }

  .value {
    font-size: 1rem;
    color: #333;
  }

  .value.muted {
    color: #999;
    font-style: italic;
  }

  .description {
    margin: 0;
    color: #555;
    font-size: 1rem;
    line-height: 1.6;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 4px;
    border-left: 4px solid #2c5282;
  }

  .notes-box {
    padding: 1rem;
    background: #fff9e6;
    border-left: 4px solid #ffc107;
    border-radius: 4px;
  }

  .notes-box p {
    margin: 0;
    color: #666;
    line-height: 1.6;
  }

  .error {
    color: red;
    padding: 1rem;
    background: #fee;
    border-radius: 4px;
  }
</style>
