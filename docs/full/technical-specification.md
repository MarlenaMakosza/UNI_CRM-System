# Specyfikacja Techniczna - System CRM dla Firmy X

## 1. Analiza wymagań i schemat procesu

### 1.1. Kluczowe elementy procesu (Krok 1)

```
[Pozyskanie leada] → [Kwalifikacja] → [Kontakt telefoniczny] → [Wizyta] → [Oferta] → [Umowa] → [Posprzedaż]
```

#### Diagram procesu biznesowego

```
┌─────────────────────────────────────────────────────────────────┐
│ A. POZYSKANIE LEADA                                             │
│ Input: Internet/Prasa/Książki branżowe/Polecenia               │
│ Dane: nazwa*, miasto*, adres, telefon/email*, NIP, kategoria   │
│ Output: Lead ze statusem NEW                                    │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ B. KWALIFIKACJA LEADA                                           │
│ Input: Lead NEW                                                 │
│ Weryfikacja: profil, lokalizacja, osoba decyzyjna              │
│ Output: QUALIFIED / DISQUALIFIED                                │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ C. KONTAKT TELEFONICZNY                                         │
│ Input: Lead QUALIFIED                                           │
│ Dane: data/godz., rozmówca, wynik, notatka                     │
│ Output: NO_ANSWER / CALLBACK / MEETING_SET / ORDER_TAKEN       │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ D. WIZYTA                                                       │
│ Input: MEETING_SET                                              │
│ Dane: termin*, adres*, cel*, agenda, ceny konkurencji          │
│ Output: DONE / CANCELLED / NO_SHOW                             │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ E. OFERTA                                                       │
│ Input: Wizyta DONE                                              │
│ Dane: pozycje*, ceny*, rabat, warunki, ważność*                │
│ Output: DRAFT → SENT → NEGOTIATION → ACCEPTED/REJECTED         │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ F. UMOWA                                                        │
│ Input: Oferta ACCEPTED                                          │
│ Dane: warunki*, okres*, produkty*, płatności*, SLA             │
│ Output: DRAFT → SIGNED → ACTIVE                                │
└─────────────────────┬───────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────────┐
│ G. POSPRZEDAŻ                                                   │
│ Input: Umowa SIGNED + pierwsza dostawa                          │
│ Akcje: telefon kontrolny T+1, newsletter miesięczny            │
│ Output: Klient ACTIVE, dane o zadowoleniu                      │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Projekt bazy danych (Krok 2)

### 2.1. Schemat relacyjny bazy danych

```sql
-- Tabela: Users (Użytkownicy systemu)
Users
├── id (PK)
├── username
├── password_hash
├── role (SALES_REP | MANAGER)
├── first_name
├── last_name
├── email
├── territory (Poznań/Wrocław/Szczecin)
├── is_active
├── created_at
└── updated_at

-- Tabela: Customers (Klienci/Leady)
Customers
├── id (PK)
├── company_name* (NOT NULL)
├── nip (UNIQUE, 10 znaków)
├── city* (NOT NULL)
├── street
├── postal_code
├── email
├── phone
├── category (sklep_osiedlowy/dyskont/sieć)
├── status (prospect/active/inactive)
├── lead_status (NEW/QUALIFIED/DISQUALIFIED)
├── lead_source (Internet/Prasa/Polecenie/Inne)
├── disqualification_reason
├── assigned_to (FK → Users.id)
├── created_by (FK → Users.id)
├── created_at
└── updated_at

-- Tabela: Contacts (Osoby kontaktowe)
Contacts
├── id (PK)
├── customer_id (FK → Customers.id)
├── first_name*
├── last_name*
├── role
├── phone
├── email*
├── is_decision_maker (BOOLEAN)
├── created_at
└── updated_at

