● Oto ścieżka przejrzenia kodu autoryzacji - podzieliłem na 2 flow:

  🔐 FLOW 1: LOGOWANIE (Login)

  Frontend → Backend → Frontend

  1. Frontend: Strona logowania
  frontend/src/routes/login/+page.svelte
  - Formularz (email + password)
  - handleSubmit() → wywołuje authStore.login()

  2. Frontend: Auth Store
  frontend/src/lib/stores/auth.ts
  - Metoda login() → wywołuje API client

  3. Frontend: API Client
  frontend/src/lib/api/client.ts
  - Funkcja login() → wysyła POST do /api/auth/login
  - Zapisuje token w localStorage

  4. Backend: Auth Controller
  backend/src/auth/authController.ts
  - Endpoint POST /api/auth/login
  - Wywołuje authService.login()

  5. Backend: Auth Service ⭐ TUTAJ JEST CAŁA LOGIKA
  backend/src/auth/authService.ts
  - Weryfikacja hasła (bcrypt)
  - Generowanie JWT tokena
  - Zwraca { token, user }

  6. Backend: Typy
  backend/src/types/auth.ts
  - JwtPayload, AuthUser, RolaPracownika

  ---
  🛡 FLOW 2: CHRONIONY ENDPOINT (Protected Route)

  Frontend → Backend

  1. Frontend: API Client z tokenem
  frontend/src/lib/api/client.ts
  - Funkcja fetchWithAuth() → dodaje Authorization: Bearer <token>
  - Przykład: fetchEvents()

  2. Backend: Auth Middleware ⭐ TUTAJ JEST WERYFIKACJA
  backend/src/auth/authMiddleware.ts
  - requireAuth middleware
  - Weryfikuje JWT token
  - Dodaje user do ctx.state

  3. Backend: Protected Controller
  backend/src/routes/eventsController.ts
  - Używa requireAuth middleware
  - Pobiera user z ctx.state

  4. Backend: Service z filtrowaniem
  backend/src/service/eventService.ts
  - Filtruje dane według roli (pracownik vs szef)

  ---
  📋 REKOMENDOWANA KOLEJNOŚĆ CZYTANIA:

  Wariant A: Od logowania do użycia

  1. frontend/src/routes/login/+page.svelte - UI
  2. frontend/src/lib/stores/auth.ts - zarządzanie stanem
  3. frontend/src/lib/api/client.ts - komunikacja z API
  4. backend/src/auth/authController.ts - endpoint
  5. backend/src/auth/authService.ts ⭐ KLUCZOWY PLIK
  6. backend/src/auth/authMiddleware.ts - ochrona tras
  7. frontend/src/routes/+layout.svelte - route guard

  Wariant B: Backend → Frontend

  1. backend/src/auth/authService.ts - logika JWT i bcrypt
  2. backend/src/auth/authController.ts - endpointy
  3. backend/src/auth/authMiddleware.ts - middleware
  4. backend/src/types/auth.ts - typy backendu
  5. frontend/src/lib/api/client.ts - klient API
  6. frontend/src/lib/stores/auth.ts - store
  7. frontend/src/routes/login/+page.svelte - UI

  ---
  ⭐ NAJWAŻNIEJSZE PLIKI (musisz przejrzeć):

  Backend:

  1. backend/src/auth/authService.ts - 🔥 TUTAJ DZIEJE SIĘ MAGIA
  2. backend/src/auth/authMiddleware.ts - weryfikacja tokena
  3. backend/src/auth/authController.ts - endpoint login

  Frontend:

  1. frontend/src/lib/stores/auth.ts - 🔥 STAN GLOBALNY
  2. frontend/src/lib/api/client.ts - komunikacja z backendem
  3. frontend/src/routes/+layout.svelte - route guard

  ---
  🎯 JEŚLI CHCESZ SZYBKO ZROZUMIEĆ:

  Zacznij od tych 3 plików:

  1. backend/src/auth/authService.ts - zrozumiesz jak działa JWT i bcrypt
  2. backend/src/auth/authMiddleware.ts - zrozumiesz jak chronione są endpointy
  3. frontend/src/lib/stores/auth.ts - zrozumiesz jak frontend zarządza stanem

  Reszta to tylko "łączniki" między tymi kluczowymi plikami.
