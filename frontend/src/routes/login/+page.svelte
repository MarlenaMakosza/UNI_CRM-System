<script lang="ts">
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/stores/auth";
  import { ApiError } from "$lib/api/client";

  let email = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);

  async function handleSubmit(event: Event) {
    event.preventDefault();
    error = "";
    loading = true;

    try {
      await authStore.login(email, password);
      // Po udanym logowaniu przekieruj do strony głównej
      goto("/");
    } catch (err) {
      if (err instanceof ApiError) {
        error = err.message;
      } else if (err instanceof Error) {
        error = err.message;
      } else {
        error = "Wystąpił nieznany błąd";
      }
    } finally {
      loading = false;
    }
  }
</script>

<div class="login-container">
  <div class="login-card">
    <h1>Logowanie do CRM</h1>
    <p class="subtitle">System zarządzania relacjami z klientami</p>

    <form onsubmit={handleSubmit}>
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="jan.kowalski@firmx.pl"
          required
          disabled={loading}
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
        />
      </div>

      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}

      <button type="submit" class="login-button" disabled={loading}>
        {loading ? "Logowanie..." : "Zaloguj się"}
      </button>
    </form>

    <div class="test-credentials">
      <p><strong>Konta testowe:</strong></p>
      <p>Szef: jan.kowalski@firmx.pl / password123</p>
      <p>Pracownik: anna.nowak@firmx.pl / password123</p>
    </div>
  </div>
</div>

<style>
  .login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
  }

  .login-card {
    background: white;
    border-radius: 12px;
    padding: 2.5rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 420px;
  }

  h1 {
    margin: 0 0 0.5rem 0;
    color: #2d3748;
    font-size: 1.875rem;
    text-align: center;
  }

  .subtitle {
    margin: 0 0 2rem 0;
    color: #718096;
    text-align: center;
    font-size: 0.875rem;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-weight: 600;
    color: #4a5568;
    font-size: 0.875rem;
  }

  input {
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
    transition: all 0.2s ease;
  }

  input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  input:disabled {
    background-color: #f7fafc;
    cursor: not-allowed;
  }

  .login-button {
    margin-top: 0.5rem;
    padding: 0.875rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .login-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .login-button:active:not(:disabled) {
    transform: translateY(0);
  }

  .login-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error-message {
    padding: 0.75rem;
    background-color: #fed7d7;
    color: #c53030;
    border-radius: 6px;
    font-size: 0.875rem;
    text-align: center;
  }

  .test-credentials {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
    font-size: 0.75rem;
    color: #718096;
  }

  .test-credentials p {
    margin: 0.25rem 0;
  }

  .test-credentials strong {
    color: #4a5568;
  }
</style>
