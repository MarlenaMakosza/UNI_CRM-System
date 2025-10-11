<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";

  export let form: ActionData;
</script>

<svelte:head>
  <title>Login - CRM System</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-base-200">
  <div class="card w-96 bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title text-2xl font-bold text-center justify-center mb-4">
        CRM System - Firma X
      </h2>
      <p class="text-center text-sm text-base-content/70 mb-6">
        Logowanie do systemu
      </p>

      {#if form?.error}
        <div class="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{form.error}</span>
        </div>
      {/if}

      <form method="POST" use:enhance>
        <div class="form-control">
          <label class="label" for="username">
            <span class="label-text">Nazwa uzytkownika</span>
          </label>
          <input
            type="text"
            id="username"
            name="username"
            class="input input-bordered"
            placeholder="jan.kowalski"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-control mt-4">
          <label class="label" for="password">
            <span class="label-text">Haslo</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            class="input input-bordered"
            placeholder="********"
            required
            autocomplete="current-password"
          />
        </div>

        <div class="form-control mt-6">
          <button type="submit" class="btn btn-primary">Zaloguj sie</button>
        </div>
      </form>

      <div class="divider">Demo users</div>

      <div class="text-sm text-base-content/70">
        <p class="font-semibold mb-2">Testowe konta:</p>
        <ul class="space-y-1">
          <li><strong>PH (Poznan):</strong> ph.poznan / password</li>
          <li><strong>PH (Wroclaw):</strong> ph.wroclaw / password</li>
          <li><strong>Kierownik:</strong> manager / password</li>
        </ul>
      </div>
    </div>
  </div>
</div>
