<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { fetchProducts, deleteProduct } from "$lib";
  import type { Product } from "$lib";

  let products = $state<Product[]>([]);
  let loading = $state(true);
  let error = $state("");

  onMount(async () => {
    await loadProducts();
  });

  async function loadProducts() {
    loading = true;
    error = "";
    try {
      products = await fetchProducts();
    } catch (err) {
      error = err instanceof Error ? err.message : "Nie udało się załadować produktów";
    } finally {
      loading = false;
    }
  }

  function goToProduct(id: number) {
    goto(`/products/${id}/edit`);
  }

  function goToNewProduct() {
    goto("/products/new");
  }

  async function handleDelete(id: number, nazwa: string) {
    if (!confirm(`Czy na pewno chcesz usunąć produkt "${nazwa}"?\n\nUwaga: Nie można usunąć produktu, który jest używany w umowach.`)) {
      return;
    }

    try {
      await deleteProduct(id);
      await loadProducts(); // Odśwież listę
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się usunąć produktu");
    }
  }

  function formatMoney(amount: number): string {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(amount);
  }
</script>

<div class="container">
  <div class="header">
    <h1>Katalog Produktów</h1>
    <button class="add-button" onclick={goToNewProduct}>+ Dodaj produkt</button>
  </div>

  {#if loading}
    <p>Ładowanie...</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if products.length === 0}
    <p class="no-data">Brak produktów w katalogu. Dodaj pierwszy produkt!</p>
  {:else}
    <div class="products-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nazwa</th>
            <th>Opis</th>
            <th>Cena</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {#each products as product}
            <tr>
              <td>{product.id}</td>
              <td class="name-col">{product.nazwa}</td>
              <td>{product.opis}</td>
              <td class="price-col">{formatMoney(product.cena)}</td>
              <td class="actions-col">
                <button
                  class="edit-button"
                  onclick={() => goToProduct(product.id)}
                  title="Edytuj"
                >
                  Edytuj
                </button>
                <button
                  class="delete-button"
                  onclick={() => handleDelete(product.id, product.nazwa)}
                  title="Usuń"
                >
                  Usuń
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="summary">
      Łącznie produktów: <strong>{products.length}</strong>
    </div>
  {/if}
</div>

<style>
  /* Style specyficzne dla tabeli produktów */
  .products-table {
    background: white;
    border: 1px solid #ddd;
  }

  .name-col {
    font-weight: bold;
    color: #2c5282;
  }

  .price-col {
    font-weight: bold;
    color: #2c5282;
    text-align: right;
  }

  .actions-col {
    text-align: center;
  }

  .summary {
    margin-top: 15px;
    padding: 15px;
    background: #f5f5f5;
    text-align: right;
  }
</style>
