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

  function goToEdit() {
    goto(`/clients/${page.params.id}/edit`);
  }
</script>

<div class="container">
  <div class="header-buttons">
    <button class="back-button" onclick={goBack}>← Powrót do listy</button>
    {#if client}
      <button class="edit-button" onclick={goToEdit}>Edytuj</button>
    {/if}
  </div>
  <div class="header">
    <h1>Szczegóły Klienta</h1>

  </div>

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
            <span class="label">ID Klienta:</span>
            <span class="value client-id">{client.client_metadata.id}</span>
          </div>
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
  }

</style>