-- Tabela: Activities (Aktywności/Kontakty)
Activities
├── id (PK)
├── customer_id (FK → Customers.id)
├── user_id (FK → Users.id)
├── activity_type (CALL/EMAIL/NOTE/MEETING)
├── activity_date*
├── outcome (NO_ANSWER/CALLBACK/MEETING_SET/ORDER_TAKEN/INFO_SENT)
├── notes* (TEXT)
├── contact_person
├── phone_number
├── attempt_number (dla NO_ANSWER)
├── created_at
└── updated_at

-- Tabela: Visits (Wizyty)
Visits
├── id (PK)
├── customer_id (FK → Customers.id)
├── sales_rep_id (FK → Users.id)
├── scheduled_at* (datetime)
├── address*
├── meeting_goal*
├── agenda
├── status (PLANNED/DONE/CANCELLED/NO_SHOW)
├── visit_notes (TEXT)
├── findings (TEXT)
├── competitor_prices (JSON)
├── attachments (JSON - URLs do zdjęć)
├── completed_at
├── created_at
└── updated_at

-- Tabela: Offers (Oferty)
Offers
├── id (PK)
├── offer_number (UNIQUE, auto)
├── customer_id (FK → Customers.id)
├── created_by (FK → Users.id)
├── status (DRAFT/SENT/NEGOTIATION/ACCEPTED/REJECTED/EXPIRED)
├── valid_until*
├── total_amount
├── discount_percentage
├── requires_approval (BOOLEAN)
├── approved_by (FK → Users.id)
├── delivery_terms
├── payment_terms
├── pdf_attachment
├── sent_at
├── created_at
└── updated_at

-- Tabela: Offer_Items (Pozycje oferty)
Offer_Items
├── id (PK)
├── offer_id (FK → Offers.id)
├── product_name*
├── quantity*
├── unit
├── unit_price*
├── discount_percentage
├── total_price*
└── created_at

-- Tabela: Contracts (Umowy)
Contracts
├── id (PK)
├── contract_number (UNIQUE, auto)
├── customer_id (FK → Customers.id)
├── offer_id (FK → Offers.id)
├── created_by (FK → Users.id)
├── approved_by (FK → Users.id)
├── status (DRAFT/SIGNED/ACTIVE/TERMINATED)
├── start_date*
├── end_date
├── contract_terms* (TEXT)
├── payment_terms*
├── sla_delivery*
├── service_contact
├── signed_at
├── created_at
└── updated_at

-- Tabela: Orders (Zamówienia)
Orders
├── id (PK)
├── order_number (UNIQUE, auto)
├── customer_id (FK → Customers.id)
├── contract_id (FK → Contracts.id, nullable)
├── order_date*
├── delivery_date
├── total_amount*
├── status (PENDING/DELIVERED/CANCELLED)
├── created_at
└── updated_at

-- Tabela: Order_Items (Pozycje zamówienia)
Order_Items
├── id (PK)
├── order_id (FK → Orders.id)
├── product_name*
├── quantity*
├── unit_price*
├── total_price*
└── created_at

-- Tabela: Tasks (Zadania automatyczne)
Tasks
├── id (PK)
├── customer_id (FK → Customers.id)
├── assigned_to (FK → Users.id)
├── task_type (FIRST_CALL/SALES_CALL/SEND_OFFER/FOLLOW_UP/POST_DELIVERY)
├── title*
├── description
├── due_date*
├── status (PENDING/COMPLETED/CANCELLED)
├── completed_at
├── created_at
└── updated_at

-- Tabela: Audit_Log (Logi zmian - RODO)
Audit_Log
├── id (PK)
├── user_id (FK → Users.id)
├── entity_type (Customer/Contact/Activity/etc.)
├── entity_id
├── action (CREATE/UPDATE/DELETE/VIEW)
├── changed_fields (JSON)
├── ip_address
└── created_at
```

### 2.2. Relacje między tabelami

```
Users (1) ──────────── (N) Customers [assigned_to]
Users (1) ──────────── (N) Activities
Users (1) ──────────── (N) Visits [sales_rep_id]
Users (1) ──────────── (N) Offers [created_by]
Users (1) ──────────── (N) Contracts [created_by, approved_by]
Users (1) ──────────── (N) Tasks [assigned_to]

