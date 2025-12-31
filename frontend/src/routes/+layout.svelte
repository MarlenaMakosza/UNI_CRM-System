<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { authStore } from "$lib/stores/auth";

  let { children } = $props();

  // Inicjalizacja auth store przy starcie aplikacji
  onMount(() => {
    authStore.init();
  });

  // Sprawdź czy strona wymaga autoryzacji
  $effect(() => {
    const currentPath = $page.url.pathname;
    const publicPaths = ["/login"];
    const isPublicPath = publicPaths.includes(currentPath);

    // Jeśli użytkownik NIE jest zalogowany i próbuje dostać się do chronionej strony
    if (!$authStore.isAuthenticated && !isPublicPath && !$authStore.loading) {
      goto("/login");
    }

    // Jeśli użytkownik JEST zalogowany i jest na stronie logowania, przekieruj do strony głównej
    if ($authStore.isAuthenticated && currentPath === "/login") {
      goto("/");
    }
  });

  function handleLogout() {
    authStore.logout();
    goto("/login");
  }
</script>

{#if $authStore.loading}
  <div class="loading-screen">
    <p>Ładowanie...</p>
  </div>
{:else}
  {#if $authStore.isAuthenticated}
    <div class="app-layout">
      <nav class="navbar">
        <div class="nav-content">
          <h1 class="logo">CRM Firma X</h1>

          <div class="nav-links">
            <a href="/" class:active={$page.url.pathname === "/"}>
              Dashboard
            </a>
            <a
              href="/clients"
              class:active={$page.url.pathname.startsWith("/clients")}
            >
              Klienci
            </a>
          </div>

          <div class="user-section">
            {#if $authStore.user}
              <span class="user-name">
                {$authStore.user.imie}
                {$authStore.user.nazwisko}
                {#if $authStore.user.rola === "szef"}
                  <span class="badge">Szef</span>
                {/if}
              </span>
            {/if}
            <button class="logout-button" onclick={handleLogout}>
              Wyloguj
            </button>
          </div>
        </div>
      </nav>

      <main class="main-content">
        {@render children()}
      </main>
    </div>
  {:else}
    {@render children()}
  {/if}
{/if}

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    background-color: #f7fafc;
  }

  .loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-size: 1.25rem;
    color: #4a5568;
  }

  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .navbar {
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 0 1rem;
  }

  .nav-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 2rem;
    height: 64px;
  }

  .logo {
    margin: 0;
    font-size: 1.25rem;
    color: #2d3748;
    font-weight: 700;
  }

  .nav-links {
    display: flex;
    gap: 1rem;
    flex: 1;
  }

  .nav-links a {
    text-decoration: none;
    color: #4a5568;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .nav-links a:hover {
    background-color: #edf2f7;
    color: #2d3748;
  }

  .nav-links a.active {
    background-color: #667eea;
    color: white;
  }

  .user-section {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-name {
    font-size: 0.875rem;
    color: #4a5568;
    font-weight: 500;
  }

  .badge {
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    margin-left: 0.5rem;
  }

  .logout-button {
    padding: 0.5rem 1rem;
    background-color: #e53e3e;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .logout-button:hover {
    background-color: #c53030;
  }

  .main-content {
    flex: 1;
  }
</style>
