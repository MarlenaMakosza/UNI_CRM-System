<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fetchProductById, updateProduct } from "$lib";
  import type { Product } from "$lib";

  let product = $state<Product | null>(null);
  let nazwa = $state("");
  let opis = $state("");
  let cena = $state("");

  let loading = $state(true);
  let saving = $state(false);
  let error = $state("");

  onMount(async () => {
    const productId = page.params.id;

    if (!productId) {
      error = "Brak ID produktu w URL";
      loading = false;
      return;
    }

    try {
      product = await fetchProductById(productId);

      if (!product) {
        error = "Brak produktu o ID {productId}";
        loading = false;
        return;
      }

      // Wypełnij formularz obecnymi danymi
      nazwa = product.nazwa;
      opis = product.opis;
      cena = String(product.cena);
    } catch (err) {
      error = err instanceof Error ? err.message : "Nie udało się załadować produktu";
    } finally {
      loading = false;
    }
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    saving = true;
    error = "";

    try {
      const productId = $page.params.id;

      // Walidacja podstawowa
      if (!nazwa || !opis || !cena) {
        error = "Wypełnij wszystkie pola";
        saving = false;
        return;
      }

      const cenaNumber = parseFloat(cena);
      if (isNaN(cenaNumber) || cenaNumber <= 0) {
        error = "Cena musi być liczbą większą od 0";
        saving = false;
        return;
      }

      // Przygotuj dane
      const productData = {
        nazwa: nazwa.trim(),
        opis: opis.trim(),
        cena: cenaNumber,
      };

      await updateProduct(productId, productData);

      // Przekieruj do listy produktów
      goto("/products");
    } catch (err) {
      error = err instanceof Error ? err.message : "Nieznany błąd";
      saving = false;
    }
  }

  function handleCancel() {
    goto("/products");
  }
</script>

<div class="container">
  <div class="header">
    <h1>Edytuj produkt</h1>
    <button class="cancel-button" onclick={handleCancel}>Anuluj</button>
  </div>

  {#if loading}
    <p>Ładowanie...</p>
  {:else if error && !product}
    <p class="error">{error}</p>
  {:else if product}
    <form class="product-form" onsubmit={handleSubmit}>
      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <div class="product-id">
        Produkt ID: <strong>{product.id}</strong>
      </div>

      <div class="form-group">
        <label for="nazwa">
          Nazwa produktu <span class="required">*</span>
        </label>
        <input
          type="text"
          id="nazwa"
          bind:value={nazwa}
          required
          maxlength="100"
          placeholder="np. Ziemniaki ekologiczne"
        />
        <small>Maksymalnie 100 znaków</small>
      </div>

      <div class="form-group">
        <label for="opis">
          Opis <span class="required">*</span>
        </label>
        <textarea
          id="opis"
          bind:value={opis}
          required
          rows="4"
          placeholder="Szczegółowy opis produktu..."
        ></textarea>
      </div>

      <div class="form-group">
        <label for="cena">
          Cena (PLN) <span class="required">*</span>
        </label>
        <input
          type="number"
          id="cena"
          bind:value={cena}
          required
          min="0.01"
          step="0.01"
          placeholder="0.00"
        />
        <small>Podaj cenę katalogową za jednostkę</small>
      </div>

      <div class="warning-box">
        <strong>Uwaga:</strong> Zmiana ceny nie wpłynie na istniejące umowy.
        Umowy zawierają cenę z momentu ich utworzenia.
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
    max-width: 700px;
  }

  .product-id {
    background: #f7fafc;
    padding: 0.75rem;
    margin-bottom: 1.5rem;
    color: #4a5568;
    font-size: 0.9rem;
  }

  .warning-box {
    background: #fffbeb;
    border-left: 4px solid #f59e0b;
    padding: 1rem;
    margin-bottom: 2rem;
    color: #78350f;
    font-size: 0.9rem;
  }
</style>
