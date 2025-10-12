<script lang="ts">
  import StatusBadge from "$lib/components/StatusBadge.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  function formatDate(dateString: string | Date | null): string {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL");
  }

  function formatDateTime(dateString: string | Date | null): string {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("pl-PL");
  }
</script>

<svelte:head>
  <title>{data.lead.companyName} - CRM System</title>
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
    <h1 class="text-3xl font-bold">{data.lead.companyName}</h1>
    <StatusBadge status={data.lead.status} />
  </div>

  <!-- Lead details card -->
  <div class="card bg-base-100 shadow-xl mb-6">
    <div class="card-body">
      <div class="flex justify-between items-start">
        <h2 class="card-title">Informacje podstawowe</h2>
        <a href="/leads/{data.lead.id}/edit" class="btn btn-primary btn-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edytuj
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <p class="text-sm text-base-content/70">Miasto</p>
          <p class="font-semibold">{data.lead.city}</p>
        </div>

        {#if data.lead.address}
          <div>
            <p class="text-sm text-base-content/70">Adres</p>
            <p class="font-semibold">{data.lead.address}</p>
          </div>
        {/if}

        {#if data.lead.phone}
          <div>
            <p class="text-sm text-base-content/70">Telefon</p>
            <p class="font-semibold">{data.lead.phone}</p>
          </div>
        {/if}

        {#if data.lead.email}
          <div>
            <p class="text-sm text-base-content/70">Email</p>
            <p class="font-semibold">{data.lead.email}</p>
          </div>
        {/if}

        <div>
          <p class="text-sm text-base-content/70">Osoba decyzyjna</p>
          <p class="font-semibold">{data.lead.contactPerson}</p>
        </div>

        <div>
          <p class="text-sm text-base-content/70">Źródło leada</p>
          <p class="font-semibold">{data.lead.leadSource}</p>
        </div>

        {#if data.assignedUser}
          <div>
            <p class="text-sm text-base-content/70">Przypisany do</p>
            <p class="font-semibold">
              {data.assignedUser.firstName}
              {data.assignedUser.lastName}
              {#if data.assignedUser.territory}
                ({data.assignedUser.territory})
              {/if}
            </p>
          </div>
        {/if}

        <div>
          <p class="text-sm text-base-content/70">Całkowita wartość</p>
          <p class="font-semibold">{data.lead.totalRevenue} zł</p>
        </div>

        <div>
          <p class="text-sm text-base-content/70">Data utworzenia</p>
          <p class="font-semibold">{formatDateTime(data.lead.createdAt)}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Quick actions -->
  <div class="flex flex-wrap gap-4 mb-6">
    <a href="/activities/new?leadId={data.lead.id}" class="btn btn-secondary">
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
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
      Dodaj kontakt telefoniczny
    </a>
    <a href="/visits/new?leadId={data.lead.id}" class="btn btn-accent">
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
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      Zaplanuj wizytę
    </a>
  </div>

  <!-- Timeline -->
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Historia</h2>

      {#if data.activities.length === 0 && data.visits.length === 0 && data.contracts.length === 0}
        <div class="text-center py-8 text-base-content/70">
          <p>Brak aktywności dla tego leada</p>
        </div>
      {:else}
        <div class="space-y-4">
          <!-- Activities -->
          {#each data.activities as { activity, user }}
            <div class="border-l-4 border-secondary pl-4 py-2">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold">Kontakt telefoniczny</p>
                  <p class="text-sm text-base-content/70">
                    {formatDate(activity.activityDate)} • {user?.firstName}
                    {user?.lastName}
                  </p>
                </div>
                <span class="badge badge-secondary">{activity.outcome}</span>
              </div>
              {#if activity.contactPersonName}
                <p class="text-sm mt-1">
                  Osoba kontaktowa: {activity.contactPersonName}
                </p>
              {/if}
              <p class="text-sm mt-1">{activity.notes}</p>
            </div>
          {/each}

          <!-- Visits -->
          {#each data.visits as { visit, user }}
            <div class="border-l-4 border-accent pl-4 py-2">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold">Wizyta</p>
                  <p class="text-sm text-base-content/70">
                    {formatDateTime(visit.scheduledAt)} • {user?.firstName}
                    {user?.lastName}
                  </p>
                </div>
                <StatusBadge status={visit.status} />
              </div>
              <p class="text-sm mt-1">Adres: {visit.address}</p>
              {#if visit.visitNotes}
                <p class="text-sm mt-1">{visit.visitNotes}</p>
              {/if}
              {#if visit.competitorPrices}
                <p class="text-sm mt-1">Ceny konkurencji: {visit.competitorPrices}</p>
              {/if}
            </div>
          {/each}

          <!-- Contracts -->
          {#each data.contracts as { contract, user }}
            <div class="border-l-4 border-success pl-4 py-2">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold">Kontrakt podpisany</p>
                  <p class="text-sm text-base-content/70">
                    {formatDate(contract.signedAt)} • {user?.firstName}
                    {user?.lastName}
                  </p>
                </div>
                {#if contract.contractValue}
                  <span class="badge badge-success">{contract.contractValue} zł</span>
                {/if}
              </div>
              {#if contract.products}
                <p class="text-sm mt-1">Produkty: {contract.products}</p>
              {/if}
              {#if contract.terms}
                <p class="text-sm mt-1">Warunki: {contract.terms}</p>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
