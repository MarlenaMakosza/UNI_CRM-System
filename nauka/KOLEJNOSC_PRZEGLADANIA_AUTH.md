# KOLEJNOŚĆ PRZEGLĄDANIA KODU AUTORYZACJI JWT

Data: 2025-12-30
Branch: nauka_jwt

---

## 🔐 FLOW 1: LOGOWANIE (Login)

### Frontend → Backend → Frontend

**1. Frontend: Strona logowania**
```
frontend/src/routes/login/+page.svelte
```
- Formularz (email + password)
- `handleSubmit()` → wywołuje `authStore.login()`
- **Co robić:** Zobacz jak formularz zbiera dane i jak obsługuje błędy

**2. Frontend: Auth Store**
```
frontend/src/lib/stores/auth.ts
```
- Metoda `login()` → wywołuje API client
- Zarządza stanem: `{ user, isAuthenticated, loading }`
- **Co robić:** Zobacz jak działa Svelte store i metody `login()`, `logout()`, `init()`

**3. Frontend: API Client**
```
frontend/src/lib/api/client.ts
```
- Funkcja `login()` → wysyła POST do `/api/auth/login`
- Zapisuje token w `localStorage`
- Funkcja `fetchWithAuth()` → dodaje token do requestów
- **Co robić:** Zobacz jak token jest zapisywany i jak jest dołączany do requestów

**4. Backend: Auth Controller**
```
backend/src/auth/authController.ts
```
- Endpoint `POST /api/auth/login`
- Wywołuje `authService.login()`
- Zwraca `{ token, user }`
- **Co robić:** Zobacz jak jest obsługiwany request i jak są zwracane dane

**5. Backend: Auth Service** ⭐ **TUTAJ JEST CAŁA LOGIKA JWT**
```
backend/src/auth/authService.ts
```
- Weryfikacja hasła (bcrypt.compare)
- Generowanie JWT tokena (djwt.create)
- CryptoKey dla HMAC SHA-512
- Token expiry (24h)
- **Co robić:** ⭐ **NAJWAŻNIEJSZY PLIK** - Zobacz jak:
  - Hasło jest weryfikowane
  - JWT token jest generowany
  - Secret key jest konwertowany na CryptoKey
  - Token jest weryfikowany

**6. Backend: Typy**
```
backend/src/types/auth.ts
```
- `JwtPayload`, `AuthUser`, `RolaPracownika`
- **Co robić:** Zobacz jakie dane są w tokenie JWT

---

## 🛡️ FLOW 2: CHRONIONY ENDPOINT (Protected Route)

### Frontend → Backend (z tokenem)

**1. Frontend: API Client z tokenem**
```
frontend/src/lib/api/client.ts
```
- Funkcja `fetchWithAuth()` → dodaje `Authorization: Bearer <token>`
- Przykład: `fetchEvents()`
- **Co robić:** Zobacz jak token jest pobierany z localStorage i dodawany do nagłówka

**2. Backend: Auth Middleware** ⭐ **TUTAJ JEST WERYFIKACJA TOKENA**
```
backend/src/auth/authMiddleware.ts
```
- `requireAuth` middleware
- Weryfikuje JWT token (djwt.verify)
- Dodaje `user` do `ctx.state`
- Middleware `requireSzef` dla admin-only endpoints
- **Co robić:** ⭐ **KLUCZOWY PLIK** - Zobacz jak:
  - Token jest wyciągany z nagłówka
  - Token jest weryfikowany
  - Użytkownik jest dodawany do kontekstu

**3. Backend: Protected Controller**
```
backend/src/routes/eventsController.ts
```
- Używa `requireAuth` middleware
- Pobiera `user` z `ctx.state`
- **Co robić:** Zobacz jak middleware jest podłączony do routera

**4. Backend: Service z filtrowaniem**
```
backend/src/service/eventService.ts
```
- Filtruje dane według roli (pracownik vs szef)
- Metoda `listEvents(user: AuthUser)`
- **Co robić:** Zobacz jak dane są filtrowane na podstawie roli użytkownika

**5. Frontend: Route Guard**
```
frontend/src/routes/+layout.svelte
```
- `$effect` sprawdza czy użytkownik jest zalogowany
- Przekierowuje do `/login` jeśli nie
- **Co robić:** Zobacz jak działa ochrona tras po stronie frontendu

---

## 📋 REKOMENDOWANA KOLEJNOŚĆ CZYTANIA

