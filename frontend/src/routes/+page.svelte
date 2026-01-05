<script lang="ts">
  import { authStore } from "$lib/stores/auth";
</script>

<div class="container">
  <div class="welcome-section">
    <h1>
      Witaj w systemie CRM Firma X
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
          <div class="info-card">
            <h3>Uprawnienia menedżera</h3>
            <p>✓ Dostęp do wszystkich wydarzeń</p>
            <p>✓ Podgląd działań wszystkich pracowników</p>
            <p>✓ Raporty i statystyki</p>
          </div>
        {:else}
          <div class="info-card">
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
        <h3>Klienci</h3>
        <p>Zarządzaj bazą klientów</p>
      </a>

      <a href="/events" class="quick-link">
        <h3>Wydarzenia</h3>
        <p>Planuj wizyty i kontakty</p>
      </a>

      <a href="/contracts" class="quick-link">
        <h3>Umowy</h3>
        <p>Przeglądaj i zarządzaj umowami</p>
      </a>

      <a href="/products" class="quick-link">
        <h3>Produkty</h3>
        <p>Katalog produktów</p>
      </a>

      <a href="/reports" class="quick-link">
        <h3>Raporty</h3>
        <p>Statystyki i harmonogramy</p>
      </a>
    </div>
  </div>
</div>

<style>
  .welcome-section {
    margin-bottom: 40px;
  }

  h1 {
    color: #333;
    font-size: 32px;
    margin-bottom: 30px;
  }

  .user-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 30px;
  }

  .links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
</style>
