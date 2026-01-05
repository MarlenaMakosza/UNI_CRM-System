<script lang="ts">
  import { goto } from "$app/navigation";
  import { createClient } from "$lib";
  import type { StatusKlienta } from "$lib";

  // Dane firmy
  let nip = $state("");
  let nazwaFirmy = $state("");

  // Osoba kontaktowa
  let imie = $state("");
  let nazwisko = $state("");
  let stanowisko = $state("");
  let email = $state("");
  let telefon = $state("");

  // Adres
  let ulica = $state("");
  let numerBudynku = $state("");
  let numerLokalu = $state("");
  let kodPocztowy = $state("");
  let miejscowosc = $state("");
  let wojewodztwo = $state("");

  // Status
  let statusKod = $state<StatusKlienta>("PROSPEKT");

  let saving = $state(false);
  let error = $state("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    saving = true;
    error = "";

    try {
      // Walidacja podstawowa
      if (!nip || !nazwaFirmy || !imie || !nazwisko || !email || !telefon) {
        error = "Wypełnij wszystkie wymagane pola";
        saving = false;
        return;
      }

      // Walidacja NIP
      if (!/^\d{10}$/.test(nip)) {
        error = "NIP musi składać się z 10 cyfr";
        saving = false;
        return;
      }

      // Walidacja kodu pocztowego
      if (kodPocztowy && !/^\d{2}-\d{3}$/.test(kodPocztowy)) {
        error = "Kod pocztowy musi być w formacie XX-XXX";
        saving = false;
        return;
      }

      // Walidacja email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        error = "Nieprawidłowy format email";
        saving = false;
        return;
      }

      // Przygotuj dane
      const clientData = {
        contact_person: {
          imie,
          nazwisko,
          stanowisko,
          contact_data: {
            email,
            telefon,
          },
        },
        company_data: {
          nip,
          nazwa_firmy: nazwaFirmy,
        },
        adres: {
          ulica,
          numer_budynku: numerBudynku,
          numer_lokalu: numerLokalu,
          kod_pocztowy: kodPocztowy,
          miejscowosc,
          wojewodztwo,
        },
        status_kod: statusKod,
      };

      const newClient = await createClient(clientData);

      // Przekieruj do szczegółów klienta
      goto(`/clients/${newClient.client_metadata.id}`);
    } catch (err) {
      error = err instanceof Error ? err.message : "Nieznany błąd";
      saving = false;
    }
  }

  function handleCancel() {
    goto("/clients");
  }
</script>

<div class="container">
  <div class="header">
    <h1>Nowy klient</h1>
    <button class="cancel-button" onclick={handleCancel}>Anuluj</button>
  </div>

  <form class="client-form" onsubmit={handleSubmit}>
    {#if error}
      <div class="error-message">{error}</div>
    {/if}

    <div class="form-section">
      <h2>Dane firmy</h2>

      <div class="form-group">
        <label for="nip">NIP <span class="required">*</span></label>
        <input
          type="text"
          id="nip"
          bind:value={nip}
          required
          maxlength="10"
          placeholder="1234567890"
        />
      </div>

      <div class="form-group">
        <label for="nazwaFirmy">Nazwa firmy <span class="required">*</span></label>
        <input
          type="text"
          id="nazwaFirmy"
          bind:value={nazwaFirmy}
          required
          placeholder="Nazwa firmy"
        />
      </div>
    </div>

    <div class="form-section">
      <h2>Osoba kontaktowa</h2>

      <div class="form-row">
        <div class="form-group">
          <label for="imie">Imię <span class="required">*</span></label>
          <input
            type="text"
            id="imie"
            bind:value={imie}
            required
            placeholder="Jan"
          />
        </div>

        <div class="form-group">
          <label for="nazwisko">Nazwisko <span class="required">*</span></label>
          <input
            type="text"
            id="nazwisko"
            bind:value={nazwisko}
            required
            placeholder="Kowalski"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="stanowisko">Stanowisko</label>
        <input
          type="text"
          id="stanowisko"
          bind:value={stanowisko}
          placeholder="Kierownik sklepu"
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="email">Email <span class="required">*</span></label>
          <input
            type="email"
            id="email"
            bind:value={email}
            required
            placeholder="jan.kowalski@example.com"
          />
        </div>

        <div class="form-group">
          <label for="telefon">Telefon <span class="required">*</span></label>
          <input
            type="tel"
            id="telefon"
            bind:value={telefon}
            required
            placeholder="123456789"
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <h2>Adres</h2>

      <div class="form-row">
        <div class="form-group" style="flex: 2;">
          <label for="ulica">Ulica</label>
          <input
            type="text"
            id="ulica"
            bind:value={ulica}
            placeholder="Główna"
          />
        </div>

        <div class="form-group">
          <label for="numerBudynku">Nr budynku</label>
          <input
            type="text"
            id="numerBudynku"
            bind:value={numerBudynku}
            placeholder="10"
          />
        </div>

        <div class="form-group">
          <label for="numerLokalu">Nr lokalu</label>
          <input
            type="text"
            id="numerLokalu"
            bind:value={numerLokalu}
            placeholder="2"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="kodPocztowy">Kod pocztowy</label>
          <input
            type="text"
            id="kodPocztowy"
            bind:value={kodPocztowy}
            placeholder="00-000"
          />
        </div>

        <div class="form-group" style="flex: 2;">
          <label for="miejscowosc">Miejscowość</label>
          <input
            type="text"
            id="miejscowosc"
            bind:value={miejscowosc}
            placeholder="Warszawa"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="wojewodztwo">Województwo</label>
        <input
          type="text"
          id="wojewodztwo"
          bind:value={wojewodztwo}
          placeholder="mazowieckie"
        />
      </div>
    </div>

    <div class="form-section">
      <h2>Status klienta</h2>

      <div class="form-group">
        <label for="statusKod">Status <span class="required">*</span></label>
        <select id="statusKod" bind:value={statusKod} required>
          <option value="PROSPEKT">PROSPEKT</option>
          <option value="W TRAKCIE">W TRAKCIE</option>
          <option value="AKTYWNY">AKTYWNY</option>
          <option value="NIEAKTYWNY">NIEAKTYWNY</option>
          <option value="VIP">VIP</option>
        </select>
      </div>
    </div>

    <div class="form-actions">
      <button type="submit" class="button-primary" disabled={saving}>
        {saving ? "Zapisywanie..." : "Utwórz klienta"}
      </button>
    </div>
  </form>
</div>

<style>
  .container {
    max-width: 800px;
  }
</style>