Customers (1) ──────── (N) Contacts
Customers (1) ──────── (N) Activities
Customers (1) ──────── (N) Visits
Customers (1) ──────── (N) Offers
Customers (1) ──────── (N) Contracts
Customers (1) ──────── (N) Orders

Offers (1) ──────────── (N) Offer_Items
Offers (1) ──────────── (1) Contracts [optional]

Contracts (1) ────────── (N) Orders

Orders (1) ──────────── (N) Order_Items
```

## 3. Wybór technologii (Krok 3)

### 3.1. Analiza alternatyw

| Technologia | Zalety | Wady | Ocena |
|-------------|--------|------|-------|
| **PHP + MySQL + Bootstrap** | ✅ Łatwy deployment na każdym hostingu<br>✅ Niski koszt infrastruktury<br>✅ Szybka implementacja<br>✅ Dużo gotowych komponentów | ❌ Mniej nowoczesny stack<br>❌ Trudniejsze skalowanie | ⭐⭐⭐ (3/5) |
| **Python + Flask/Django + PostgreSQL** | ✅ Czytelny kod<br>✅ Django Admin panel "za darmo"<br>✅ PostgreSQL = zaawansowane funkcje<br>✅ Dobre biblioteki do raportów | ❌ Hosting droższy niż PHP<br>❌ Django może być overkill | ⭐⭐⭐⭐ (4/5) |
| **Node.js + Express + MongoDB/PostgreSQL** | ✅ Jeden język (JS) frontend/backend<br>✅ Real-time możliwości (WebSocket)<br>✅ Nowoczesny stack<br>✅ JSON-based API | ❌ Callback hell (ale async/await pomaga)<br>❌ MongoDB = brak transakcji (PostgreSQL lepszy) | ⭐⭐⭐⭐ (4/5) |
| **Deno + SvelteKit + PostgreSQL** | ✅ Nowoczesny runtime (TypeScript native)<br>✅ Bezpieczeństwo (permissions)<br>✅ SvelteKit = SSR + pełny framework<br>✅ Svelte = reaktywność bez Virtual DOM<br>✅ Jednolity stack (TypeScript)<br>✅ Deno Deploy / Edge functions | ❌ Młodszy ekosystem<br>❌ Mniej gotowych bibliotek<br>❌ Hosting: mniej opcji niż Node.js | ⭐⭐⭐⭐⭐ (5/5) |
| **ASP.NET Core + SQL Server** | ✅ Enterprise-grade<br>✅ Świetna wydajność<br>✅ Silne typowanie (C#)<br>✅ Visual Studio | ❌ Większa krzywa uczenia<br>❌ SQL Server licencje (można Express)<br>❌ Hosting droższy | ⭐⭐⭐ (3/5) |
| **Low-code: Access/Excel + VBA** | ✅ Bardzo szybki prototyp<br>✅ Nie wymaga umiejętności programowania<br>✅ Użytkownicy znają interfejs | ❌ Brak multi-user<br>❌ Nie działa w przeglądarce<br>❌ Brak skalowalności<br>❌ Problemy z dużymi danymi | ⭐⭐ (2/5) |

### 3.2. Rekomendacja: **Deno + SvelteKit + PostgreSQL**

**Uzasadnienie:**
- **TypeScript Native** = silne typowanie bez konfiguracji, mniejsza liczba błędów runtime
- **Deno Security Model** = domyślnie brak dostępu do sieci/plików/zmiennych środowiskowych (explicit permissions)
- **SvelteKit** = pełny framework fullstack (routing, SSR, API routes, forms) w jednym miejscu
- **Svelte** = kompilowany framework (brak runtime overhead), mniejsze bundle sizes, prostsza składnia niż React/Vue
- **PostgreSQL** = transakcje ACID, pełne wsparcie dla JSON (ceny konkurencji), wyszukiwanie full-text
- **Jednolity język** = TypeScript na froncie i backendzie = łatwiejsze współdzielenie typów/walidacji
- **Skalowalność** = do 200 klientów + 3 PH + 1 Szef = ~500-1000 rekordów/miesiąc → SvelteKit obsłuży bez problemu
- **Rozwój** = łatwo dodać: REST API (SvelteKit API routes), WebSocket, eksport PDF (jsPDF)
- **Hosting** = Deno Deploy (edge functions, 100k requests free), Vercel, Netlify, VPS

**Porównanie z Django:**
| Aspekt | Django | Deno + SvelteKit |
|--------|--------|------------------|
| Admin Panel | ✅ Built-in | ❌ Trzeba zbudować (ale jest SvelteKit Admin) |
| TypeScript | ❌ Nie (Python) | ✅ Native |
| Frontend | ❌ Jinja2 (stary) | ✅ Svelte (nowoczesny, reaktywny) |
| API | ✅ DRF | ✅ SvelteKit API routes |
| Performance | ⭐⭐⭐⭐ (4/5) | ⭐⭐⭐⭐⭐ (5/5) |
| Deployment | VPS/PythonAnywhere | Edge (Deno Deploy/Vercel) |

### 3.3. Stack technologiczny (szczegóły)

**Backend:**
- Deno 2.0+
- SvelteKit 2.0+ (fullstack framework)
- Deno Postgres (`deno.land/x/postgres`)
- Deno Cron (zadania asynchroniczne - newsletter, przypomnienia)
- Oak / Hono (opcjonalnie, jeśli potrzeba osobnego API)

**Frontend:**
- Svelte 5 (runes API - nowa reaktywność)
- SvelteKit (routing, SSR, forms)
- Tailwind CSS / DaisyUI (komponenty UI)
- Chart.js / Apache ECharts (wykresy KPI)
- TanStack Table (tabele z filtrowaniem/sortowaniem)

**Database:**
- PostgreSQL 15+
- Prisma (ORM dla Deno - type-safe queries)
- Drizzle ORM (alternatywa: lżejsza, SQL-like)

**Deployment:**
- Deno Deploy (edge functions, serverless)
- Docker + Deno (dla VPS)
- Nginx (reverse proxy, opcjonalnie)
- GitHub Actions (CI/CD)

## 4. Plan testowania (Krok 4)

### 4.1. Strategia testowania

#### 4.1.1. Testy jednostkowe (Unit Tests)
- **Narzędzie:** Deno test (built-in) + Vitest (opcjonalnie)
- **Zakres:**
  - Walidacja NIP (algorytm wag)
  - Walidacja telefonu (9-15 znaków, format)
  - Walidacja email (format RFC 5322)
  - Autonumeracja (LEAD-YYYY-XXXXX)
  - Obliczenia rabatów w ofercie
  - Fuzzy matching nazw firm (Fuse.js)

**Przykład testu:**
```typescript
import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { validateNip } from "./validators.ts";

