<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData, PageData } from "./$types";

  export let data: PageData;
  export let form: ActionData;
</script>

<svelte:head>
  <title>Dodaj leada - CRM System</title>
</svelte:head>

<div>
  <div class="flex items-center gap-4 mb-6">
    <a href="/leads" class="btn btn-ghost btn-sm">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
    </a>
    <h1 class="text-3xl font-bold">Dodaj leada</h1>
  </div>

  {#if form?.error}
    <div class="alert alert-error mb-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{form.error}</span>
    </div>
  {/if}

  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <form method="POST" use:enhance>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Nazwa firmy -->
          <div class="form-control">
            <label class="label" for="companyName">
              <span class="label-text">Nazwa firmy <span class="text-error">*</span></span>
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              class="input input-bordered"
              placeholder="np. Sklep U Kasi"
              required
              value={form?.values?.companyName || ""}
            />
          </div>

          <!-- Miasto -->
          <div class="form-control">
            <label class="label" for="city">
              <span class="label-text">Miasto <span class="text-error">*</span></span>
            </label>
            <select
              id="city"
              name="city"
              class="select select-bordered"
              required
              value={form?.values?.city || ""}
            >
              <option value="" disabled>Wybierz miasto</option>
              <option value="Poznan">Poznań</option>
              <option value="Wroclaw">Wrocław</option>
              <option value="Szczecin">Szczecin</option>
            </select>
          </div>

          <!-- Adres -->
          <div class="form-control md:col-span-2">
            <label class="label" for="address">
              <span class="label-text">Adres</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              class="input input-bordered"
              placeholder="ul. Przykładowa 123"
              value={form?.values?.address || ""}
            />
            <label class="label">
              <span class="label-text-alt">Ulica + numer (opcjonalne)</span>
            </label>
          </div>

          <!-- Telefon -->
          <div class="form-control">
            <label class="label" for="phone">
              <span class="label-text">Telefon</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              class="input input-bordered"
              placeholder="123456789"
              value={form?.values?.phone || ""}
            />
            <label class="label">
              <span class="label-text-alt">9-15 cyfr, opcjonalne spacje/myślniki</span>
            </label>
          </div>

          <!-- Email -->
          <div class="form-control">
            <label class="label" for="email">
              <span class="label-text">Email</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              class="input input-bordered"
              placeholder="kontakt@firma.pl"
              value={form?.values?.email || ""}
            />
            <label class="label">
              <span class="label-text-alt">Co najmniej telefon LUB email wymagany</span>
            </label>
          </div>

          <!-- Osoba decyzyjna -->
          <div class="form-control">
            <label class="label" for="contactPerson">
              <span class="label-text">Osoba decyzyjna <span class="text-error">*</span></span>
            </label>
            <input
              type="text"
              id="contactPerson"
              name="contactPerson"
              class="input input-bordered"
              placeholder="Jan Kowalski"
              required
              value={form?.values?.contactPerson || ""}
            />
            <label class="label">
              <span class="label-text-alt">Imię i nazwisko osoby podejmującej decyzje</span>
            </label>
          </div>

          <!-- Źródło leada -->
          <div class="form-control">
            <label class="label" for="leadSource">
              <span class="label-text">Źródło leada <span class="text-error">*</span></span>
            </label>
            <select
              id="leadSource"
              name="leadSource"
              class="select select-bordered"
              required
              value={form?.values?.leadSource || ""}
            >
              <option value="" disabled>Wybierz źródło</option>
              <option value="Internet">Internet</option>
              <option value="Prasa">Prasa</option>
              <option value="Ksiazki branżowe">Książki branżowe</option>
              <option value="Spisy firm">Spisy firm</option>
              <option value="Polecenie">Polecenie</option>
              <option value="Inne">Inne</option>
            </select>
          </div>

          <!-- Assigned To (only for Manager) -->
          {#if data.phUsers.length > 0}
            <div class="form-control md:col-span-2">
              <label class="label" for="assignedTo">
                <span class="label-text">Przypisz do przedstawiciela</span>
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                class="select select-bordered"
                value={form?.values?.assignedTo || ""}
              >
                <option value="">Auto-przypisanie (wg miasta)</option>
                {#each data.phUsers as ph}
                  <option value={ph.id}>
                    {ph.firstName}
                    {ph.lastName}
                    {#if ph.territory}({ph.territory}){/if}
                  </option>
                {/each}
              </select>
              <label class="label">
                <span class="label-text-alt">
                  Pozostaw puste dla automatycznego przypisania wg miasta
                </span>
              </label>
            </div>
          {/if}
        </div>

        <div class="divider"></div>

        <div class="card-actions justify-end">
          <a href="/leads" class="btn btn-ghost">Anuluj</a>
          <button type="submit" class="btn btn-primary">Dodaj leada</button>
        </div>
      </form>
    </div>
  </div>
</div>
