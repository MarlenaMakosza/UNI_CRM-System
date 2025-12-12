<script lang="ts">
  import { onMount } from "svelte";
  import { type Client } from "../lib/types/domain.ts";

  let clients = $state<Client[]>([]);
  let loading = $state(true);
  let error = $state("");

  onMount(async () => {
    try {
      const response = await fetch("http://localhost:8080/api/clients");
      if (!response.ok) {
        throw new Error(`Błąd: ${response.statusText}`);
      }
      clients = await response.json();
    } catch (err) {
      error = err instanceof Error ? err.message : "Nieznany błąd";
    } finally {
      loading = false;
    }
  });
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
        <div class="client-card">
          <h3>{client.nazwa_firmy}</h3>
          <p><strong>NIP:</strong> {client.nip}</p>
          <p>
            <strong>Miejscowość:</strong>
            {client.miejscowosc}
          </p>
          <p><strong>Email:</strong> {client.email}</p>
          <p><strong>Telefon:</strong> {client.telefon}</p>
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
