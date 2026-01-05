<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { fetchContracts } from "$lib";
  import type { Contract } from "$lib";

  let contracts = $state<Contract[]>([]);
  let loading = $state(true);
  let error = $state("");

  onMount(async () => {
    try {
      contracts = await fetchContracts();
    } catch (err) {
      error = err instanceof Error ? err.message : "Nie udało się załadować umów";
    } finally {
      loading = false;
    }
  });

  function goToContract(id: number) {
    goto(`/contracts/${id}`);
  }

  function goToNewContract() {
    goto("/contracts/new");
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("pl-PL");
  }

  function formatMoney(amount: number): string {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  }

  function getStatusBadgeClass(status: string): string {
    switch (status) {
      case "Aktywna":
        return "status-aktywna";
      case "Zakończona":
        return "status-zakonczono";
      case "Anulowana":
        return "status-anulowano";
      case "Wstrzymana":
        return "status-wstrzymano";
      default:
        return "";
    }
  }
</script>

<div class="container">
  <div class="header">
    <h1>Lista Umów</h1>
    <button class="add-button" onclick={goToNewContract}>+ Dodaj umowę</button>
  </div>

  {#if loading}
    <p>Ładowanie...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if contracts.length === 0}
    <p class="no-data">Brak umów do wyświetlenia</p>
  {:else}
    <div class="contracts-grid">
      {#each contracts as contract}
        <div
          class="contract-card"
          role="button"
          tabindex="0"
          onclick={() => goToContract(contract.contract_metadata.id)}
          onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && goToContract(contract.contract_metadata.id)}
        >
          <div class="card-header">
            <h2>Umowa #{contract.contract_metadata.id}</h2>
            <span class="badge {getStatusBadgeClass(contract.details.status)}">
              {contract.details.status}
            </span>
          </div>

          <div class="card-body">
            <div class="info-row">
              <span class="label">Typ:</span>
              <span class="value">{contract.details.typ_umowy}</span>
            </div>
            <div class="info-row">
              <span class="label">Klient ID:</span>
              <span class="value">{contract.relations.klient_id}</span>
            </div>
            <div class="info-row">
              <span class="label">Przedstawiciel ID:</span>
              <span class="value">{contract.relations.przedstawiciel_id}</span>
            </div>
            <div class="info-row">
              <span class="label">Od:</span>
              <span class="value">{formatDate(contract.details.data_od)}</span>
            </div>
            <div class="info-row">
              <span class="label">Do:</span>
              <span class="value">{formatDate(contract.details.data_do)}</span>
            </div>
            <div class="info-row">
              <span class="label">Wartość:</span>
              <span class="value value-money">{formatMoney(contract.details.wartosc_umowy)}</span>
            </div>
            <div class="info-row">
              <span class="label">Pozycji:</span>
              <span class="value">{contract.items.length}</span>
            </div>
          </div>

          <div class="card-footer">
            <small>Utworzono: {formatDate(contract.contract_metadata.created_at)}</small>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  /* Style specyficzne dla listy umów */
  .contracts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 15px;
  }

  .contract-card {
    background: white;
    border: 1px solid #ddd;
    padding: 15px;
    cursor: pointer;
  }

  .contract-card:hover {
    border-color: #667eea;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }

  .card-header h2 {
    margin: 0;
    font-size: 18px;
    color: #2c5282;
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
  }

  .card-footer {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #eee;
    color: #999;
    font-size: 12px;
  }
</style>
