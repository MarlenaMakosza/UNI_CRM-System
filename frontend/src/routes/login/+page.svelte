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
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #667eea;
    padding: 1rem;
  }

  .login-card {
    background: white;
    padding: 3rem;
    width: 100%;
    max-width: 420px;
  }

  h1 {
    margin: 0 0 0.5rem 0;
    text-align: center;
  }

  .subtitle {
    margin: 0 0 2rem 0;
    color: gray;
    text-align: center;
    font-size: 0.875rem;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .login-button {
    margin-top: 0.5rem;
    padding: 0.875rem;
    background: #764ba2;
    color: white;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
  }

  .login-button:hover {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .error-message {
    padding: 0.75rem;
    background-color: #fed7d7;
    color: #c53030;
    border-radius: 6px;
    font-size: 0.875rem;
    text-align: center;
  }
</style>
