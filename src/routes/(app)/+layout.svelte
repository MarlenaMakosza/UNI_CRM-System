<script lang="ts">
  import { enhance } from "$app/forms";
  import { page } from "$app/stores";
  import type { LayoutData } from "./$types";

  export let data: LayoutData;

  $: isActive = (path: string) => {
    if (path === "/" && $page.url.pathname === "/") return true;
    if (path !== "/" && $page.url.pathname.startsWith(path)) return true;
    return false;
  };
</script>

<div class="min-h-screen bg-base-200">
  <!-- Navbar -->
  <div class="navbar bg-base-100 shadow-lg sticky top-0 z-50">
    <div class="navbar-start">
      <div class="dropdown">
        <label tabindex="0" class="btn btn-ghost lg:hidden">
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
              d="M4 6h16M4 12h8m-8 6h16"
            />
          </svg>
        </label>
        <ul
          tabindex="0"
          class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
        >
          <li><a href="/" class:active={isActive("/")}>Dashboard</a></li>
          <li><a href="/leads" class:active={isActive("/leads")}>Leady</a></li>
          <li>
            <a href="/activities" class:active={isActive("/activities")}>
              Kontakty
            </a>
          </li>
          <li><a href="/visits" class:active={isActive("/visits")}>Wizyty</a></li>
          {#if data.user.role === "MANAGER"}
            <li>
              <a href="/reports" class:active={isActive("/reports")}>
                Raporty
              </a>
            </li>
          {/if}
        </ul>
      </div>
      <a href="/" class="btn btn-ghost normal-case text-xl">
        CRM - Firma X
      </a>
    </div>

    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li>
          <a href="/" class:active={isActive("/")}>Dashboard</a>
        </li>
        <li>
          <a href="/leads" class:active={isActive("/leads")}>Leady</a>
        </li>
        <li>
          <a href="/activities" class:active={isActive("/activities")}>
            Kontakty
          </a>
        </li>
        <li>
          <a href="/visits" class:active={isActive("/visits")}>Wizyty</a>
        </li>
        {#if data.user.role === "MANAGER"}
          <li>
            <a href="/reports" class:active={isActive("/reports")}>
              Raporty
            </a>
          </li>
        {/if}
      </ul>
    </div>

    <div class="navbar-end gap-2">
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
  <main class="container mx-auto px-4 py-8">
    <slot />
  </main>
</div>

<style>
  :global(.menu li a.active) {
    @apply bg-primary text-primary-content;
  }
</style>
