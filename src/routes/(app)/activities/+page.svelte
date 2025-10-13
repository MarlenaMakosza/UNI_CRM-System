<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import type { PageData } from "./$types";

  export let data: PageData;

  function formatDate(dateString: string | Date | null): string {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL");
  }

  function handleFilterChange() {
    const url = new URL($page.url);
    const outcomeSelect = document.getElementById("outcomeFilter") as HTMLSelectElement;
    const dateFromInput = document.getElementById("dateFrom") as HTMLInputElement;
    const dateToInput = document.getElementById("dateTo") as HTMLInputElement;
    const searchInput = document.getElementById("searchQuery") as HTMLInputElement;

    if (outcomeSelect.value) {
      url.searchParams.set("outcome", outcomeSelect.value);
    } else {
      url.searchParams.delete("outcome");
    }

    if (dateFromInput.value) {
      url.searchParams.set("dateFrom", dateFromInput.value);
    } else {
      url.searchParams.delete("dateFrom");
    }

    if (dateToInput.value) {
      url.searchParams.set("dateTo", dateToInput.value);
    } else {
      url.searchParams.delete("dateTo");
    }

    if (searchInput.value) {
      url.searchParams.set("q", searchInput.value);
    } else {
      url.searchParams.delete("q");
    }

    goto(url.toString());
  }

  function clearFilters() {
    goto("/activities");
  }

  function getOutcomeLabel(outcome: string): string {
    const labels: Record<string, string> = {
      NO_ANSWER: "Nie odbiera",
      MEETING_SET: "Umówiono wizytę",
      ORDER_TAKEN: "Przyjęto zamówienie",
      INFO_SENT: "Wysłano informacje",
      OFFER_PRESENTED: "Przedstawiono ofertę",
      POST_DELIVERY_CHECK: "Kontrola po dostawie",
    };
    return labels[outcome] || outcome;
  }

  function getOutcomeBadgeClass(outcome: string): string {
    const classes: Record<string, string> = {
      NO_ANSWER: "badge-error",
      MEETING_SET: "badge-success",
      ORDER_TAKEN: "badge-primary",
      INFO_SENT: "badge-info",
      OFFER_PRESENTED: "badge-warning",
      POST_DELIVERY_CHECK: "badge-secondary",
    };
    return classes[outcome] || "badge-ghost";
  }
</script>

<svelte:head>
  <title>Kontakty telefoniczne - CRM System</title>
</svelte:head>

<div>
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold">Kontakty telefoniczne</h1>
  </div>

  <!-- Filters -->
  <div class="card bg-base-100 shadow-xl mb-6">
    <div class="card-body">
      <h2 class="card-title text-lg">Filtry</h2>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="form-control">
          <label class="label" for="outcomeFilter">
            <span class="label-text">Wynik rozmowy</span>
          </label>
          <select
            id="outcomeFilter"
            class="select select-bordered"
            value={data.filters.outcome || ""}
            on:change={handleFilterChange}
          >
            <option value="">Wszystkie</option>
            <option value="NO_ANSWER">Nie odbiera</option>
            <option value="MEETING_SET">Umówiono wizytę</option>
            <option value="ORDER_TAKEN">Przyjęto zamówienie</option>
            <option value="INFO_SENT">Wysłano informacje</option>
            <option value="OFFER_PRESENTED">Przedstawiono ofertę</option>
            <option value="POST_DELIVERY_CHECK">Kontrola po dostawie</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label" for="dateFrom">
            <span class="label-text">Data od</span>
          </label>
          <input
            type="date"
            id="dateFrom"
            class="input input-bordered"
            value={data.filters.dateFrom || ""}
            on:change={handleFilterChange}
          />
        </div>

        <div class="form-control">
          <label class="label" for="dateTo">
            <span class="label-text">Data do</span>
          </label>
          <input
            type="date"
            id="dateTo"
            class="input input-bordered"
            value={data.filters.dateTo || ""}
            on:change={handleFilterChange}
          />
        </div>

        <div class="form-control">
          <label class="label" for="searchQuery">
            <span class="label-text">Szukaj</span>
          </label>
          <input
            type="text"
            id="searchQuery"
            class="input input-bordered"
            placeholder="Notatka, osoba..."
            value={data.filters.search || ""}
            on:change={handleFilterChange}
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">&nbsp;</span>
          </label>
          <button class="btn btn-ghost" on:click={clearFilters}>Wyczyść</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Activities list -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">
        Kontakty
        <span class="badge badge-lg">{data.activities.length}</span>
      </h2>

      {#if data.activities.length === 0}
        <div class="text-center py-8 text-base-content/70">
          <p>Brak kontaktów spełniających kryteria</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Data</th>
                <th>Firma</th>
                <th>Rozmówca</th>
                <th>Wynik</th>
                <th>Notatka</th>
                <th>PH</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {#each data.activities as { activity, lead, user }}
                <tr>
                  <td>
                    <div class="font-semibold">{formatDate(activity.activityDate)}</div>
                  </td>
                  <td>
                    {#if lead}
                      <a
                        href="/leads/{lead.id}"
                        class="link link-primary font-semibold"
                      >
                        {lead.companyName}
                      </a>
                      <div class="text-sm text-base-content/70">{lead.city}</div>
                    {:else}
                      <span class="text-base-content/50">-</span>
                    {/if}
                  </td>
                  <td>
                    {#if activity.contactPersonName}
                      <div>{activity.contactPersonName}</div>
                    {:else if lead}
                      <div class="text-base-content/70">{lead.contactPerson}</div>
                    {:else}
                      <span class="text-base-content/50">-</span>
                    {/if}
                  </td>
                  <td>
                    <span class="badge {getOutcomeBadgeClass(activity.outcome)}">
                      {getOutcomeLabel(activity.outcome)}
                    </span>
                  </td>
                  <td>
                    <div class="max-w-xs truncate" title={activity.notes}>
                      {activity.notes}
                    </div>
                  </td>
                  <td>
                    {#if user}
                      <div class="text-sm">
                        {user.firstName} {user.lastName}
                      </div>
                      {#if user.territory}
                        <div class="text-xs text-base-content/70">{user.territory}</div>
                      {/if}
                    {:else}
                      <span class="text-base-content/50">-</span>
                    {/if}
                  </td>
                  <td>
                    {#if lead}
                      <a
                        href="/leads/{lead.id}"
                        class="btn btn-ghost btn-xs"
                        title="Zobacz lead"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </a>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>
</div>
