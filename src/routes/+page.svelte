<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<svelte:head>
  <title>Dashboard - CRM System</title>
</svelte:head>

<div class="min-h-screen bg-base-200">
  <!-- Navbar -->
  <div class="navbar bg-base-100 shadow-lg">
    <div class="flex-1">
      <a href="/" class="btn btn-ghost normal-case text-xl">CRM - Firma X</a>
    </div>
    <div class="flex-none gap-2">
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-circle avatar placeholder">
          <div class="bg-neutral-focus text-neutral-content rounded-full w-10">
            <span class="text-xl">
              {data.user.firstName[0]}{data.user.lastName[0]}
            </span>
          </div>
        </label>
        <ul
          tabindex="0"
          class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
        >
          <li class="menu-title">
            <span>
              {data.user.firstName}
              {data.user.lastName}
            </span>
          </li>
          <li>
            <span class="text-sm">
              {#if data.user.role === "MANAGER"}
                Kierownik
              {:else}
                Przedstawiciel Handlowy
                {#if data.user.territory}
                  ({data.user.territory})
                {/if}
              {/if}
            </span>
          </li>
          <li class="divider"></li>
          <li>
            <form method="POST" action="/logout" use:enhance>
              <button type="submit" class="text-error">Wyloguj</button>
            </form>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Main content -->
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">
        Witaj, {data.user.firstName}!
      </h1>
      <p class="text-base-content/70 mt-2">
        {#if data.user.role === "MANAGER"}
          Panel Kierownika - Przegladaj statystyki i raporty
        {:else}
          Panel Przedstawiciela Handlowego - Zarzadzaj swoimi leadami
        {/if}
      </p>
    </div>

    <!-- Dashboard cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Leady</h2>
          <p class="text-3xl font-bold">0</p>
          <p class="text-sm text-base-content/70">Wszystkich leadow</p>
          <div class="card-actions justify-end mt-4">
            <a href="/leads" class="btn btn-primary btn-sm">Zobacz leady</a>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Wizyty dzisiaj</h2>
          <p class="text-3xl font-bold">0</p>
          <p class="text-sm text-base-content/70">Zaplanowanych wizyt</p>
          <div class="card-actions justify-end mt-4">
            <a href="/visits" class="btn btn-primary btn-sm">Zobacz harmonogram</a>
          </div>
        </div>
      </div>

      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Kontakty</h2>
          <p class="text-3xl font-bold">0</p>
          <p class="text-sm text-base-content/70">W tym tygodniu</p>
          <div class="card-actions justify-end mt-4">
            <a href="/activities" class="btn btn-primary btn-sm">Zobacz kontakty</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="mt-8">
      <h2 class="text-2xl font-bold mb-4">Szybkie akcje</h2>
      <div class="flex flex-wrap gap-4">
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
        <a href="/activities/new" class="btn btn-secondary">
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
        <a href="/visits/new" class="btn btn-accent">
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
          Zaplanuj wizyte
        </a>
      </div>
    </div>
  </div>
</div>
