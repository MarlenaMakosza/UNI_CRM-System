<script lang="ts">
  import { goto } from "$app/navigation";
  import { createContract, authStore, fetchProductById } from "$lib";
  import type { TypUmowy, StatusUmowy } from "$lib";

  let klientId = $state("");
  let przedstawicielId = $state("");
  let typNazwa = $state<TypUmowy>("ramowa");
  let status = $state<StatusUmowy>("Aktywna");
  let dataOd = $state("");
  let dataDo = $state("");

  // Pozycje umowy
  type EditableItem = {
    produkt_id: number;
    ilosc: number;
    jednostka: string;
    cena_jednostkowa: number;
  };

  let items = $state<EditableItem[]>([]);

  let saving = $state(false);
  let error = $state("");

  // Auto-ustaw przedstawiciel_id dla pracownika
  $effect(() => {
    if ($authStore.user && $authStore.user.rola === "pracownik") {
      przedstawicielId = String($authStore.user.id);
    }
  });

  function addItem() {
    items = [...items, {
      produkt_id: 0,
      ilosc: 0,
      jednostka: "kg",
      cena_jednostkowa: 0,
    }];
  }

  function removeItem(index: number) {
    items = items.filter((_, i) => i !== index);
  }

  async function handleProductIdChange(index: number) {
    const item = items[index];
    if (!item.produkt_id || item.produkt_id <= 0) {
      item.cena_jednostkowa = 0;
      return;
    }

    try {
      const product = await fetchProductById(item.produkt_id);
      item.cena_jednostkowa = product.cena;
      // Wymuszamy reaktywność
      items = [...items];
    } catch (err) {
      console.error("Nie udało się pobrać ceny produktu:", err);
      item.cena_jednostkowa = 0;
    }
  }

  function calculateTotal(): number {
    return items.reduce((sum, item) => sum + (item.ilosc * item.cena_jednostkowa), 0);
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    error = "";

    try {
      // Walidacja podstawowa
      if (!klientId || !przedstawicielId || !dataOd) {
        error = "Wypełnij wszystkie wymagane pola";
        saving = false;
        return;
      }

      // Walidacja pozycji - musi być przynajmniej jedna
      if (items.length === 0) {
        error = "Umowa musi zawierać przynajmniej jeden produkt";
        saving = false;
        return;
      }

      // Walidacja pozycji
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.produkt_id || item.produkt_id <= 0) {
          error = `Pozycja ${i + 1}: Nieprawidłowy ID produktu`;
          saving = false;
          return;
        }
        if (!item.ilosc || item.ilosc <= 0) {
          error = `Pozycja ${i + 1}: Ilość musi być większa od 0`;
          saving = false;
          return;
        }
        if (!item.cena_jednostkowa || item.cena_jednostkowa <= 0) {
          error = `Pozycja ${i + 1}: Cena musi być większa od 0`;
          saving = false;
          return;
        }
      }

      // Przygotuj dane
      const contractData = {
        relations: {
          klient_id: parseInt(klientId),
          przedstawiciel_id: parseInt(przedstawicielId),
        },
        details: {
          typ_nazwa: typNazwa,
          status: status,
          data_od: dataOd,
          ...(dataDo && { data_do: dataDo }),
        },
        items: items.length > 0 ? items : undefined,
      };

      const newContract = await createContract(contractData);

      // Przekieruj do szczegółów umowy
      goto(`/contracts/${newContract.contract_metadata.id}`);
    } catch (err) {
      error = err instanceof Error ? err.message : "Nieznany błąd";
      saving = false;
    }
  }

  function handleCancel() {
    goto("/contracts");
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
    <h1>Nowa umowa</h1>
    <button class="cancel-button" onclick={handleCancel}>Anuluj</button>
  </div>

  <form class="contract-form" onsubmit={handleSubmit}>
    {#if error}
      <div class="error-message">{error}</div>
    {/if}

    <div class="form-section">
      <h2>Powiązania</h2>

      {#if $authStore.user?.rola === "pracownik"}
        <div class="info-box">
          <p>Umowa przypisana do: {$authStore.user.imie} {$authStore.user.nazwisko}</p>
        </div>
      {/if}

      <div class="form-group">
        <label for="klientId">
          Klient ID <span class="required">*</span>
        </label>
        <input
          type="number"
          id="klientId"
          bind:value={klientId}
          required
          min="1"
          placeholder="Wprowadź ID klienta"
        />
      </div>

      {#if $authStore.user?.rola === "szef"}
        <div class="form-group">
          <label for="przedstawicielId">
            Przedstawiciel ID <span class="required">*</span>
          </label>
          <input
            type="number"
            id="przedstawicielId"
            bind:value={przedstawicielId}
            required
            min="1"
            placeholder="Wprowadź ID przedstawiciela"
          />
        </div>
      {/if}
    </div>

    <div class="form-section">
      <h2>Szczegóły umowy</h2>

      <div class="form-group">
        <label for="typNazwa">Typ umowy <span class="required">*</span></label>
        <select id="typNazwa" bind:value={typNazwa} required>
          <option value="ramowa">Ramowa</option>
          <option value="jednorazowa">Jednorazowa</option>
        </select>
      </div>

      <div class="form-group">
        <label for="status">Status <span class="required">*</span></label>
        <select id="status" bind:value={status} required>
          <option value="Aktywna">Aktywna</option>
          <option value="Zakończona">Zakończona</option>
          <option value="Anulowana">Anulowana</option>
          <option value="Wstrzymana">Wstrzymana</option>
        </select>
      </div>

      <div class="form-group">
        <label for="dataOd">Data od <span class="required">*</span></label>
        <input
          type="date"
          id="dataOd"
          bind:value={dataOd}
          required
        />
      </div>

      <div class="form-group">
        <label for="dataDo">Data do (opcjonalne)</label>
        <input
          type="date"
          id="dataDo"
          bind:value={dataDo}
        />
      </div>
    </div>

    <div class="form-section">
      <div class="section-header">
        <h2>Pozycje umowy ({items.length})</h2>
        <button type="button" class="add-item-button" onclick={addItem}>
          + Dodaj pozycję
        </button>
      </div>

      {#if items.length === 0}
        <p class="no-items">Brak pozycji. Kliknij "+ Dodaj pozycję" aby dodać produkty do umowy.</p>
      {:else}
        <div class="items-list">
          {#each items as item, index}
            <div class="item-row">
              <div class="item-number">#{index + 1}</div>
              <div class="item-fields">
                <div class="field">
                  <label for="produktId-{index}">Produkt ID <span class="required">*</span></label>
                  <input
                    id="produktId-{index}"
                    type="number"
                    bind:value={item.produkt_id}
                    onchange={() => handleProductIdChange(index)}
                    min="1"
                    required
                  />
                </div>
                <div class="field">
                  <label for="ilosc-{index}">Ilość <span class="required">*</span></label>
                  <input
                    id="ilosc-{index}"
                    type="number"
                    bind:value={item.ilosc}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
                <div class="field">
                  <label for="cena-{index}">Cena jedn. (PLN)</label>
                  <input
                    id="cena-{index}"
                    type="number"
                    value={item.cena_jednostkowa}
                    readonly
                    class="readonly-field"
                  />
                </div>
                <div class="field field-total">
                  <span class="total-label-text">Wartość</span>
                  <div class="total-value">{formatMoney(item.ilosc * item.cena_jednostkowa)}</div>
                </div>
              </div>
              <button
                type="button"
                class="remove-button"
                onclick={() => removeItem(index)}
                title="Usuń pozycję"
              >
                ✕
              </button>
            </div>
          {/each}
        </div>

        <div class="total-section">
          <span class="total-label">Suma wartość umowy:</span>
          <span class="total-amount">{formatMoney(calculateTotal())}</span>
        </div>
      {/if}
    </div>

    <div class="form-actions">
      <button type="submit" class="button-primary" disabled={saving}>
        {saving ? "Zapisywanie..." : "Utwórz umowę"}
      </button>
    </div>
  </form>
</div>

<style>
  .container {
    max-width: 1000px;
  }
</style>
