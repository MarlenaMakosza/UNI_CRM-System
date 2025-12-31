# TESTY FRONTEND - LOGOWANIE I AUTORYZACJA

Data: 2025-12-30
Framework: SvelteKit (Svelte 5)

## 📦 URUCHOMIENIE FRONTENDU

### Wymagania wstępne

1. **Backend musi być uruchomiony** na `http://localhost:8080`
2. **Node.js** zainstalowany (lub Deno z npm compatibility)

### Krok 1: Instalacja zależności

```bash
cd frontend
npm install
```

### Krok 2: Uruchomienie dev servera

```bash
npm run dev
```

Frontend będzie dostępny na: `http://localhost:5173` (lub innym porcie wskazanym przez Vite)

---

## 🏗️ STRUKTURA PROJEKTU

### Nowe pliki utworzone

```
frontend/src/
├── lib/
│   ├── api/
│   │   └── client.ts              # API client - komunikacja z backendem
│   ├── stores/
│   │   └── auth.ts                # Auth store - globalny stan autoryzacji
│   ├── types/
│   │   ├── auth.ts                # Typy autoryzacji (User, LoginRequest, etc.)
│   │   └── domain.ts              # Typy domenowe (ClientSummary, etc.)
│   └── index.ts                   # Główny plik eksportów
├── routes/
│   ├── login/
│   │   └── +page.svelte           # Strona logowania
│   ├── +layout.svelte             # Główny layout z nawigacją i guard
│   └── +page.svelte               # Strona główna (dashboard)
```

---

## 🧪 SCENARIUSZE TESTOWE

### ✅ Test 1: Przekierowanie do strony logowania (nie zalogowany)

**Kroki:**
1. Otwórz przeglądarkę
2. Przejdź do `http://localhost:5173`

**Oczekiwany wynik:**
- ✅ Automatyczne przekierowanie do `/login`
- ✅ Wyświetlenie formularza logowania
- ✅ Widoczne konta testowe:
  - Szef: jan.kowalski@firmx.pl / password123
  - Pracownik: anna.nowak@firmx.pl / password123

---

### ✅ Test 2: Logowanie jako SZEF

**Kroki:**
1. Na stronie `/login` wpisz:
   - Email: `jan.kowalski@firmx.pl`
   - Hasło: `password123`
2. Kliknij "Zaloguj się"

**Oczekiwany wynik:**
- ✅ Przekierowanie do `/` (dashboard)
- ✅ Wyświetlenie nawigacji z linkami:
  - Dashboard
  - Klienci
- ✅ W prawym górnym rogu:
  - Imię i nazwisko: "Jan Kowalski"
  - Badge: "Szef"
  - Przycisk "Wyloguj"
- ✅ Dashboard pokazuje:
  - Powitanie: "Witaj w systemie CRM Firma X Jan Kowalski!"
  - Kartę "Uprawnienia menedżera"
  - Szybkie akcje: Klienci, Wydarzenia, Raporty

---

### ✅ Test 3: Logowanie jako PRACOWNIK

**Kroki:**
1. Kliknij "Wyloguj"
2. Na stronie `/login` wpisz:
   - Email: `anna.nowak@firmx.pl`
   - Hasło: `password123`
3. Kliknij "Zaloguj się"

**Oczekiwany wynik:**
- ✅ Przekierowanie do `/` (dashboard)
- ✅ W prawym górnym rogu:
  - Imię i nazwisko: "Anna Nowak"
  - **BRAK** badge "Szef"
  - Przycisk "Wyloguj"
- ✅ Dashboard pokazuje:
  - Powitanie: "Witaj w systemie CRM Firma X Anna Nowak!"
  - Kartę "Uprawnienia pracownika"

---

### ✅ Test 4: Błędne logowanie (nieprawidłowe hasło)

**Kroki:**
1. Wyloguj się
2. Na stronie `/login` wpisz:
   - Email: `jan.kowalski@firmx.pl`
   - Hasło: `wrongpassword`
3. Kliknij "Zaloguj się"

**Oczekiwany wynik:**
- ✅ Komunikat błędu: "Invalid email or password" (lub podobny)
- ✅ Użytkownik pozostaje na stronie `/login`
- ✅ Formularz nadal dostępny

---

### ✅ Test 5: Ochrona tras (route guard)

**Kroki:**
1. Wyloguj się
2. W przeglądarce ręcznie przejdź do `http://localhost:5173/clients`

**Oczekiwany wynik:**
- ✅ Automatyczne przekierowanie do `/login`
- ✅ Użytkownik nie ma dostępu do `/clients` bez logowania

---

### ✅ Test 6: Wylogowanie

**Kroki:**
1. Zaloguj się jako dowolny użytkownik
2. Kliknij przycisk "Wyloguj" w prawym górnym rogu

