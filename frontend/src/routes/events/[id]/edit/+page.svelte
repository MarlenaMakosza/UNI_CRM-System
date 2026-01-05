<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
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
    const eventId = page.params.id;


    if (!eventId) {
      error = "Brak ID zdarzenia w URL";
      loading = false;
      return;
    }

    try {
      event = await fetchEventById(eventId);

      if (!event) {
        error = "Brak zdarzenia o ID {eventId}";
        loading = false;
        return;
      }

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
    // Korekta strefy czasowej (+1 godzina)
    date.setHours(date.getHours() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    error = "";

    try {
      const eventId = page.params.id;

      if (!eventId) {
        error = "Brak ID wydarzenia";
        saving = false;
        return;
      }

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
    const eventId = page.params.id;
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
  }
</style>