Deno.test("NIP validation - valid", () => {
  assertEquals(validateNip("5260250274"), true);
});

Deno.test("NIP validation - invalid checksum", () => {
  assertEquals(validateNip("1234567890"), false);
});

Deno.test("NIP validation - too short", () => {
  assertEquals(validateNip("123"), false);
});
```

#### 4.1.2. Testy integracyjne (Integration Tests)
- **Narzędzie:** Deno test + SvelteKit test utils
- **Zakres:**
  - Utworzenie leada → automatyczne zadanie "Wykonaj pierwszy telefon"
  - Lead QUALIFIED → automatyczne zadanie "Telefon sprzedażowy" (48h)
  - NO_ANSWER (3x) → znacznik "trudny kontakt"
  - Wizyta NO_SHOW → propozycja nowego terminu (T+7 dni)
  - Oferta SENT → follow-up (T+3 dni)
  - Umowa SIGNED → zadanie "Telefon po dostawie" (T+1 dzień)

#### 4.1.3. Testy funkcjonalne (End-to-End)
- **Narzędzie:** Playwright (oficjalnie wspierany przez SvelteKit)
- **Scenariusze:**
  1. **Scenariusz: Pełny cykl lead → umowa**
     - Login jako PH
     - Dodanie nowego leada
     - Kwalifikacja leada
     - Rejestracja kontaktu telefonicznego (MEETING_SET)
     - Dodanie wizyty
     - Zmiana statusu wizyty na DONE
     - Utworzenie oferty
     - Zmiana statusu oferty na ACCEPTED
     - Utworzenie umowy
     - Weryfikacja: czy klient zmienił status na "active"

  2. **Scenariusz: Walidacje formularzy**
     - Próba dodania leada bez wymaganych pól → komunikat błędu
     - Próba dodania leada z nieprawidłowym NIP → komunikat błędu
     - Próba dodania duplikatu NIP → ostrzeżenie

  3. **Scenariusz: Uprawnienia**
     - Login jako PH → widzi tylko swoich klientów
     - Login jako Szef → widzi wszystkich klientów
     - Login jako PH → próba zatwierdzenia rabatu >X% → brak dostępu

#### 4.1.4. Testy akceptacyjne (UAT - User Acceptance Testing)
- **Uczestnicy:** 3 osoby testujące (symulacja: 2 PH + 1 Szef)
- **Czas trwania:** 2 tygodnie
- **Scenariusz:**
  - Każdy PH dodaje 10 leadów (dane testowe: sklepy z Poznania/Wrocławia)
  - Wykonanie 5 kontaktów telefonicznych
  - Zaplanowanie 3 wizyt
  - Utworzenie 2 ofert
  - Zawarcie 1 umowy
  - Szef generuje raporty KPI

**Kryteria akceptacji:**
- ✅ Wszystkie wymagane pola są walidowane
- ✅ Statusy zmieniają się automatycznie
- ✅ Zadania są generowane zgodnie z SLA
- ✅ Raporty wyświetlają poprawne dane
- ✅ Interfejs jest intuicyjny (maksymalnie 3 kliknięcia do dowolnej funkcji)
- ✅ Czas ładowania ekranów < 2 sekundy

### 4.2. Narzędzia do testowania

| Typ testu | Narzędzie | Konfiguracja |
|-----------|-----------|--------------|
| Unit Tests | Deno test | `deno test --allow-env --allow-read` |
| Integration Tests | Deno test + SvelteKit | `deno test --allow-all` |
| E2E Tests | Playwright | `deno run -A npm:playwright test` |
| Coverage | Deno coverage | `deno test --coverage=cov && deno coverage cov --html` |
| Load Testing | K6 | `deno run -A npm:k6 run script.js` (symulacja 50 użytkowników) |
| Manual Testing | TestRail / Excel | Arkusz z test cases |

### 4.3. Metryki jakości

| Metryka | Cel | Aktualny |
|---------|-----|----------|
| Code Coverage | ≥80% | TBD |
| Unit Tests Passing | 100% | TBD |
| Integration Tests Passing | 100% | TBD |
| E2E Tests Passing | ≥90% | TBD |
| Critical Bugs | 0 | TBD |
| Performance (p95) | <2s page load | TBD |

### 4.4. Plan testów (timeline)

1. **Tydzień 1-2:** Implementacja + testy jednostkowe (równolegle)
2. **Tydzień 3:** Testy integracyjne
3. **Tydzień 4:** Testy E2E + poprawki błędów
4. **Tydzień 5:** UAT (User Acceptance Testing)
5. **Tydzień 6:** Poprawki po UAT + deployment

## 5. Architektura systemu

### 5.1. Warstwa prezentacji (Frontend)

**Główne ekrany:**

1. **Dashboard** (dla PH)
   - Lista zadań do wykonania (Today's Tasks)
   - Statystyki: leady w tym tygodniu, wizyty zaplanowane, oferty do wysłania
   - Kalendarz wizyt (tydzień)

2. **Dashboard** (dla Szefa)
   - KPI: liczba leadów, konwersja, wartość umów
   - Wykresy: lejek sprzedaży, wyniki PH
   - Plan wizyt (cały zespół)

3. **Leady/Klienci** (lista + szczegóły)
   - Filtrowanie: status, miasto, PH, źródło
   - Sortowanie: data utworzenia, ostatni kontakt
   - Wyszukiwanie: nazwa, NIP
   - Szczegóły: timeline aktywności, osoby kontaktowe, historia

4. **Kontakty** (formularz rejestracji rozmowy)
   - Szybki dostęp z listy leadów
   - Pola: data, rozmówca, wynik, notatka
   - Automatyczne przypisanie kolejnego zadania

5. **Wizyty** (kalendarz + lista)
   - Widok kalendarza (tydzień/miesiąc)
   - Grupowanie po mieście (optymalizacja trasy)
   - Formularz po wizycie: wynik, ceny konkurencji, zdjęcia

6. **Oferty** (kreator + lista)
   - Krok 1: Wybór klienta
   - Krok 2: Dodanie pozycji (produkty, ceny, rabaty)
   - Krok 3: Warunki dostawy/płatności
   - Krok 4: Podgląd i wysłanie (PDF)

7. **Umowy** (lista + szczegóły)
   - Statusy, warunki, historia zamówień

8. **Raporty** (dla Szefa)
   - Lejek sprzedaży (Lead→Contract)
   - Aktywność PH (telefony/wizyty/oferty/umowy)
   - Obroty: miesięczne, per klient, per miasto
   - Top N powodów dyskwalifikacji

### 5.2. Warstwa logiki biznesowej (Backend)

**SvelteKit Project Structure:**

```
crm-sveltekit/
├── src/
│   ├── lib/                      # Biblioteki współdzielone
│   │   ├── server/               # Kod tylko server-side
│   │   │   ├── db/               # Database
│   │   │   │   ├── schema.ts     # Prisma/Drizzle schema
│   │   │   │   ├── client.ts     # DB connection
│   │   │   │   └── migrations/   # Migracje SQL
│   │   │   ├── validators.ts     # Walidatory (NIP, telefon, email)
│   │   │   ├── auth.ts           # Autentykacja (JWT/Session)
│   │   │   ├── permissions.ts    # Uprawnienia (PH vs Szef)
│   │   │   ├── tasks.ts          # Deno Cron (newsletter, SLA)
│   │   │   └── utils.ts          # Funkcje pomocnicze
│   │   ├── components/           # Komponenty Svelte współdzielone
│   │   ├── stores/               # Svelte stores (stan globalny)
│   │   └── types.ts              # Typy TypeScript (współdzielone)
│   ├── routes/                   # Routing (file-based)
│   │   ├── (auth)/               # Route group - autentykacja
│   │   │   ├── login/
│   │   │   │   └── +page.svelte
│   │   │   └── logout/
│   │   │       └── +page.server.ts
│   │   ├── (app)/                # Route group - aplikacja (wymaga auth)
│   │   │   ├── dashboard/
│   │   │   │   ├── +page.svelte       # Dashboard UI
│   │   │   │   └── +page.server.ts    # Load data
│   │   │   ├── leads/
│   │   │   │   ├── +page.svelte       # Lista leadów
│   │   │   │   ├── +page.server.ts    # Load/Action
│   │   │   │   └── [id]/
│   │   │   │       ├── +page.svelte   # Szczegóły leada
│   │   │   │       └── +page.server.ts
│   │   │   ├── activities/
│   │   │   ├── visits/
│   │   │   ├── offers/
│   │   │   ├── contracts/
│   │   │   └── reports/
│   │   └── api/                  # API routes (REST)
│   │       ├── customers/
│   │       │   ├── +server.ts    # GET, POST /api/customers
│   │       │   └── [id]/
│   │       │       └── +server.ts # GET, PUT, DELETE /api/customers/:id
│   │       ├── activities/
│   │       ├── visits/
│   │       └── reports/
│   ├── app.html                  # HTML template
│   ├── app.css                   # Global CSS (Tailwind)
│   └── hooks.server.ts           # Server hooks (auth middleware)
├── static/                       # Pliki statyczne
├── tests/                        # Testy
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── deno.json                     # Deno config
├── svelte.config.js              # SvelteKit config
└── tailwind.config.js            # Tailwind config
```

### 5.3. Warstwa danych (Database)

**PostgreSQL 15**
- **Schemat:** `crm_db`
- **Backup:** pg_dump codziennie (cron)
- **Indeksy:**
  - `customers.nip` (UNIQUE)
  - `customers.assigned_to` (FK)
  - `activities.customer_id, activity_date` (dla timeline)
  - `tasks.assigned_to, due_date, status` (dla listy zadań)

## 6. Wymagania niefunkcjonalne

### 6.1. Wydajność
- Czas ładowania strony: <2s (95 percentyl)
- Obsługa 10 jednoczesnych użytkowników bez spadku wydajności
- Baza danych: optymalizacja zapytań (select_related, prefetch_related)

### 6.2. Bezpieczeństwo
- **Autentykacja:** SvelteKit Auth (lucia-auth / Auth.js) - session-based lub JWT
- **Autoryzacja:** Custom hooks + middleware (role-based access control)
- **Deno Security Model:** Explicit permissions (--allow-net, --allow-read, --allow-env)
- **RODO:**
  - Maskowanie telefonu/email na listach (tylko ostatnie 3 znaki widoczne)
  - Pełny dostęp tylko w szczegółach (log access w Audit_Log)
  - Możliwość usunięcia danych klienta (GDPR "right to be forgotten")
- **SQL Injection:** Prisma/Drizzle ORM (parametryzowane zapytania)
- **XSS:** Svelte auto-escaping w templates
- **CSRF:** SvelteKit CSRF protection (built-in w formach)

### 6.3. Użyteczność
- **Responsive design:** działa na desktop, tablet, telefon
- **Dostępność:** WCAG 2.1 Level A (minimum)
- **Intuicyjny interfejs:** maksymalnie 3 kliknięcia do dowolnej funkcji
- **Komunikaty:** jasne komunikaty błędów/sukcesów

### 6.4. Utrzymywalność
- **Kod:** Deno fmt (auto-formatting), TypeScript strict mode
- **Linting:** Deno lint (built-in)
- **Dokumentacja:** JSDoc comments dla wszystkich funkcji
- **Testy:** coverage ≥80%
- **Deployment:** Docker Compose lub Deno Deploy (łatwe wdrożenie)

## 7. Plan wdrożenia

### 7.1. Fazy implementacji

**Faza 1: MVP (Minimum Viable Product) - 2 tygodnie**
- ✅ Setup: Deno + SvelteKit + PostgreSQL + Prisma
- ✅ Modele: Customer, Contact, Activity, User (Prisma schema)
- ✅ Autentykacja (lucia-auth)
- ✅ CRUD leady/klienci (SvelteKit forms + actions)
- ✅ Rejestracja kontaktów telefonicznych
- ✅ Dashboard podstawowy (lista zadań)
- ✅ Walidacje (NIP, telefon, email) - zod/yup

**Faza 2: Wizyty i Oferty - 1 tydzień**
- ✅ Model Visit + kalendarz (FullCalendar Svelte)
- ✅ Model Offer + Offer_Items
- ✅ Automatyczne zadania (Deno Cron)
- ✅ Formularz oferty (kreator multi-step)

**Faza 3: Umowy i Zamówienia - 1 tydzień**
- ✅ Model Contract
- ✅ Model Order + Order_Items
- ✅ Zmiana statusu klienta (prospect → active)
- ✅ Posprzedaż (telefon kontrolny)
- ✅ Generowanie PDF (jsPDF/pdfmake)

**Faza 4: Raporty i KPI - 1 tydzień**
- ✅ Dashboard dla Szefa (Chart.js/ECharts)
- ✅ Lejek sprzedaży
- ✅ Raporty: aktywność PH, obroty
- ✅ Eksport do CSV (Papa Parse)

**Faza 5: Automaty - 1 tydzień**
- ✅ Deno Cron (zadania okresowe)
- ✅ Newsletter (miesięczny) - Resend/SendGrid
- ✅ Przypomnienia SLA (email/in-app)
- ✅ Auto-zadania po zmianach statusów (database triggers lub hooks)

**Faza 6: Testy i UAT - 2 tygodnie**
- ✅ Testy jednostkowe/integracyjne/E2E
- ✅ UAT (3 osoby testujące)
- ✅ Poprawki błędów

### 7.2. Harmonogram

| Tydzień | Faza | Deliverables |
|---------|------|--------------|
| 1-2 | MVP | CRUD, walidacje, dashboard |
| 3 | Wizyty/Oferty | Kalendarz, oferty, automaty |
| 4 | Umowy/Zamówienia | Kontrakt, zamówienia |
| 5 | Raporty | Dashboard Szefa, KPI, eksporty |
| 6 | Automaty | Newsletter, SLA |
| 7-8 | Testy/UAT | Wszystkie testy + poprawki |

## 8. Ryzyka i mitygacja

| Ryzyko | Prawdopodobieństwo | Wpływ | Mitygacja |
|--------|---------------------|-------|-----------|
| Opóźnienie w implementacji | Średnie | Wysoki | Redukcja scope (MVP first), overtime |
| Błędy w walidacji NIP | Niskie | Średni | Dokładne testy jednostkowe, weryfikacja algorytmu |
| Problemy z wydajnością (duża baza) | Niskie | Średni | Indeksy DB, cache, pagination |
| Użytkownicy nie akceptują UI | Średnie | Wysoki | UAT wcześnie, iteracyjne poprawki |
| Problemy z hostingiem/deploymentem | Niskie | Średni | Docker Compose, dokumentacja wdrożenia |
| Brak wsparcia dla przeglądarek IE | Niskie | Niski | Bootstrap 5 nie wspiera IE, informacja dla użytkowników |

## 9. Załączniki

### 9.1. Słownik pojęć
- **PH** = Przedstawiciel Handlowy
- **Lead** = Potencjalny klient
- **SLA** = Service Level Agreement (terminy wykonania zadań)
- **RODO** = Rozporządzenie o Ochronie Danych Osobowych (GDPR)
- **NIP** = Numer Identyfikacji Podatkowej
- **MVP** = Minimum Viable Product

### 9.2. Przykładowe dane testowe

**Leady (10 sklepów z Poznania):**
1. Sklep Spożywczy "U Kasi", ul. Głogowska 15, Poznań
2. Delikatesy "Smak", ul. Ratajczaka 10, Poznań
3. Sklep Osiedlowy "ABC", ul. Grunwaldzka 50, Poznań
(... i tak dalej)

**Użytkownicy testowi:**
- `jan.kowalski` (PH, Poznań)
- `anna.nowak` (PH, Wrocław)
- `piotr.wisniewski` (PH, Szczecin)
- `admin` (Szef, wszystkie miasta)

### 9.3. Wzór URL API (opcjonalnie - dla przyszłego rozwoju)

```
GET    /api/customers/          # Lista klientów
POST   /api/customers/          # Dodaj klienta
GET    /api/customers/{id}/     # Szczegóły klienta
PUT    /api/customers/{id}/     # Aktualizuj klienta
DELETE /api/customers/{id}/     # Usuń klienta

GET    /api/activities/         # Lista aktywności
POST   /api/activities/         # Dodaj aktywność

GET    /api/visits/             # Lista wizyt
POST   /api/visits/             # Dodaj wizytę

GET    /api/offers/             # Lista ofert
POST   /api/offers/             # Dodaj ofertę

GET    /api/reports/funnel/     # Raport lejka sprzedaży
GET    /api/reports/kpi/        # KPI dla PH
```

---

**Koniec specyfikacji technicznej**

**Wersja:** 1.0
**Data:** 2025-10-11
**Autorzy:** Zespół projektowy CRM Lab6
