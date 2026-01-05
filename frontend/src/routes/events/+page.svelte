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

  function goToNewEvent() {
    goto("/events/new");
  }
</script>

<div class="container">
  <div class="header">
    <h1>Lista Wydarzeń</h1>
    <button class="add-button" onclick={goToNewEvent}>+ Dodaj wydarzenie</button>
  </div>

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
  .events-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
  }

  .event-card {
    border: 1px solid #ddd;
    padding: 20px;
    background: white;
    cursor: pointer;
    border-radius: 4px;
  }

  .event-card:hover {
    border-color: #667eea;
    background: #f9f9f9;
  }

  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
  }

  .event-header h3 {
    margin: 0;
    color: #2c5282;
  }

  .event-description {
    margin: 10px 0;
    color: #666;
    font-size: 14px;
  }

  .event-meta {
    margin: 15px 0;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .event-meta p {
    margin: 5px 0;
    font-size: 13px;
  }

  .event-dates {
    margin: 15px 0;
  }

  .event-dates p {
    margin: 5px 0;
    font-size: 13px;
    color: #666;
  }

  .event-notes {
    margin-top: 10px;
    padding: 10px;
    background: #fffacd;
    font-size: 13px;
    color: #666;
    border-radius: 4px;
  }
</style>