**Oczekiwany wynik:**
- ✅ Token JWT usunięty z localStorage
- ✅ Przekierowanie do `/login`
- ✅ Nawigacja znika
- ✅ Próba przejścia do `/` skutkuje przekierowaniem do `/login`

---

### ✅ Test 7: Nawigacja - przejście do klientów

**Kroki:**
1. Zaloguj się jako dowolny użytkownik
2. Kliknij "Klienci" w nawigacji

**Oczekiwany wynik:**
- ✅ Przekierowanie do `/clients`
- ✅ Wyświetlenie listy klientów (jeśli backend działa poprawnie)
- ✅ Link "Klienci" w nawigacji jest podświetlony (klasa `active`)

---

### ✅ Test 8: Persistence sesji (odświeżenie strony)

**Kroki:**
1. Zaloguj się jako dowolny użytkownik
2. Odśwież stronę (F5 lub Ctrl+R)

**Oczekiwany wynik:**
- ✅ Użytkownik pozostaje zalogowany
- ✅ Nawigacja nadal widoczna
- ✅ Dashboard lub aktualna strona wyświetlana poprawnie

**Uwaga:** Token JWT jest zapisywany w `localStorage`, więc sesja przetrwa odświeżenie strony (do czasu wygaśnięcia tokena - 24h).

---

## 🔧 ARCHITEKTURA AUTORYZACJI FRONTEND

### Flow logowania:

```
1. User wypełnia formularz (/login)
        ↓
2. Klik "Zaloguj się"
        ↓
3. authStore.login(email, password)
        ↓
4. api.login({ email, password })
        ↓
5. POST http://localhost:8080/api/auth/login
        ↓
6. Backend weryfikuje credentials
        ↓
7. Zwraca { token, user }
        ↓
8. Token zapisany w localStorage
        ↓
9. authStore aktualizuje stan: { user, isAuthenticated: true }
        ↓
10. +layout.svelte wykrywa zmianę stanu
        ↓
11. Przekierowanie do "/" (dashboard)
```

### Route Guard ($effect w +layout.svelte):

```
Na każdą zmianę $page.url.pathname:
  ├─ Jeśli użytkownik NIE jest zalogowany
  │   └─ A strona NIE jest publiczna (/login)
  │       └─ Przekieruj do /login
  │
  └─ Jeśli użytkownik JEST zalogowany
      └─ A strona to /login
          └─ Przekieruj do /
```

### API Client z autoryzacją:

Wszystkie requesty do chronionych endpointów używają `fetchWithAuth()`:

```typescript
const token = localStorage.getItem("auth_token");
headers["Authorization"] = `Bearer ${token}`;
```

---

## 📝 KOMPONENTY

### 1. `/lib/api/client.ts`

**Funkcje:**
- `login(credentials)` - logowanie użytkownika
- `logout()` - wylogowanie (czyszczenie localStorage)
- `getAuthToken()` - pobierz token JWT
- `isAuthenticated()` - sprawdź czy zalogowany
- `fetchWithAuth(url, options)` - wykonaj request z tokenem JWT
- `fetchEvents()` - pobierz wydarzenia (przykład chronionego endpointu)
- `fetchClients()` - pobierz klientów

**ApiError:**
Custom error class z dodatkowymi polami: `status`, `statusText`

---

### 2. `/lib/stores/auth.ts`

**Stan (AuthState):**
```typescript
{
  user: User | null,
  isAuthenticated: boolean,
  loading: boolean
}
```

**Metody:**
- `login(email, password)` - zaloguj użytkownika
- `logout()` - wyloguj użytkownika
- `init()` - inicjalizuj store (sprawdź czy token w localStorage)

**Reactive:**
Wszystkie komponenty subskrybujące `$authStore` automatycznie reagują na zmiany stanu.

---

### 3. `/routes/+layout.svelte`

**Funkcje:**
- Inicjalizacja auth store przy starcie (`onMount`)
- Route guard - ochrona tras (`$effect`)
- Nawigacja globalna (navbar)
- Wyświetlanie danych użytkownika (imię, rola, badge)
- Przycisk wylogowania

**Layout:**
- Jeśli loading: ekran ładowania
- Jeśli zalogowany: navbar + main content
- Jeśli niezalogowany: tylko content (formularz logowania)

---

### 4. `/routes/login/+page.svelte`

**Funkcje:**
- Formularz logowania (email + password)
- Walidacja HTML5 (required, type="email")
- Obsługa błędów (wyświetlanie komunikatów)
- Stan loading (disabled inputs podczas logowania)
- Konta testowe (podpowiedź dla użytkownika)

**UX:**
- Gradient background
- Centrowany formularz
- Animacje hover/focus
- Responsywny design

---

### 5. `/routes/+page.svelte` (Dashboard)

