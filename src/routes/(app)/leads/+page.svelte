<script lang="ts">
  import StatusBadge from "$lib/components/StatusBadge.svelte";
  import type { PageData } from "./$types";
  import { goto } from "$app/navigation";

  export let data: PageData;

  let statusFilter = data.filters.status || "";
  let cityFilter = data.filters.city || "";
  let sourceFilter = data.filters.source || "";
  let searchQuery = data.filters.search || "";

  function applyFilters() {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (cityFilter) params.set("city", cityFilter);
    if (sourceFilter) params.set("source", sourceFilter);
    if (searchQuery) params.set("q", searchQuery);

    goto(`/leads?${params.toString()}`);
  }

  function clearFilters() {
    statusFilter = "";
    cityFilter = "";
    sourceFilter = "";
    searchQuery = "";
    goto("/leads");
  }
</script>

<svelte:head>
  <title>Leady - CRM System</title>
</svelte:head>

<div>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Leady</h1>
    <a href="/leads/new" class="btn btn-primary">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
      Dodaj leada
    </a>
  </div>

  <!-- Filters -->
  <div class="card bg-base-100 shadow-xl mb-6">
    <div class="card-body">
      <h2 class="card-title text-lg mb-4">Filtry</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="form-control">
          <label class="label" for="search">
            <span class="label-text">Szukaj</span>
          </label>
          <input
            type="text"
            id="search"
            bind:value={searchQuery}
            placeholder="Nazwa firmy lub osoba"
            class="input input-bordered"
            on:keydown={(e) => e.key === "Enter" && applyFilters()}
          />
        </div>

        <div class="form-control">
          <label class="label" for="status">
            <span class="label-text">Status</span>
          </label>
          <select id="status" bind:value={statusFilter} class="select select-bordered">
            <option value="">Wszystkie</option>
            <option value="NEW">Nowy</option>
            <option value="QUALIFIED">Zakwalifikowany</option>
            <option value="ACTIVE">Aktywny</option>
            <option value="INACTIVE">Nieaktywny</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label" for="city">
            <span class="label-text">Miasto</span>
          </label>
          <select id="city" bind:value={cityFilter} class="select select-bordered">
            <option value="">Wszystkie</option>
            <option value="Poznan">Poznań</option>
            <option value="Wroclaw">Wrocław</option>
            <option value="Szczecin">Szczecin</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label" for="source">
            <span class="label-text">Źródło</span>
          </label>
          <select id="source" bind:value={sourceFilter} class="select select-bordered">
            <option value="">Wszystkie</option>
            <option value="Internet">Internet</option>
            <option value="Prasa">Prasa</option>
            <option value="Ksiazki branżowe">Książki branżowe</option>
            <option value="Spisy firm">Spisy firm</option>
            <option value="Polecenie">Polecenie</option>
            <option value="Inne">Inne</option>
          </select>
        </div>
      </div>

      <div class="card-actions justify-end mt-4">
        <button type="button" class="btn btn-ghost" on:click={clearFilters}>
          Wyczyść
        </button>
        <button type="button" class="btn btn-primary" on:click={applyFilters}>
          Zastosuj filtry
        </button>
      </div>
    </div>
  </div>

  <!-- Results count -->
  <div class="mb-4">
    <p class="text-sm text-base-content/70">
      Znaleziono: <strong>{data.leads.length}</strong>
      {data.leads.length === 1
        ? "lead"
        : data.leads.length >= 2 && data.leads.length <= 4
          ? "leady"
          : "leadów"}
    </p>
  </div>

  <!-- Leads list -->
  {#if data.leads.length === 0}
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body text-center py-12">
        <p class="text-base-content/70">
          Brak leadów do wyświetlenia.
          {#if data.filters.status || data.filters.city || data.filters.source || data.filters.search}
            Spróbuj zmienić filtry.
          {:else}
            Dodaj pierwszego leada!
          {/if}
        </p>
      </div>
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Firma</th>
            <th>Miasto</th>
            <th>Osoba decyzyjna</th>
            <th>Kontakt</th>
            <th>Status</th>
            <th>Źródło</th>
            <th>Przypisany do</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {#each data.leads as { lead, assignedUser }}
            <tr>
              <td>
                <a href="/leads/{lead.id}" class="link link-primary font-semibold">
                  {lead.companyName}
                </a>
              </td>
              <td>{lead.city}</td>
              <td>{lead.contactPerson || "-"}</td>
              <td class="text-sm">
                {#if lead.phone}
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 inline mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {lead.phone}
                  </div>
                {/if}
                {#if lead.email}
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 inline mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {lead.email}
                  </div>
                {/if}
              </td>
              <td>
                <StatusBadge status={lead.status} />
              </td>
              <td class="text-sm">{lead.leadSource}</td>
              <td class="text-sm">
                {#if assignedUser}
                  {assignedUser.firstName} {assignedUser.lastName}
                  {#if assignedUser.territory}
                    <span class="text-base-content/50">({assignedUser.territory})</span>
                  {/if}
                {:else}
                  -
                {/if}
              </td>
              <td>
                <div class="flex gap-2">
                  <a href="/leads/{lead.id}" class="btn btn-sm btn-ghost">
                    Szczegóły
                  </a>
                  <a href="/leads/{lead.id}/edit" class="btn btn-sm btn-ghost">
                    Edytuj
                  </a>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
