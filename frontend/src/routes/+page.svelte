<script lang="ts">
  import { authStore } from "$lib/stores/auth";
</script>

<div class="container">
  <div class="welcome-section">
    <h1>
      Witaj w systemie CRM Firma X
      {#if $authStore.user}
        <span class="user-greeting">
          {$authStore.user.imie} {$authStore.user.nazwisko}!
        </span>
      {/if}
    </h1>

    {#if $authStore.user}
      <div class="user-info">
        <div class="info-card">
          <h3>Twoje dane</h3>
          <p><strong>Email:</strong> {$authStore.user.email}</p>
          <p>
            <strong>Rola:</strong>
            {$authStore.user.rola === "szef" ? "Szef" : "Pracownik"}
          </p>
        </div>

        {#if $authStore.user.rola === "szef"}
          <div class="info-card manager-info">
            <h3>Uprawnienia menedżera</h3>
            <p>✓ Dostęp do wszystkich wydarzeń</p>
            <p>✓ Podgląd działań wszystkich pracowników</p>
            <p>✓ Raporty i statystyki</p>
          </div>
        {:else}
          <div class="info-card worker-info">
            <h3>Uprawnienia pracownika</h3>
            <p>✓ Zarządzanie własnymi wydarzeniami</p>
            <p>✓ Dostęp do klientów</p>
            <p>✓ Planowanie wizyt i kontaktów</p>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="quick-links">
    <h2>Szybkie akcje</h2>
    <div class="links-grid">
      <a href="/clients" class="quick-link">
        <div class="link-icon">👥</div>
        <h3>Klienci</h3>
        <p>Zarządzaj bazą klientów</p>
      </a>

      <a href="/events" class="quick-link">
        <div class="link-icon">📅</div>
        <h3>Wydarzenia</h3>
        <p>Planuj wizyty i kontakty</p>
      </a>

      <a href="/reports" class="quick-link disabled">
        <div class="link-icon">📊</div>
        <h3>Raporty</h3>
        <p>Wkrótce dostępne</p>
      </a>
    </div>
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .welcome-section {
    margin-bottom: 3rem;
  }

  h1 {
    color: #2d3748;
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .user-greeting {
    display: block;
    font-size: 1.25rem;
    color: #667eea;
    margin-top: 0.5rem;
  }

  .user-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .info-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .info-card h3 {
    margin-top: 0;
    color: #2d3748;
    font-size: 1.125rem;
  }

  .info-card p {
    margin: 0.5rem 0;
    color: #4a5568;
  }

  .manager-info {
    border-left: 4px solid #667eea;
  }

  .worker-info {
    border-left: 4px solid #48bb78;
  }

  .quick-links {
    margin-top: 3rem;
  }

  .quick-links h2 {
    color: #2d3748;
    margin-bottom: 1.5rem;
  }

  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .quick-link {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    text-decoration: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    text-align: center;
  }

  .quick-link:not(.disabled):hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  .quick-link.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .link-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .quick-link h3 {
    color: #2d3748;
    margin: 0.5rem 0;
  }

  .quick-link p {
    color: #718096;
    margin: 0;
    font-size: 0.875rem;
  }
</style>
