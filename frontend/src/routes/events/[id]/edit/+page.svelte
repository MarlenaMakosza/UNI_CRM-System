<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { fetchEventById, updateEvent, authStore } from "$lib";
  import type { Event, TypZdarzenia, StatusZdarzenia } from "$lib";

  let event = $state<Event | null>(null);
  let klientId = $state("");
  let przedstawicielId = $state("");
  let umowaId = $state("");
  let typNazwa = $state<TypZdarzenia>("telefon");
  let status = $state<StatusZdarzenia>("zaplanowane");
  let opis = $state("");
  let notatki = $state("");
  let dataPlanowana = $state("");
  let dataRealizacji = $state("");

  let loading = $state(true);
  let saving = $state(false);
  let error = $state("");

  onMount(async () => {
    const eventId = $page.params.id;

    try {
      event = await fetchEventById(eventId);

      // Wypełnij formularz obecnymi danymi
      klientId = String(event.relations.klient_id);
      przedstawicielId = String(event.relations.przedstawiciel_id);
      umowaId = event.relations.umowa_id !== 0 ? String(event.relations.umowa_id) : "";
      typNazwa = event.details.typ_nazwa;
      status = event.details.status;
      opis = event.details.opis;
      notatki = event.details.notatki || "";

      // Konwertuj daty z ISO na format datetime-local
      if (event.schedule.data_planowana) {
        dataPlanowana = formatDateForInput(event.schedule.data_planowana);
      }
      if (event.schedule.data_realizacji) {
        dataRealizacji = formatDateForInput(event.schedule.data_realizacji);
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Nie udało się załadować wydarzenia";
    } finally {
      loading = false;
    }
  });

  function formatDateForInput(isoString: string): string {
    if (!isoString) return "";
    // Konwersja z ISO do formatu datetime-local (YYYY-MM-DDTHH:mm)
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    saving = true;
    error = "";

    try {
      const eventId = $page.params.id;

      // Walidacja podstawowa
      if (!klientId || !opis || !dataPlanowana) {
        error = "Wypełnij wszystkie wymagane pola (Klient ID, Opis i Data planowana)";
        saving = false;
        return;
      }

      // Przygotuj dane zgodnie z typem CreateEvent (wszystkie pola)
      const eventData = {
        relations: {
          klient_id: parseInt(klientId),
          przedstawiciel_id: parseInt(przedstawicielId),
          ...(umowaId && { umowa_id: parseInt(umowaId) }),
        },
        details: {
          typ_nazwa: typNazwa,
          status: status,
          opis: opis,
          ...(notatki && { notatki }),
        },
        schedule: {
          data_planowana: dataPlanowana, // Wymagane
          ...(dataRealizacji && { data_realizacji: dataRealizacji }),
        },
      };

      await updateEvent(eventId, eventData);

      // Przekieruj do szczegółów wydarzenia
      goto(`/events/${eventId}`);
    } catch (err) {
      error = err instanceof Error ? err.message : "Nieznany błąd";
      saving = false;
    }
  }

  function handleCancel() {
    const eventId = $page.params.id;
    goto(`/events/${eventId}`);
  }
</script>

<div class="container">
  <div class="header">
    <h1>Edytuj wydarzenie</h1>
    <button class="cancel-button" onclick={handleCancel}>Anuluj</button>
  </div>

  {#if loading}
    <p>Ładowanie...</p>
  {:else if error && !event}
    <p class="error">{error}</p>
  {:else if event}
    <form class="event-form" onsubmit={handleSubmit}>
      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <div class="form-section">
        <h2>Powiązania</h2>

        {#if $authStore.user?.rola === "pracownik"}
          <div class="info-box">
            <p>Wydarzenie przypisane do: {event.relations.przedstawiciel_id}</p>
          </div>
        {/if}

        <div class="form-group">
          <label for="klientId">Klient ID</label>
          <input
            type="number"
            id="klientId"
            bind:value={klientId}
            min="1"
            placeholder="Wprowadź ID klienta"
          />
        </div>

        {#if $authStore.user?.rola === "szef"}
          <div class="form-group">
            <label for="przedstawicielId">Przedstawiciel ID</label>
            <input
              type="number"
              id="przedstawicielId"
              bind:value={przedstawicielId}
              min="1"
              placeholder="Wprowadź ID przedstawiciela"
            />
          </div>
        {/if}

        <div class="form-group">
          <label for="umowaId">Umowa ID (opcjonalne)</label>
          <input
            type="number"
            id="umowaId"
            bind:value={umowaId}
            min="1"
            placeholder="Wprowadź ID umowy (jeśli dotyczy)"
          />
        </div>
      </div>

      <div class="form-section">
        <h2>Szczegóły wydarzenia</h2>

        <div class="form-group">
          <label for="typNazwa">Typ zdarzenia</label>
          <select id="typNazwa" bind:value={typNazwa}>
            <option value="telefon">Telefon</option>
            <option value="wizyta">Wizyta</option>
            <option value="follow-up">Follow-up</option>
            <option value="telefon_po_dostawie">Telefon po dostawie</option>
            <option value="newsletter">Newsletter</option>
          </select>
        </div>

        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" bind:value={status}>
            <option value="zaplanowane">Zaplanowane</option>
            <option value="zrealizowane">Zrealizowane</option>
            <option value="odwołane">Odwołane</option>
          </select>
        </div>

        <div class="form-group">
          <label for="opis">Opis</label>
          <textarea
            id="opis"
            bind:value={opis}
            rows="4"
            placeholder="Opisz cel i przebieg wydarzenia..."
          ></textarea>
        </div>

        <div class="form-group">
          <label for="notatki">Notatki (opcjonalne)</label>
          <textarea
            id="notatki"
            bind:value={notatki}
            rows="3"
            placeholder="Dodatkowe notatki, uwagi, ceny konkurencji..."
          ></textarea>
        </div>
      </div>

      <div class="form-section">
        <h2>Terminy</h2>

        <div class="form-group">
          <label for="dataPlanowana">Data planowana</label>
          <input
            type="datetime-local"
            id="dataPlanowana"
            bind:value={dataPlanowana}
          />
        </div>

        <div class="form-group">
          <label for="dataRealizacji">Data realizacji (opcjonalne)</label>
          <input
            type="datetime-local"
            id="dataRealizacji"
            bind:value={dataRealizacji}
          />
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="button-secondary" onclick={handleCancel}>
          Anuluj
        </button>
        <button type="submit" class="button-primary" disabled={saving}>
          {saving ? "Zapisywanie..." : "Zapisz zmiany"}
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  h1 {
    margin: 0;
    color: #333;
  }

  .cancel-button {
    background: #e2e8f0;
    color: #4a5568;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .cancel-button:hover {
    background: #cbd5e0;
  }

  .event-form {
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .error-message, .error {
    background: #fee;
    color: #c53030;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    border-left: 4px solid #e53e3e;
  }

  .form-section {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #eee;
  }

  .form-section:last-of-type {
    border-bottom: none;
  }

  .form-section h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #2c5282;
    font-size: 1.1rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: #4a5568;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .form-group input[type="number"],
  .form-group input[type="datetime-local"],
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .form-group textarea {
    resize: vertical;
  }

  .info-box {
    background: #e6f7ff;
    border-left: 4px solid #1890ff;
    padding: 1rem;
    margin-bottom: 1.5rem;
    border-radius: 4px;
  }

  .info-box p {
    margin: 0;
    color: #0050b3;
    font-size: 0.9rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #eee;
  }

  .button-primary,
  .button-secondary {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button-primary {
    background: #667eea;
    color: white;
  }

  .button-primary:hover:not(:disabled) {
    background: #5568d3;
  }

  .button-primary:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }

  .button-secondary {
    background: #e2e8f0;
    color: #4a5568;
  }

  .button-secondary:hover {
    background: #cbd5e0;
  }
</style>
