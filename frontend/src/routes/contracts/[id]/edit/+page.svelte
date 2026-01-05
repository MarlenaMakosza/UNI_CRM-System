<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fetchContractById, updateContract, authStore, fetchProductById } from "$lib";
  import type { Contract, TypUmowy, StatusUmowy } from "$lib";

  let contract = $state<Contract | null>(null);
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

  let loading = $state(true);
  let saving = $state(false);
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

      if (!contract) {
        error = "Brak umowy o takim ID {contract.id}";
        loading = false;
        return;
      }

      // Wypełnij formularz obecnymi danymi
      klientId = String(contract.relations.klient_id);
      przedstawicielId = String(contract.relations.przedstawiciel_id);
      typNazwa = contract.details.typ_umowy;
      status = contract.details.status;
      dataOd = contract.details.data_od.split("T")[0]; // YYYY-MM-DD
      dataDo = contract.details.data_do ? contract.details.data_do.split("T")[0] : "";

      // Konwertuj pozycje umowy do edytowalnej formy
      items = contract.items.map(item => ({
        produkt_id: item.product_info.produkt_id,
        ilosc: item.item_details.ilosc,
        jednostka: item.item_details.jednostka,
        cena_jednostkowa: item.item_details.cena_jednostkowa,
      }));
    } catch (err) {
      error = err instanceof Error ? err.message : "Nie udało się załadować umowy";
    } finally {
      loading = false;
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
      const contractId = page.params.id;

      if (!contractId){
        error = "Nie ma umowy o takim ID {contractId}";
        loading = false;
        return
      }

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
        if (!item.jednostka || item.jednostka.trim() === "") {
          error = `Pozycja ${i + 1}: Brak jednostki`;
          saving = false;
          return;
        }
        if (!item.cena_jednostkowa || item.cena_jednostkowa <= 0) {
          error = `Pozycja ${i + 1}: Cena musi być większa od 0`;
          saving = false;
          return;
        }
      }

      // Przygotuj dane (zgodnie z UpsertContract)
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

      await updateContract(contractId, contractData);

      // Przekieruj do szczegółów umowy
      goto(`/contracts/${contractId}`);
    } catch (err) {
      error = err instanceof Error ? err.message : "Nieznany błąd";
      saving = false;
    }
  }

  function handleCancel() {
    const contractId = page.params.id;
    goto(`/contracts/${contractId}`);
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
    <h1>Edytuj umowę</h1>
    <button class="cancel-button" onclick={handleCancel}>Anuluj</button>
  </div>

  {#if loading}
    <p>Ładowanie...</p>
  {:else if error && !contract}
    <p class="error">{error}</p>
  {:else if contract}
    <form class="contract-form" onsubmit={handleSubmit}>
      {#if error}
        <div class="error-message">{error}</div>
      {/if}

      <div class="form-section">
        <h2>Powiązania</h2>

        {#if $authStore.user?.rola === "pracownik"}
          <div class="info-box">
            <p>Umowa przypisana do: {contract.relations.przedstawiciel_id}</p>
          </div>
        {/if}

        <div class="form-group">
          <label for="klientId">Klient ID <span class="required">*</span></label>
          <input
            type="number"
            id="klientId"
            bind:value={klientId}
            required
            min="1"
          />
        </div>

        {#if $authStore.user?.rola === "szef"}
          <div class="form-group">
            <label for="przedstawicielId">Przedstawiciel ID <span class="required">*</span></label>
            <input
              type="number"
              id="przedstawicielId"
              bind:value={przedstawicielId}
              required
              min="1"
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
          <p class="no-items">Brak pozycji. Kliknij "+ Dodaj pozycję" aby dodać.</p>
        {:else}
          <div class="items-list">
            {#each items as item, index}
              <div class="item-row">
                <div class="item-number">#{index + 1}</div>
                <div class="item-fields">
                  <div class="field">
                    <label for="edit-produktId-{index}">Produkt ID <span class="required">*</span></label>
                    <input
                      id="edit-produktId-{index}"
                      type="number"
                      bind:value={item.produkt_id}
                      onchange={() => handleProductIdChange(index)}
                      min="1"
                      required
                    />
                  </div>
                  <div class="field">
                    <label for="edit-ilosc-{index}">Ilość <span class="required">*</span></label>
                    <input
                      id="edit-ilosc-{index}"
                      type="number"
                      bind:value={item.ilosc}
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                  <div class="field">
                    <label for="edit-jednostka-{index}">Jednostka <span class="required">*</span></label>
                    <select id="edit-jednostka-{index}" bind:value={item.jednostka} required>
                      <option value="kg">kg</option>
                      <option value="szt">szt</option>
                      <option value="opakowanie">opakowanie</option>
                    </select>
                  </div>
                  <div class="field">
                    <label for="edit-cena-{index}">Cena jedn. (PLN)</label>
                    <input
                      id="edit-cena-{index}"
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
          {saving ? "Zapisywanie..." : "Zapisz zmiany"}
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .container {
    max-width: 1000px;
  }
</style>