### **Opcja A: Od logowania do użycia (chronologicznie)**

1. `frontend/src/routes/login/+page.svelte` - UI formularza
2. `frontend/src/lib/stores/auth.ts` - zarządzanie stanem
3. `frontend/src/lib/api/client.ts` - komunikacja z API
4. `backend/src/auth/authController.ts` - endpoint logowania
5. **`backend/src/auth/authService.ts`** ⭐ **KLUCZOWY - JWT + bcrypt**
6. `backend/src/auth/authMiddleware.ts` ⭐ **KLUCZOWY - weryfikacja tokena**
7. `backend/src/routes/eventsController.ts` - przykład chronionego endpointu
8. `backend/src/service/eventService.ts` - filtrowanie według roli
9. `frontend/src/routes/+layout.svelte` - route guard

### **Opcja B: Backend → Frontend (od logiki do UI)**

1. **`backend/src/auth/authService.ts`** ⭐ **START TUTAJ** - logika JWT i bcrypt
2. `backend/src/auth/authController.ts` - endpointy
3. `backend/src/auth/authMiddleware.ts` ⭐ **KLUCZOWY** - middleware
4. `backend/src/types/auth.ts` - typy backendu
5. `backend/src/routes/eventsController.ts` - przykład użycia
6. `backend/src/service/eventService.ts` - filtrowanie
7. `frontend/src/lib/api/client.ts` - klient API
8. `frontend/src/lib/stores/auth.ts` - store
9. `frontend/src/routes/login/+page.svelte` - UI
10. `frontend/src/routes/+layout.svelte` - route guard

### **Opcja C: Szybka ścieżka (tylko kluczowe pliki)**

**Jeśli chcesz szybko zrozumieć jak działa JWT:**

1. **`backend/src/auth/authService.ts`** - generowanie i weryfikacja JWT
2. **`backend/src/auth/authMiddleware.ts`** - middleware weryfikujący token
3. **`frontend/src/lib/stores/auth.ts`** - stan autoryzacji
4. `frontend/src/lib/api/client.ts` - jak token jest używany

---

## ⭐ NAJWAŻNIEJSZE PLIKI (MUST READ)

### Backend (3 pliki):
1. **`backend/src/auth/authService.ts`** 🔥 **TUTAJ DZIEJE SIĘ MAGIA JWT**
   - bcrypt.compare() - weryfikacja hasła
   - crypto.subtle.importKey() - konwersja secret → CryptoKey
   - djwt.create() - generowanie JWT
   - djwt.verify() - weryfikacja JWT
   - getNumericDate() - expiry (24h)

2. **`backend/src/auth/authMiddleware.ts`** 🔥 **WERYFIKACJA TOKENA**
   - Wyciąganie tokena z nagłówka `Authorization`
   - Weryfikacja tokena
   - Dodawanie user do ctx.state
   - requireSzef - middleware dla admina

3. `backend/src/auth/authController.ts`
   - POST /api/auth/login
   - Wywołanie authService.login()

### Frontend (3 pliki):
1. **`frontend/src/lib/stores/auth.ts`** 🔥 **STAN GLOBALNY**
   - login() - logowanie użytkownika
   - logout() - wylogowanie
   - init() - inicjalizacja przy starcie

2. **`frontend/src/lib/api/client.ts`** 🔥 **KOMUNIKACJA Z BACKENDEM**
   - login() - POST /api/auth/login
   - fetchWithAuth() - dodawanie tokena do requestów
   - localStorage operations

3. `frontend/src/routes/+layout.svelte`
   - Route guard - ochrona tras
   - Nawigacja globalna
   - Wyświetlanie użytkownika

---

## 🎓 CO SIĘ NAUCZYSZ Z KAŻDEGO PLIKU

### `backend/src/auth/authService.ts`
- ✅ Jak hashować hasła (bcrypt)
- ✅ Jak generować JWT tokeny (djwt)
- ✅ Jak używać CryptoKey w Deno
- ✅ Jak ustawić expiry dla tokena
- ✅ Jak weryfikować JWT

### `backend/src/auth/authMiddleware.ts`
- ✅ Jak pisać middleware w Oak
- ✅ Jak weryfikować tokeny JWT
- ✅ Jak dodawać dane do kontekstu (ctx.state)
- ✅ Jak obsługiwać błędy autoryzacji (401)

