<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fetchContractById } from "$lib";
  import type { Contract } from "$lib";

  let contract = $state<Contract | null>(null);
  let loading = $state(true);
  let error = $state("");

  onMount(async () => {
    const contractId = page.params.id;

    if (!contractId) {
      error = "Brak ID umowy w URL";
      loading = false;
      return;
    }


    try {
      contract = await fetchContractById(contractId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Nie udało się załadować umowy";
    } finally {
      loading = false;
    }
  });

  function goBack() {
    goto("/contracts");
  }

  function goToEdit() {
    if (contract) {
      goto(`/contracts/${contract.contract_metadata.id}/edit`);
    }
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
  <div class="header-buttons">
    <button class="back-button" onclick={goBack}>← Powrót do listy</button>
    {#if contract}
      <button class="edit-button" onclick={goToEdit}>Edytuj</button>
    {/if}
  </div>

  {#if loading}
    <p>Ładowanie...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if contract}
    <div class="contract-details">
      <div class="header-section">
        <h1>Umowa #{contract.contract_metadata.id}</h1>
        <span class="badge {getStatusBadgeClass(contract.details.status)}">
          {contract.details.status}
        </span>
      </div>

      <div class="section">
        <h2>Informacje podstawowe</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Typ umowy:</span>
            <span class="value">{contract.details.typ_umowy}</span>
          </div>
          <div class="info-item">
            <span class="label">Status:</span>
            <span class="value">{contract.details.status}</span>
          </div>
          <div class="info-item">
            <span class="label">Data od:</span>
            <span class="value">{formatDate(contract.details.data_od)}</span>
          </div>
          <div class="info-item">
            <span class="label">Data do:</span>
            <span class="value">{formatDate(contract.details.data_do)}</span>
          </div>
          <div class="info-item">
            <span class="label">Wartość umowy:</span>
            <span class="value value-money">{formatMoney(contract.details.wartosc_umowy)}</span>
          </div>
          <div class="info-item">
            <span class="label">Data utworzenia:</span>
            <span class="value">{formatDate(contract.contract_metadata.created_at)}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Powiązania</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Klient ID:</span>
            <a href="/clients/{contract.relations.klient_id}" class="value-link">
              {contract.relations.klient_id}
            </a>
          </div>
          <div class="info-item">
            <span class="label">Przedstawiciel ID:</span>
            <span class="value">{contract.relations.przedstawiciel_id}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Pozycje umowy ({contract.items.length})</h2>
        {#if contract.items.length === 0}
          <p class="no-items">Brak pozycji w umowie</p>
        {:else}
          <div class="items-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Produkt</th>
                  <th>Opis</th>
                  <th>Ilość</th>
                  <th>Jednostka</th>
                  <th>Cena jedn.</th>
                  <th>Wartość</th>
                </tr>
              </thead>
              <tbody>
                {#each contract.items as item}
                  <tr>
                    <td>{item.item_metadata.id}</td>
                    <td class="product-name">
                      <a href="/products/{item.product_info.produkt_id}/edit" class="product-link">
                        {item.product_info.nazwa}
                      </a>
                    </td>
                    <td class="product-desc">{item.product_info.opis}</td>
                    <td class="number">{item.item_details.ilosc}</td>
                    <td>{item.item_details.jednostka}</td>
                    <td class="number">{formatMoney(item.item_details.cena_jednostkowa)}</td>
                    <td class="number total">{formatMoney(item.item_details.wartosc)}</td>
                  </tr>
                {/each}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="6" class="total-label">Suma:</td>
                  <td class="number total-value">{formatMoney(contract.details.wartosc_umowy)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 1000px;
  }

  .header-buttons {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
  }

  .contract-details {
    background: white;
    border: 1px solid #ddd;
    overflow: hidden;
  }

  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
    background: #f7fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .header-section h1 {
    margin: 0;
    color: #2c5282;
  }

  .section {
    padding: 2rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .section:last-child {
    border-bottom: none;
  }

  .section h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #2c5282;
    font-size: 1.25rem;
  }

  .items-table {
    overflow-x: auto;
  }

  .product-name {
    font-weight: 600;
    color: #2c5282;
  }

  .product-link {
    color: #2c5282;
    text-decoration: none;
    font-weight: 600;
    border-bottom: 2px solid transparent;
  }

  .product-link:hover {
    color: #667eea;
    border-bottom-color: #667eea;
  }

  .product-desc {
    color: #666;
    font-size: 0.875rem;
  }

  .number {
    text-align: right;
  }

  .total {
    font-weight: 600;
    color: #2c5282;
  }

  tfoot {
    font-weight: 700;
    background: #f7fafc;
  }

  .total-label {
    text-align: right;
    font-size: 1rem;
  }

  .total-value {
    font-size: 1.125rem;
    color: #2c5282;
  }
</style>
