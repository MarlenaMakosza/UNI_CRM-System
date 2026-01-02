<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { type Event } from "$lib";
  import { fetchEvents } from "$lib";

  let events = $state<Event[]>([]);
  let loading = $state(true);
  let error = $state("");

  onMount(async () => {
    try {
      events = await fetchEvents();
    } catch (err) {
      error = err instanceof Error ? err.message : "Nieznany błąd";
    } finally {
      loading = false;
    }
  });

  function openEvent(eventId: number) {
    goto(`/events/${eventId}`);
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

  function getStatusBadgeClass(status: string): string {
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
  <h1>Lista Wydarzeń</h1>

  {#if loading}
    <p>Ładowanie...</p>
  {:else if error}
    <p class="error">Błąd: {error}</p>
  {:else}
    <div class="events-list">
      {#each events as event}
        <div
          class="event-card"
          onclick={() => openEvent(event.event_metadata.id)}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === "Enter" && openEvent(event.event_metadata.id)}
        >
          <div class="event-header">
            <h3>{getTypLabel(event.details.typ_nazwa)}</h3>
            <span class="status-badge {getStatusBadgeClass(event.details.status)}">
              {event.details.status}
            </span>
          </div>

          <p class="event-description">{event.details.opis}</p>

          <div class="event-meta">
            <p><strong>Klient ID:</strong> {event.relations.klient_id}</p>
            <p><strong>Przedstawiciel ID:</strong> {event.relations.przedstawiciel_id}</p>
            {#if event.relations.umowa_id !== 0}
              <p><strong>Umowa ID:</strong> {event.relations.umowa_id}</p>
            {/if}
          </div>

          <div class="event-dates">
            {#if event.schedule.data_planowana}
              <p><strong>Planowana:</strong> {formatDate(event.schedule.data_planowana)}</p>
            {/if}
            {#if event.schedule.data_realizacji}
              <p><strong>Realizacja:</strong> {formatDate(event.schedule.data_realizacji)}</p>
            {/if}
          </div>

          {#if event.details.notatki}
            <p class="event-notes"><em>Notatki: {event.details.notatki}</em></p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    color: #333;
    margin-bottom: 2rem;
  }

  .events-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .event-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .event-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: #2c5282;
  }

  .event-card:active {
    transform: translateY(0);
  }

  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .event-header h3 {
    margin: 0;
    color: #2c5282;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75rem;
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

  .event-description {
    margin: 0.5rem 0 1rem 0;
    color: #555;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .event-meta {
    margin: 1rem 0;
    padding: 0.75rem;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .event-meta p {
    margin: 0.25rem 0;
    font-size: 0.85rem;
  }

  .event-dates {
    margin: 1rem 0 0.5rem 0;
  }

  .event-dates p {
    margin: 0.25rem 0;
    font-size: 0.85rem;
    color: #666;
  }

  .event-notes {
    margin-top: 0.75rem;
    padding: 0.5rem;
    background: #fff9e6;
    border-left: 3px solid #ffc107;
    border-radius: 4px;
    font-size: 0.85rem;
    color: #666;
  }

  .error {
    color: red;
    padding: 1rem;
    background: #fee;
    border-radius: 4px;
  }
</style>
