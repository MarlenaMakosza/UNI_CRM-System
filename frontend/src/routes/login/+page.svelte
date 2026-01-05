<script lang="ts">
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/stores/auth";
  import { ApiError } from "$lib/api/fetching";

  let email = "";
  let password = "";
  let error = "";
  let loading = false;

  function handleLogin() {
    if (loading) return;

    error = "";
    loading = true;

    authStore.login(email, password)
      .then(() => {
        goto("/");
      })
      .catch((err) => {
        loading = false;
        if (err instanceof ApiError) {
          error = err.message;
        } else if (err instanceof Error) {
          error = err.message;
        } else {
          error = "Wystąpił nieznany błąd";
        }
      });
  }
</script>

<div class="login-container">
  <div class="login-card">
    <h1>Logowanie do CRM</h1>
    <p class="subtitle">System zarządzania relacjami z klientami</p>

    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}

    <div class="login-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="jan.kowalski@firmx.pl"
          required
          disabled={loading}
          on:keydown={(e) => e.key === 'Enter' && handleLogin()}
        />
      </div>

      <div class="form-group">
        <label for="password">Hasło</label>
        <input
          id="password"
          type="password"
          bind:value={password}
          placeholder="••••••••"
          required
          disabled={loading}
          on:keydown={(e) => e.key === 'Enter' && handleLogin()}
        />
      </div>

      <button type="button" class="login-button" disabled={loading} on:click={handleLogin}>
        {loading ? "Logowanie..." : "Zaloguj się"}
      </button>
    </div>
  </div>
</div>

<style>
  /* Strona logowania - specyficzny układ pełnoekranowy */
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #667eea;
    padding: 20px;
  }

  .login-card {
    background: white;
    padding: 40px;
    width: 100%;
    max-width: 400px;
  }

  h1 {
    margin: 0 0 10px 0;
    text-align: center;
  }

  .subtitle {
    margin: 0 0 30px 0;
    color: #666;
    text-align: center;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .login-button {
    margin-top: 10px;
    padding: 12px;
    background: #667eea;
    color: white;
    font-weight: bold;
  }

  .login-button:hover {
    background: #5568d3;
  }

  /* Nadpisanie global .error-message dla wycentrowania */
  .error-message {
    text-align: center;
  }
</style>
