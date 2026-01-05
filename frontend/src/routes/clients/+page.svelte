<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { type Client } from "$lib";
  import { fetchClients } from "$lib";

  let clients = $state<Client[]>([]);
  let loading = $state(true);
  let error = $state("");

  onMount(async () => {
    try {
      clients = await fetchClients();
    } catch (err) {
      error = err instanceof Error ? err.message : "Nieznany błąd";
    } finally {
      loading = false;
    }
  });

  function openClient(clientId: number) {
    goto(`/clients/${clientId}`);
  }

  function goToNewClient() {
    goto("/clients/new");
  }

  function getStatusBadgeClass(status: string): string {
    switch (status) {
      case "PROSPEKT":
        return "status-prospekt";
      case "W TRAKCIE":
        return "status-w-trakcie";
      case "AKTYWNY":
        return "status-aktywny";
      case "NIEAKTYWNY":
        return "status-nieaktywny";
      case "VIP":
        return "status-vip";
      default:
        return "";
    }
  }
</script>

<div class="container">
  <div class="header">
    <h1>Lista Klientów CRM</h1>
    <button class="add-button" onclick={goToNewClient}>+ Dodaj klienta</button>
  </div>

  {#if loading}
    <p>Ładowanie...</p>
  {:else if error}
    <p class="error">Błąd: {error}</p>
  {:else}
    <div class="clients-list">
      {#each clients as client}
        <div
          class="client-card"
          onclick={() => openClient(client.client_metadata.id)}
          role="button"
          tabindex="0"
          onkeydown={(e) => e.key === "Enter" && openClient(client.client_metadata.id)}
        >
          <h3>{client.company_data.nazwa_firmy}</h3>
          <p><strong>NIP:</strong> {client.company_data.nip}</p>
          <p>
            <strong>Miejscowość:</strong>
            {client.adres.miejscowosc} ({client.adres.kod_pocztowy})
          </p>
          <p><strong>Email:</strong> {client.contact_person.contact_data.email}</p>
          <p><strong>Telefon:</strong> {client.contact_person.contact_data.telefon}</p>
          <p><strong>Status:</strong> {client.status_kod}</p>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .clients-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .client-card {
    border: 1px solid #ddd;
    padding: 1.5rem;
    background: white;
    cursor: pointer;
  }

  .client-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    border-color: #2c5282;
  }

  .client-card h3 {
    margin-top: 0;
    color: #2c5282;
  }

  .client-card p {
    margin: 0.5rem 0;
    font-size: 0.9rem;
  }

  .error {
    color: red;
    padding: 1rem;
    background: #fee;
    border-radius: 4px;
  }
</style>
