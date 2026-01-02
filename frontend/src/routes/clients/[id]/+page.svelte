<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { type ClientDetails } from "$lib";
  import { fetchClientById } from "$lib";

  let client = $state<ClientDetails | null>(null);
  let loading = $state(true);
  let error = $state("");

  onMount(async () => {
    const clientId = page.params.id;

    if (!clientId) {
      error = "Brak ID klienta w URL";
      loading = false;
      return;
    }

    try {
      client = await fetchClientById(clientId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Nieznany błąd";
    } finally {
      loading = false;
    }
  });

  function goBack() {
    goto("/clients");
  }
</script>

<div class="container">
  <button class="back-button" onclick={goBack}>← Powrót do listy</button>

  <h1>Szczegóły Klienta</h1>

  {#if loading}
    <p>Ładowanie...</p>
  {:else if error}
    <p class="error">Błąd: {error}</p>
  {:else if client}
    <div class="details-card">
      <section class="section">
        <h2>Dane firmowe</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Nazwa firmy:</span>
            <span class="value">{client.company_data.nazwa_firmy}</span>
          </div>
          <div class="info-item">
            <span class="label">NIP:</span>
            <span class="value">{client.company_data.nip}</span>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>Osoba kontaktowa</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Imię i nazwisko:</span>
            <span class="value"
              >{client.contact_person.imie}
              {client.contact_person.nazwisko}</span
            >
          </div>
          <div class="info-item">
            <span class="label">Stanowisko:</span>
            <span class="value">{client.contact_person.stanowisko}</span>
          </div>
          <div class="info-item">
            <span class="label">Email:</span>
            <span class="value">{client.contact_person.contact_data.email}</span>
          </div>
          <div class="info-item">
            <span class="label">Telefon:</span>
            <span class="value">{client.contact_person.contact_data.telefon}</span>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>Adres</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Ulica:</span>
            <span class="value">{client.adres.ulica}</span>
          </div>
          <div class="info-item">
            <span class="label">Numer budynku:</span>
            <span class="value">{client.adres.numer_budynku}</span>
          </div>
          {#if client.adres.numer_lokalu}
            <div class="info-item">
              <span class="label">Numer lokalu:</span>
              <span class="value">{client.adres.numer_lokalu}</span>
            </div>
          {/if}
          <div class="info-item">
            <span class="label">Kod pocztowy:</span>
            <span class="value">{client.adres.kod_pocztowy}</span>
          </div>
          <div class="info-item">
            <span class="label">Miejscowość:</span>
            <span class="value">{client.adres.miejscowosc}</span>
          </div>
          <div class="info-item">
            <span class="label">Województwo:</span>
            <span class="value">{client.adres.wojewodztwo}</span>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>Status</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Status klienta:</span>
            <span class="value status-badge">{client.status_kod}</span>
          </div>
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

  .back-button {
    background: #4a5568;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .back-button:hover {
    background: #2d3748;
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

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: #e6f7ff;
    color: #0066cc;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .error {
    color: red;
    padding: 1rem;
    background: #fee;
    border-radius: 4px;
  }
</style>
