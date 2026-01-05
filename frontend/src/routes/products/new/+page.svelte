<script lang="ts">
  import { goto } from "$app/navigation";
  import { createProduct } from "$lib";

  let nazwa = $state("");
  let opis = $state("");
  let cena = $state("");

  let saving = $state(false);
  let error = $state("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    error = "";

    try {
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

      await createProduct(productData);

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
    <h1>Nowy produkt</h1>
    <button class="cancel-button" onclick={handleCancel}>Anuluj</button>
  </div>

  <form class="product-form" onsubmit={handleSubmit}>
    {#if error}
      <div class="error-message">{error}</div>
    {/if}

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

    <div class="form-actions">
      <button type="submit" class="button-primary" disabled={saving}>
        {saving ? "Zapisywanie..." : "Dodaj produkt"}
      </button>
    </div>
  </form>
</div>

<style>
  .container {
    max-width: 700px;
  }
</style>