### `frontend/src/lib/stores/auth.ts`
- ✅ Jak używać Svelte stores (writable)
- ✅ Jak zarządzać stanem globalnym
- ✅ Reactive state management
- ✅ Async operations w store

### `frontend/src/lib/api/client.ts`
- ✅ Jak robić HTTP requesty (fetch API)
- ✅ Jak dodawać tokeny do nagłówków
- ✅ Jak używać localStorage
- ✅ Custom error classes (ApiError)

### `frontend/src/routes/+layout.svelte`
- ✅ SvelteKit layouts
- ✅ $effect dla reactive logic
- ✅ Route guards
- ✅ Nawigacja w SvelteKit

---

## 🔑 KLUCZOWE KONCEPCJE DO ZROZUMIENIA

### 1. JWT (JSON Web Token)
- **Structure:** `header.payload.signature`
- **Payload:** `{ userId, email, rola, exp }`
- **Signing:** HMAC SHA-512
- **Expiry:** 24 godziny (getNumericDate)

### 2. bcrypt
- **Hash:** `$2a$10$...` (salt + hash)
- **Compare:** `bcrypt.compare(plaintext, hash)` → boolean
- **Security:** nie można odwrócić hashu (one-way)

### 3. Middleware w Oak
```typescript
async (ctx, next) => {
  // Code before endpoint
  await next(); // Call next middleware/endpoint
  // Code after endpoint
}
```

### 4. Svelte Store
```typescript
const store = writable(initialValue);
store.subscribe(value => { ... });
store.set(newValue);
store.update(fn);
```

### 5. localStorage
```typescript
localStorage.setItem("key", "value");
localStorage.getItem("key"); // → "value" | null
localStorage.removeItem("key");
```

### 6. Authorization Header
```
Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 DIAGRAM CAŁEGO FLOW

```
┌─────────────────┐
│  User wpisuje   │
│  email + hasło  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Login.svelte            │
│ handleSubmit()          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ authStore.login()       │
│ (stores/auth.ts)        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ api.login()             │
│ POST /api/auth/login    │
│ (api/client.ts)         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ authController.ts       │
│ POST /api/auth/login    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ authService.login()     │
│ 1. Pobierz user z DB    │
│ 2. bcrypt.compare()     │
│ 3. djwt.create()        │
│ 4. Zwróć { token, user }│
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Token zapisany          │
│ w localStorage          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ authStore update        │
│ user, isAuthenticated   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Przekierowanie do /     │
└─────────────────────────┘

════════════════════════════

Chroniony request:

┌─────────────────────────┐
│ fetchEvents()           │
│ GET /api/events         │
│ + Authorization header  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ requireAuth middleware  │
│ 1. Wyciągnij token      │
│ 2. djwt.verify()        │
│ 3. ctx.state.user = ... │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ eventsController        │
│ Pobierz user z ctx.state│
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ eventService.listEvents │
│ Filtruj według roli     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Zwróć przefiltrowane    │
│ wydarzenia              │
└─────────────────────────┘
```

---

## 🚀 DALSZE KROKI DO NAUKI

Po przejrzeniu kodu:

1. **Przetestuj flow ręcznie:**
   - Zaloguj się w przeglądarce
   - Otwórz DevTools → Application → Local Storage
   - Zobacz zapisany token JWT
   - Zdekoduj token na https://jwt.io

2. **Modyfikuj kod:**
   - Zmień expiry tokena (np. na 1 minutę)
   - Dodaj nowe pole do JWT payload
   - Zmień role (dodaj "manager")

3. **Dodaj nowe funkcje:**
   - Endpoint `/api/auth/me` (weryfikacja tokena)
   - Refresh token mechanism
   - Automatyczne wylogowanie po wygaśnięciu

4. **Bezpieczeństwo:**
   - Przeczytaj o OWASP JWT Best Practices
   - Zrozum różnicę między localStorage a httpOnly cookies
   - Dowiedz się czym jest CSRF i XSS

---

## 📚 DODATKOWE MATERIAŁY

- **JWT:** https://jwt.io/introduction
- **bcrypt:** https://en.wikipedia.org/wiki/Bcrypt
- **Oak middleware:** https://oakserver.github.io/oak/
- **Svelte stores:** https://svelte.dev/docs/svelte-store
- **SvelteKit routing:** https://kit.svelte.dev/docs/routing

---

Powodzenia w nauce! 🚀
