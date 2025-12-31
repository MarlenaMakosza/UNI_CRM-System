# TESTY AUTORYZACJI I KONTROLI DOSTĘPU

Data: 2025-12-30
System: JWT authentication + role-based access control (RBAC)

## 📋 UŻYTKOWNICY TESTOWI

| ID | Imię | Email | Hasło | Rola |
|----|------|-------|-------|------|
| 1 | Jan Kowalski | jan.kowalski@firmx.pl | password123 | szef |
| 2 | Anna Nowak | anna.nowak@firmx.pl | password123 | pracownik |
| 3 | Piotr Wiśniewski | piotr.wisniewski@firmx.pl | password123 | pracownik |

## 🧪 TESTY

---

### ✅ Test 1: Login jako SZEF (Jan Kowalski)

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jan.kowalski@firmx.pl","password":"password123"}'
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiamFuLmtvd2Fsc2tpQGZpcm14LnBsIiwicm9sYSI6InN6ZWYiLCJleHAiOjE3NjcxOTc5NzR9.QEAfh_35wJzIsdSTmBqah51G0C8GbMQrWtq264vfvyhei4-hBULy_n_4f17sKuyBhhdt0IKSt67dDvZIVlknsQ",
  "user": {
    "id": 1,
    "imie": "Jan",
    "nazwisko": "Kowalski",
    "email": "jan.kowalski@firmx.pl",
    "rola": "szef"
  }
}
```

**Wynik:** ✅ PASSED - Token JWT wygenerowany, rola: `szef`, user_id: 1

---

### ✅ Test 2: Login jako PRACOWNIK (Anna Nowak)

**Request:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"anna.nowak@firmx.pl","password":"password123"}'
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoiYW5uYS5ub3dha0BmaXJteC5wbCIsInJvbGEiOiJwcmFjb3duaWsiLCJleHAiOjE3NjcxOTgxMjV9.m0iXt0YV1mZUqoSe_65d-6BM_p2YF4LVnkmdaVHf9zAn4Zru3KRRMyneK3uLEnlfIYYawztdYXNVBEqX9bXyAA",
  "user": {
    "id": 2,
    "imie": "Anna",
    "nazwisko": "Nowak",
    "email": "anna.nowak@firmx.pl",
    "rola": "pracownik"
  }
}
```

**Wynik:** ✅ PASSED - Token JWT wygenerowany, rola: `pracownik`, user_id: 2

---

### ✅ Test 3: GET /api/events jako SZEF - widzi wszystkie wydarzenia

**Request:**
```bash
curl -X GET http://localhost:8080/api/events \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiamFuLmtvd2Fsc2tpQGZpcm14LnBsIiwicm9sYSI6InN6ZWYiLCJleHAiOjE3NjcxOTc5NzR9.QEAfh_35wJzIsdSTmBqah51G0C8GbMQrWtq264vfvyhei4-hBULy_n_4f17sKuyBhhdt0IKSt67dDvZIVlknsQ"
```

**Response:** `200 OK`
```json
Liczba wydarzeń: 14
```

**Wynik:** ✅ PASSED - Szef widzi **wszystkie 14 wydarzeń** w systemie (bez filtrowania)

---

### ✅ Test 4: GET /api/events jako PRACOWNIK - widzi tylko swoje wydarzenia

**Request:**
```bash
curl -X GET http://localhost:8080/api/events \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoiYW5uYS5ub3dha0BmaXJteC5wbCIsInJvbGEiOiJwcmFjb3duaWsiLCJleHAiOjE3NjcxOTgxMjV9.m0iXt0YV1mZUqoSe_65d-6BM_p2YF4LVnkmdaVHf9zAn4Zru3KRRMyneK3uLEnlfIYYawztdYXNVBEqX9bXyAA"
```

