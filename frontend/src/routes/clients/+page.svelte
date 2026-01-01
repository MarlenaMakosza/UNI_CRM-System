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
</script>

<div class="container">
  <h1>Lista Klientów CRM</h1>

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
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    color: #333;
    margin-bottom: 2rem;
  }

  .clients-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .client-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .client-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: #2c5282;
  }

  .client-card:active {
    transform: translateY(0);
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