**Funkcje:**
- Powitanie użytkownika
- Wyświetlanie danych użytkownika
- Karta uprawnień (różna dla szef/pracownik)
- Szybkie akcje (linki do głównych sekcji)

---

## 🎨 STYLE

**Paleta kolorów:**
- Primary: `#667eea` (gradient: #667eea → #764ba2)
- Background: `#f7fafc`
- Text: `#2d3748`
- Error: `#c53030`

**Komponenty:**
- Cards z `box-shadow` i `border-radius: 8px`
- Hover efekty: `transform: translateY(-2px)` + zwiększony shadow
- Transitions: `0.2s ease`

---

## 🔒 BEZPIECZEŃSTWO

1. **JWT w localStorage:**
   - Token zapisywany po zalogowaniu
   - Automatycznie dołączany do requestów (header `Authorization: Bearer <token>`)
   - Usuwany przy wylogowaniu

2. **Route protection:**
   - Reactive guard w `+layout.svelte`
   - Automatyczne przekierowania

3. **CORS:**
   - Backend musi mieć włączone CORS dla `http://localhost:5173`
   - Sprawdź `backend/src/main.ts` - powinien być middleware CORS

4. **Token expiration:**
   - Backend: token wygasa po 24h
   - Frontend: obecnie brak automatycznego odświeżania tokena
   - TODO: dodać endpoint `/api/auth/refresh` dla odświeżania tokenu

---

## ⚠️ UWAGI I ZNANE OGRANICZENIA

1. **Brak weryfikacji tokenu przy init:**
   - `authStore.init()` sprawdza tylko czy token istnieje w localStorage
   - Nie weryfikuje czy token jest prawidłowy lub nie wygasł
   - **Rozwiązanie:** dodać endpoint `GET /api/auth/me` do weryfikacji tokenu

2. **Brak persistencji danych użytkownika:**
   - Po odświeżeniu strony `authStore.user` jest `null`
   - `isAuthenticated` jest `true` ale brak danych użytkownika
   - **Rozwiązanie:** zapisać dane użytkownika w localStorage lub pobrać z `/api/auth/me`

3. **Brak obsługi wygaśnięcia tokenu:**
   - Jeśli token wygaśnie, użytkownik dostanie błąd 401 dopiero przy requestie
   - Brak automatycznego przekierowania do `/login`
   - **Rozwiązanie:** dodać interceptor dla błędów 401

4. **CORS:**
   - Upewnij się że backend akceptuje requesty z `http://localhost:5173`
   - W produkcji należy ustawić właściwą domenę frontendu

---

## 🚀 DALSZE KROKI (TODO)

1. **Dodać endpoint `/api/auth/me` na backendzie:**
   ```typescript
   GET /api/auth/me
   Headers: Authorization: Bearer <token>
   Response: { user: User }
   ```

2. **Ulepszyć `authStore.init()`:**
   - Wywołać `/api/auth/me` przy starcie
   - Zapisać dane użytkownika

3. **Dodać auto-logout przy błędzie 401:**
   - Interceptor w `fetchWithAuth()`
   - Automatyczne przekierowanie do `/login`

4. **Dodać refresh token:**
   - Długotrwały refresh token w httpOnly cookie
   - Krótkotrwały access token w localStorage
   - Endpoint `/api/auth/refresh`

5. **Dodać stronę wydarzeń (`/events`):**
   - Lista wydarzeń z filtrami
   - Tworzenie nowych wydarzeń
   - Edycja i usuwanie

---

## 📚 PRZYKŁADY UŻYCIA API CLIENT

### W komponencie Svelte:

```typescript
import { onMount } from "svelte";
import { fetchEvents } from "$lib/api/client";

let events = $state([]);
let error = $state("");

onMount(async () => {
  try {
    events = await fetchEvents();
  } catch (err) {
    if (err instanceof ApiError) {
      error = err.message;
    }
  }
});
```

### Bezpośrednie użycie auth store:

```typescript
import { authStore } from "$lib/stores/auth";

// Subskrypcja reaktywna (Svelte 5)
$: if ($authStore.user) {
  console.log("Zalogowany jako:", $authStore.user.email);
}

// Wylogowanie
function handleLogout() {
  authStore.logout();
}
```

---

## ✅ PODSUMOWANIE

**Implementacja zawiera:**

✅ Pełny system logowania JWT
✅ Auth store z reactive state
✅ API client z automatycznym dołączaniem tokena
✅ Route protection (guard)
✅ Nawigacja globalna z wyświetlaniem użytkownika
✅ Strona logowania z walidacją i obsługą błędów
✅ Dashboard z personalizowanym powitaniem
✅ Persistence sesji w localStorage
✅ Responsywny design
✅ TypeScript z pełnymi typami

**Gotowe do testowania!** 🎉