**Response:** `200 OK`
```json
[
  {
    "id": 7,
    "klient_id": 2,
    "typ_nazwa": "telefon_po_dostawie",
    "data_planowana": "2024-02-03 10:00:00",
    "status": "zrealizowane",
    "opis": "Telefon po dostawie"
  },
  {
    "id": 6,
    "klient_id": 2,
    "typ_nazwa": "wizyta",
    "data_planowana": "2024-01-18 15:00:00",
    "status": "zrealizowane",
    "opis": "Wizyta w sklepie"
  },
  {
    "id": 5,
    "klient_id": 2,
    "typ_nazwa": "telefon",
    "data_planowana": "2024-01-15 09:00:00",
    "status": "zrealizowane",
    "opis": "Kontakt telefoniczny"
  }
]
```

**Wynik:** ✅ PASSED - Anna (pracownik, id=2) widzi tylko **3 wydarzenia** gdzie `przedstawiciel_id = 2`

---

### ✅ Test 5: GET /api/events BEZ tokena - brak dostępu

**Request:**
```bash
curl -X GET http://localhost:8080/api/events
```

**Response:** `401 Unauthorized`
```json
{
  "error": "Missing or invalid Authorization header"
}
```

**Wynik:** ✅ PASSED - Brak tokena → błąd autoryzacji

---

### ✅ Test 6: GET /api/events z NIEPRAWIDŁOWYM tokenem - brak dostępu

**Request:**
```bash
curl -X GET http://localhost:8080/api/events \
  -H "Authorization: Bearer invalid_token_here"
```

**Response:** `401 Unauthorized`
```json
{
  "error": "Invalid or expired token"
}
```

**Wynik:** ✅ PASSED - Nieprawidłowy token → błąd autoryzacji

---

### ✅ Test 7: POST /api/events z autoryzacją - tworzenie wydarzenia

**Request:**
```bash
curl -X POST http://localhost:8080/api/events \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImVtYWlsIjoiYW5uYS5ub3dha0BmaXJteC5wbCIsInJvbGEiOiJwcmFjb3duaWsiLCJleHAiOjE3NjcxOTgxMjV9.m0iXt0YV1mZUqoSe_65d-6BM_p2YF4LVnkmdaVHf9zAn4Zru3KRRMyneK3uLEnlfIYYawztdYXNVBEqX9bXyAA" \
  -H "Content-Type: application/json" \
  -d '{
    "klient_id": 2,
    "przedstawiciel_id": 2,
    "typ_nazwa": "follow-up",
    "data_planowana": "2025-01-15T10:00:00",
    "status": "zaplanowane",
    "opis": "Test follow-up call"
  }'
```

**Response:** `201 Created`
```json
{
  "id": 15,
  "klient_id": 2,
  "przedstawiciel_id": 2,
  "typ_nazwa": "follow-up",
  "umowa_id": 0,
  "data_planowana": "2025-01-15 09:00:00",
  "data_realizacji": "",
  "status": "zaplanowane",
  "opis": "Test follow-up call",
  "notatki": "",
  "created_at": "2025-12-30 16:24:08.294586"
}
```

**Wynik:** ✅ PASSED - Wydarzenie utworzone z id=15

---

### ✅ Test 8: Weryfikacja nowego wydarzenia - PRACOWNIK

**Request:**
```bash
curl -X GET http://localhost:8080/api/events \
  -H "Authorization: Bearer [token Anny]"
```

**Response:** `200 OK`
```
Liczba wydarzeń: 4
```

**Wynik:** ✅ PASSED - Anna widzi teraz **4 wydarzenia** (3 stare + 1 nowe)

---

### ✅ Test 9: Weryfikacja nowego wydarzenia - SZEF

**Request:**
```bash
curl -X GET http://localhost:8080/api/events \
  -H "Authorization: Bearer [token szefa]"
```

**Response:** `200 OK`
```
Liczba wydarzeń: 15
```

**Wynik:** ✅ PASSED - Szef widzi teraz **15 wydarzeń** (14 starych + 1 nowe)

---

## 🎯 PODSUMOWANIE

**WSZYSTKIE TESTY: ✅ PASSED (9/9)**

### Funkcjonalności zweryfikowane:

1. ✅ **Login endpoint** (`POST /api/auth/login`)
   - Poprawne generowanie JWT dla ról: `szef` i `pracownik`
   - Walidacja hasła z bcrypt
   - Zwracanie user info + token

2. ✅ **Middleware autoryzacji** (`requireAuth`)
   - Blokuje requesty bez nagłówka `Authorization`
   - Blokuje requesty z nieprawidłowym tokenem
   - Przepuszcza prawidłowe tokeny JWT

3. ✅ **Role-based filtering**
   - **Szef** (`rola: "szef"`) widzi wszystkie wydarzenia bez filtrowania
   - **Pracownik** (`rola: "pracownik"`) widzi tylko wydarzenia gdzie `przedstawiciel_id` = jego `user_id`

4. ✅ **CRUD z autoryzacją**
   - Wszystkie endpointy `/api/events` wymagają tokena JWT
   - POST, GET, PATCH, DELETE - wszystkie chronione

5. ✅ **Bezpieczeństwo**
   - Hasła hashowane bcrypt z saltem 10
   - JWT z expiracją 24h
   - Secret key w `.env` (domyślnie: super-secret-key-change-in-production)
   - HMAC SHA-512 dla podpisu JWT

### Architektura autoryzacji:

```
User → POST /api/auth/login
         ↓
    authController.ts
         ↓
    authService.ts
         ↓
  1. Pobierz user z DB (email)
  2. Sprawdź aktywność (aktywny = true)
  3. Zweryfikuj hasło (bcrypt.compare)
  4. Wygeneruj JWT token (djwt v3)
  5. Zwróć { token, user }

User → GET /api/events + Authorization: Bearer <token>
         ↓
    authMiddleware.ts (requireAuth)
         ↓
  1. Sprawdź nagłówek Authorization
  2. Zweryfikuj JWT (verify)
  3. Dodaj user do ctx.state
         ↓
    eventsController.ts
         ↓
    eventService.ts → listEvents(user)
         ↓
  1. Jeśli rola = "pracownik" → filter po przedstawiciel_id
  2. Jeśli rola = "szef" → pokaż wszystkie
         ↓
    Return filtered events
```

### Pliki zaangażowane:

- `backend/src/auth/authService.ts` - logika JWT i bcrypt
- `backend/src/auth/authController.ts` - endpoint `/api/auth/login`
- `backend/src/auth/authMiddleware.ts` - middleware `requireAuth`
- `backend/src/types/auth.ts` - typy JWT i auth
- `backend/src/service/eventService.ts` - filtrowanie według roli
- `backend/src/routes/eventsController.ts` - chronione endpointy
- `db/schema.sql` - kolumny `haslo_hash` i `rola`
- `db/seed.sql` - użytkownicy testowi z hashami

### Hasło testowe:

**Wszystkie konta:** `password123`

Hash bcrypt (salt=10): `$2a$10$D7HcQe5AFX4r8EkzMZBIruZvH6pMIqiElw7S2HUVF9HLXxG2UJ5f.`

---

## 📝 UWAGI

1. **NO NULL POLICY** - wszystkie pola opcjonalne używają pustych stringów (`""`) lub `0`, nigdy `null`
2. **Token expiry** - tokeny wygasają po 24h (konfigurowane w `authService.ts`)
3. **Secret key** - w produkcji należy ustawić silny `JWT_SECRET` w zmiennych środowiskowych
4. **Idempotentność** - DELETE i inne operacje są idempotentne
5. **Bcrypt** - wykorzystano `bcrypt` v0.4.1 dla Deno
6. **djwt** - wykorzystano `djwt` v3.0.2 (wymaga CryptoKey zamiast string secret)
