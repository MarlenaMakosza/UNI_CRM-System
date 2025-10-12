# Specyfikacja Techniczna (MVP) - System CRM dla Firmy X

**Bazuje na:** requirements-minimal.md (wersja 2.0 - pełny zakres z PDF)

## 1. Schemat procesu (Krok 1)

### 1.1. Diagram procesu (prosty)

```
┌─────────────────────────────────────────────────────────────┐
│ KROK 1: Pozyskanie leada                                    │
│ Input: Internet/Prasa/Książki/Spisy                        │
│ Dane: nazwa*, miasto*, adres, tel/email*, osoba decyzyjna, │
│       źródło*                                               │
│ Output: Lead (status=NEW, przypisany do PH)                │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ KROK 2: Kontakt telefoniczny                                │
│ Dane: data*, rozmówca, wynik*, notatka*                    │
│ Wyniki: NO_ANSWER / MEETING_SET / ORDER_TAKEN /            │
│         INFO_SENT / OFFER_PRESENTED                         │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ KROK 3: Wizyta (jeśli MEETING_SET)                         │
│ Przed: data+godz*, adres* (status=PLANNED)                 │
│ Po: status=DONE, notatka*, ceny konkurencji (TEXT)         │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ KROK 4: Oferta (kilka dni później)                         │
│ Uproszczenie: kontakt tel. z outcome=OFFER_PRESENTED       │
│ Notatka: jaką ofertę, reakcja klienta                      │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ KROK 5: Umowa (jeśli oferta zaakceptowana)                 │
│ Uproszczenie: Lead.status → ACTIVE                          │
│ Opcjonalnie: tabela contracts (jeśli czas)                 │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ KROK 6: Telefon kontrolny po dostawie                       │
│ Kontakt tel. outcome=POST_DELIVERY_CHECK                    │
│ Notatka: czy klient zadowolony                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ KROK 7: Newsletter (opcjonalnie)                            │
│ Przycisk → Lista emaili ACTIVE klientów do skopiowania      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2. Raporty dla Szefa (równolegle)

```
┌─────────────────────────────────────────────────────────────┐
│ RAPORTY KIEROWNIKA                                          │
│ - Liczba wizyt per PH                                       │
│ - Liczba telefonów per PH                                   │
│ - Liczba umów per PH                                        │
│ - Zestawienie planowanych wizyt                             │
│ - (Opcjonalnie) Obroty per klient                          │
└─────────────────────────────────────────────────────────────┘
```

## 2. Projekt bazy danych (Krok 2)

### 2.1. Schemat relacyjny (4-5 tabel)

```sql
-- 1. Users (użytkownicy)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'PH' | 'MANAGER'
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  territory VARCHAR(50), -- Poznań/Wrocław/Szczecin (dla PH)
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Leads (leady/klienci)
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address VARCHAR(255), -- ulica + nr (opcjonalne)
  phone VARCHAR(20),
  email VARCHAR(100),
  contact_person VARCHAR(255), -- osoba decyzyjna (imię+nazwisko)
  lead_source VARCHAR(100) NOT NULL, -- Internet/Prasa/Książki branżowe/Spisy firm/Polecenie/Inne
  status VARCHAR(20) DEFAULT 'NEW', -- NEW/QUALIFIED/ACTIVE/INACTIVE
  assigned_to INTEGER REFERENCES users(id),
  total_revenue DECIMAL(10,2) DEFAULT 0, -- opcjonalnie: suma obrotów
  created_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT check_contact CHECK (phone IS NOT NULL OR email IS NOT NULL)
);

-- 3. Activities (kontakty telefoniczne)
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  activity_date DATE NOT NULL,
  contact_person_name VARCHAR(255), -- z kim rozmawiał
  outcome VARCHAR(50) NOT NULL,
  -- NO_ANSWER/MEETING_SET/ORDER_TAKEN/INFO_SENT/OFFER_PRESENTED/POST_DELIVERY_CHECK
  notes TEXT NOT NULL, -- szczegóły rozmowy
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Visits (wizyty)
CREATE TABLE visits (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  scheduled_at TIMESTAMP NOT NULL, -- data + godzina
  address VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'PLANNED', -- PLANNED/DONE/CANCELLED
  visit_notes TEXT, -- efekty rozmowy po wizycie
  competitor_prices TEXT, -- ceny konkurencji (TEXT, nie JSON)
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Contracts (opcjonalnie - jeśli czas pozwoli)
CREATE TABLE contracts (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES leads(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  signed_at DATE NOT NULL,
  products TEXT, -- lista produktów (TEXT)
  terms TEXT, -- warunki dostawy/płatności
  contract_value DECIMAL(10,2), -- kwota umowy
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.2. Relacje między tabelami

```
users (1) ──────────── (N) leads [assigned_to]
users (1) ──────────── (N) activities [user_id]
users (1) ──────────── (N) visits [user_id]
users (1) ──────────── (N) contracts [user_id]

leads (1) ──────────── (N) activities [lead_id]
leads (1) ──────────── (N) visits [lead_id]
leads (1) ──────────── (N) contracts [lead_id]
```

### 2.3. Indeksy (dla wydajności)

```sql
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_activities_lead ON activities(lead_id);
CREATE INDEX idx_activities_date ON activities(activity_date);
CREATE INDEX idx_visits_lead ON visits(lead_id);
CREATE INDEX idx_visits_scheduled ON visits(scheduled_at);
```

## 3. Wybór technologii (Krok 3)

### 3.1. Wybrana technologia

**Stack:** Node.js + SvelteKit + PostgreSQL + Drizzle ORM + DaisyUI

### 3.2. Uzasadnienie (dla projektu studenckiego)

| Kryterium | Rozwiązanie | Uzasadnienie |
|-----------|-------------|--------------|
| **Jeden język** | TypeScript (front+back) | Łatwiej się uczyć, współdzielenie typów |
| **Szybkie prototypowanie** | SvelteKit | File-based routing, SSR, forms + actions |
| **Mało boilerplate** | Svelte | Mniej kodu niż React/Vue |
| **Darmowy hosting** | Vercel/Netlify + Neon.tech | Darmowy tier + PostgreSQL free |
| **Ekosystem** | npm | Największa baza pakietów, stabilny |
| **UI gotowe** | DaisyUI (Tailwind) | Komponenty bez pisania CSS |
| **ORM prosty** | Drizzle | Lżejszy niż Prisma, SQL-like |

### 3.3. Porównanie z alternatywami

| Technologia | Zalety | Wady | Czy wybrać? |
|-------------|--------|------|-------------|
| **Node.js + SvelteKit** | ✅ TypeScript native<br>✅ Jeden projekt<br>✅ Darmowy hosting<br>✅ Stabilny ekosystem<br>✅ Dużo pakietów | ⚠️ Wymaga bundlera (Vite) | ✅ **TAK** |
| Django + PostgreSQL | ✅ Admin panel za darmo<br>✅ Dużo bibliotek | ❌ Python + JS = 2 języki<br>❌ Więcej setupu | ❌ NIE |
| PHP + Laravel + MySQL | ✅ Łatwy hosting<br>✅ Dużo tutoriali | ❌ Stary stack<br>❌ Mniej przyjemny | ❌ NIE |
| Node.js + Express | ✅ Popularny<br>✅ Dużo pakietów | ❌ Trzeba budować od zera<br>❌ Brak structure | ❌ NIE |

### 3.4. Stack technologiczny (szczegóły)

**Backend + Frontend (jeden projekt SvelteKit):**
```
- Node.js 20.x+ (LTS)
- SvelteKit 2.0+
- PostgreSQL 15+ (lokalne lub Neon.tech free tier)
- Drizzle ORM
- Lucia Auth (autentykacja session-based)
```

**UI:**
```
- Svelte 4.x
- DaisyUI 4.0+ (komponenty Tailwind)
- Lucide Icons
- (Opcjonalnie) Chart.js - jeśli raporty z wykresami
```

**Deployment:**
```
- Vercel/Netlify (backend + frontend)
- PostgreSQL: Neon.tech (free tier: 0.5 GB)
- Alternatywnie: uruchomienie lokalne
```

## 4. Plan testowania (Krok 4)

### 4.1. Strategia testowania (uproszczona)

**Głównie testy manualne** (bo projekt studencki, mało czasu)

#### 4.1.1. Testy manualne (checklist)

**Moduł: Leady**
- [ ] Dodanie leada z wszystkimi polami
- [ ] Walidacja: brak telefonu i emaila → błąd
- [ ] Walidacja: zły format telefonu → błąd
- [ ] Walidacja: zły format email → błąd
- [ ] PH widzi tylko swoich leadów
- [ ] Kierownik widzi wszystkich

**Moduł: Kontakty telefoniczne**
- [ ] Dodanie kontaktu z wynikiem NO_ANSWER
- [ ] Dodanie kontaktu z wynikiem MEETING_SET → przekierowanie do wizyty
- [ ] Dodanie kontaktu ORDER_TAKEN → notatka zapisana
- [ ] Dodanie kontaktu OFFER_PRESENTED → notatka z ofertą
- [ ] Timeline kontaktów widoczny przy leadzie

**Moduł: Wizyty**
- [ ] Dodanie wizyty (status PLANNED)
- [ ] Zmiana statusu na DONE + notatka
- [ ] Wprowadzenie cen konkurencji (pole tekstowe)
- [ ] Harmonogram wizyt widoczny (lista + daty)
- [ ] Filtrowanie wizyt po dacie

**Moduł: Raporty (Kierownik)**
- [ ] Raport: liczba wizyt per PH
- [ ] Raport: liczba telefonów per PH
- [ ] Raport: liczba umów per PH (jeśli zaimplementowano)
- [ ] Filtrowanie po okresie (od-do)
- [ ] Filtrowanie po PH (dropdown)

**Moduł: Uprawnienia**
- [ ] Login jako PH → widzi tylko swoich klientów
- [ ] Login jako Kierownik → widzi wszystkich
- [ ] Logout działa

#### 4.1.2. Testy automatyczne (minimum)

**Tylko 3-5 testów jednostkowych** (żeby pokazać, że umiesz)

```typescript
// src/lib/server/validators.test.ts

import { describe, it, expect } from 'vitest';
import { validatePhone, validateEmail } from './validators';

describe('Walidacja telefonu', () => {
  it('akceptuje poprawny telefon', () => {
    expect(validatePhone('123456789')).toBe(true);
    expect(validatePhone('123 456 789')).toBe(true);
  });

  it('odrzuca niepoprawny telefon', () => {
    expect(validatePhone('123')).toBe(false); // za krótki
    expect(validatePhone('abc123456')).toBe(false); // litery
  });
});

describe('Walidacja email', () => {
  it('akceptuje poprawny email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('odrzuca niepoprawny email', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
  });
});
```

**Uruchomienie:**
```bash
npm test
```

#### 4.1.3. Testy E2E (opcjonalnie - jeśli czas)

**Playwright** (1-2 scenariusze podstawowe)

```typescript
// tests/e2e/lead-flow.spec.ts

import { test, expect } from '@playwright/test';

test('Pełny flow: dodanie leada → kontakt → wizyta', async ({ page }) => {
  // 1. Login
  await page.goto('/login');
  await page.fill('input[name="username"]', 'jan');
  await page.fill('input[name="password"]', 'test123');
  await page.click('button[type="submit"]');

  // 2. Dodanie leada
  await page.goto('/leads/new');
  await page.fill('input[name="company_name"]', 'Sklep U Kasi');
  await page.fill('input[name="city"]', 'Poznań');
  await page.fill('input[name="phone"]', '123456789');
  await page.selectOption('select[name="lead_source"]', 'Internet');
  await page.click('button[type="submit"]');

  // 3. Sprawdź czy lead się pojawił
  await expect(page.locator('text=Sklep U Kasi')).toBeVisible();
});
```

### 4.2. Narzędzia do testowania

| Typ testu | Narzędzie | Konfiguracja | Priorytet |
|-----------|-----------|--------------|-----------|
| **Testy manualne** | Checklist w Excelu | - | ⭐⭐⭐ (najważniejsze) |
| **Unit Tests** | Vitest | `npm test` | ⭐⭐ (3-5 testów wystarczy) |
| **E2E Tests** | Playwright | `npm run test:e2e` | ⭐ (opcjonalnie) |

### 4.3. Dokumentacja testów (do sprawozdania)

**Co załączyć do sprawozdania:**
1. ✅ Checklist testów manualnych (Excel/Markdown)
2. ✅ Zrzuty ekranu z każdego testu (pass/fail)
3. ✅ Wynik `npm test` (screenshot terminala)
4. ✅ Opis znalezionych błędów + jak naprawiono

## 5. Architektura systemu (uproszczona)

### 5.1. Struktura projektu

```
crm-mvp/
├── src/
│   ├── lib/
│   │   ├── server/                   # Tylko server-side
│   │   │   ├── db/
│   │   │   │   ├── schema.ts         # Drizzle schema (5 tabel)
│   │   │   │   ├── client.ts         # PostgreSQL connection
│   │   │   │   └── migrations/       # SQL migrations
│   │   │   ├── auth.ts               # Lucia auth (login/logout/session)
│   │   │   ├── validators.ts         # validatePhone, validateEmail
│   │   │   └── permissions.ts        # isPH, isManager
│   │   ├── components/               # Komponenty Svelte
│   │   │   ├── LeadCard.svelte
│   │   │   ├── ActivityTimeline.svelte
│   │   │   └── VisitCalendar.svelte
│   │   └── types.ts                  # Typy współdzielone
│   ├── routes/
│   │   ├── login/
│   │   │   └── +page.svelte          # Formularz logowania
│   │   ├── (app)/                    # Route group (wymaga auth)
│   │   │   ├── +layout.server.ts     # Check auth middleware
│   │   │   ├── dashboard/
│   │   │   │   ├── +page.svelte      # Dashboard (różny dla PH/Kierownik)
│   │   │   │   └── +page.server.ts   # Load leadów
│   │   │   ├── leads/
│   │   │   │   ├── +page.svelte      # Lista leadów
│   │   │   │   ├── +page.server.ts   # Load + Actions (add/edit)
│   │   │   │   ├── new/
│   │   │   │   │   └── +page.svelte  # Formularz dodawania
│   │   │   │   └── [id]/
│   │   │   │       ├── +page.svelte  # Szczegóły + timeline
│   │   │   │       └── +page.server.ts
│   │   │   ├── activities/
│   │   │   │   └── new/
│   │   │   │       ├── +page.svelte  # GŁÓWNY EKRAN (instrukcja!)
│   │   │   │       └── +page.server.ts
│   │   │   ├── visits/
│   │   │   │   ├── +page.svelte      # Lista wizyt (harmonogram)
│   │   │   │   └── +page.server.ts
│   │   │   └── reports/
│   │   │       ├── +page.svelte      # Raporty (tylko Kierownik)
│   │   │       └── +page.server.ts   # SQL aggregations
│   ├── app.html
│   ├── app.css                       # Tailwind + DaisyUI
│   └── hooks.server.ts               # Auth hooks
├── static/
│   └── favicon.ico
├── tests/
│   ├── unit/
│   │   └── validators.test.ts
│   └── e2e/ (opcjonalnie)
│       └── lead-flow.spec.ts
├── drizzle.config.ts                 # Drizzle config
├── package.json                      # npm dependencies + scripts
├── vite.config.ts                    # Vite config
├── tailwind.config.js
└── README.md
```

### 5.2. Ekrany (8-9 ekranów)

| # | Ekran | Opis | Priorytet |
|---|-------|------|-----------|
| 1 | `/login` | Formularz logowania | ⭐⭐⭐ |
| 2 | `/dashboard` | Dashboard (różny dla PH/Kierownik) | ⭐⭐⭐ |
| 3 | `/leads` | Lista leadów + filtry | ⭐⭐⭐ |
| 4 | `/leads/new` | Dodaj leada | ⭐⭐⭐ |
| 5 | `/leads/[id]` | Szczegóły leada + timeline aktywności | ⭐⭐⭐ |
| 6 | `/activities/new?leadId=X` | **GŁÓWNY EKRAN** - rejestracja kontaktu tel. | ⭐⭐⭐ |
| 7 | `/visits` | Lista wizyt (harmonogram) | ⭐⭐⭐ |
| 8 | `/visits/new?leadId=X` | Dodaj wizytę | ⭐⭐⭐ |
| 9 | `/reports` | Raporty dla Kierownika | ⭐⭐⭐ |

### 5.3. Główny ekran (instrukcja obsługi)

**Ekran: `/activities/new?leadId=123` - Rejestracja kontaktu telefonicznego**

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ Rejestracja kontaktu telefonicznego                        │
│                                                            │
│ Lead: Sklep U Kasi (Poznań) [breadcrumb]                  │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │ Data kontaktu*         [2025-10-11] (readonly)        ││
│ │                                                        ││
│ │ Rozmówca               [________________]              ││
│ │   (z kim rozmawiał)                                    ││
│ │                                                        ││
│ │ Wynik rozmowy*         [▼ Wybierz wynik]              ││
│ │                        - NO_ANSWER                     ││
│ │                        - MEETING_SET                   ││
│ │                        - ORDER_TAKEN                   ││
│ │                        - INFO_SENT                     ││
│ │                        - OFFER_PRESENTED               ││
│ │                        - POST_DELIVERY_CHECK           ││
│ │                                                        ││
│ │ Notatka*               ┌──────────────────────────┐   ││
│ │   (co ustalono)        │                          │   ││
│ │                        │                          │   ││
│ │                        │                          │   ││
│ │                        └──────────────────────────┘   ││
│ │                                                        ││
│ │ [Zapisz]  [Anuluj]                                    ││
│ └────────────────────────────────────────────────────────┘│
│                                                            │
│ Jeśli wynik = MEETING_SET:                                 │
│   → "Czy chcesz zaplanować wizytę?" [Tak] [Nie]           │
└────────────────────────────────────────────────────────────┘
```

**Kod (uproszczony):**
```svelte
<!-- src/routes/(app)/activities/new/+page.svelte -->
<script lang="ts">
  export let data; // { lead, outcomes }
  let outcome = '';
  let notes = '';

  async function handleSubmit() {
    const response = await fetch('/activities/new', {
      method: 'POST',
      body: new FormData(form)
    });
    if (outcome === 'MEETING_SET') {
      // Redirect to /visits/new?leadId=...
    }
  }
</script>

<h1>Rejestracja kontaktu - {data.lead.company_name}</h1>

<form on:submit|preventDefault={handleSubmit}>
  <input type="hidden" name="lead_id" value={data.lead.id} />

  <label>
    Data kontaktu*
    <input type="date" value={new Date().toISOString().split('T')[0]} readonly />
  </label>

  <label>
    Rozmówca
    <input type="text" name="contact_person" />
  </label>

  <label>
    Wynik*
    <select name="outcome" bind:value={outcome} required>
      <option value="">Wybierz...</option>
      {#each data.outcomes as opt}
        <option value={opt}>{opt}</option>
      {/each}
    </select>
  </label>

  <label>
    Notatka*
    <textarea name="notes" bind:value={notes} required rows="5" />
  </label>

  <button type="submit" class="btn btn-primary">Zapisz</button>
</form>

{#if outcome === 'MEETING_SET'}
  <p>Czy chcesz zaplanować wizytę?</p>
  <a href="/visits/new?leadId={data.lead.id}" class="btn">Tak</a>
{/if}
```

## 6. Plan wdrożenia (3 tygodnie)

### Tydzień 1: Setup + CRUD Leadów + Kontakty

**Dzień 1-2: Setup projektu**
- [ ] Node.js + SvelteKit init
- [ ] PostgreSQL (lokalne/Neon.tech) + Drizzle ORM
- [ ] Tabele: users, leads, activities, visits
- [ ] Lucia Auth (login/logout)

**Dzień 3-4: CRUD Leadów**
- [ ] Lista leadów (filtrowanie, sortowanie)
- [ ] Dodaj lead (formularz z walidacją)
- [ ] Edytuj lead
- [ ] Szczegóły lead (timeline aktywności)

**Dzień 5-7: Kontakty telefoniczne**
- [ ] Formularz rejestracji kontaktu (GŁÓWNY EKRAN!)
- [ ] Wszystkie typy outcome (NO_ANSWER, MEETING_SET, ORDER_TAKEN, etc.)
- [ ] Timeline aktywności przy leadzie
- [ ] Przekierowanie do wizyty po MEETING_SET

### Tydzień 2: Wizyty + Raporty + Uprawnienia

**Dzień 8-10: Wizyty**
- [ ] Lista wizyt (harmonogram)
- [ ] Dodaj wizytę (formularz)
- [ ] Zmiana statusu (PLANNED → DONE)
- [ ] Pole "ceny konkurencji" (TEXT)

**Dzień 11-12: Raporty**
- [ ] Dashboard Kierownik (statystyki)
- [ ] Raport: liczba wizyt per PH
- [ ] Raport: liczba telefonów per PH
- [ ] Raport: liczba umów per PH (jeśli zaimplementowano)
- [ ] Filtrowanie (okres, PH, miasto)

**Dzień 13-14: Uprawnienia + UI polish**
- [ ] PH widzi tylko swoich klientów (filter w queries)
- [ ] Kierownik widzi wszystkich
- [ ] Role-based access (middleware)
- [ ] UI/UX improvements (DaisyUI styling)

### Tydzień 3: Testy + Instrukcja + Sprawozdanie

**Dzień 15-16: Testy**
- [ ] Testy manualne (checklist + screenshots)
- [ ] 3-5 testów jednostkowych (validators)
- [ ] Opcjonalnie: 1-2 testy E2E (Playwright)

**Dzień 17-18: Instrukcja obsługi**
- [ ] Screenshots głównego ekranu (kontakt tel.)
- [ ] Opis krok po kroku (jak w requirements)
- [ ] PDF/Markdown z instrukcją

**Dzień 19-21: Sprawozdanie**
- [ ] Projekt systemu (diagramy + opisy)
- [ ] Opis testów + wyniki
- [ ] Zrzuty ekranu z aplikacji
- [ ] Spakowana aplikacja (ZIP)

## 7. Kryteria akceptacji (DoD)

### 7.1. Funkcjonalne

✅ **Kroki 1-4 z instrukcji wykonane:**
- ✅ Krok 1: Diagram procesu (prosty + z danymi)
- ✅ Krok 2: Projekt bazy danych (tabele + relacje)
- ✅ Krok 3: Wybór technologii (porównanie + uzasadnienie)
- ✅ Krok 4: Plan testowania (testy manualne + unit)

✅ **System działa:**
- ✅ Dodawanie leadów (wszystkie pola z PDF)
- ✅ Rejestracja kontaktów (wszystkie typy outcome)
- ✅ Planowanie wizyt (harmonogram)
- ✅ Wprowadzanie wyników po wizycie (+ ceny konkurencji)
- ✅ Raporty dla Kierownika (wizyt, telefonów, umów per PH)
- ✅ Uprawnienia działają (PH widzi swoich, Kierownik wszystkich)

✅ **Sprawozdanie zawiera:**
- ✅ Część projektową (z kroków 1-4)
- ✅ Instrukcję obsługi (ekran rejestracji kontaktu + screenshots)
- ✅ Opis testów (checklist + wyniki)
- ✅ Zrzuty ekranu z działającej aplikacji
- ✅ Spakowaną aplikację (ZIP)

### 7.2. Techniczne

✅ Aplikacja uruchamia się lokalnie: `npm run dev`
✅ Migracje działają: `npm run db:push`
✅ Testy przechodzą: `npm test`
✅ Kod sformatowany: `npm run format` (Prettier)

## 8. Ryzyka i mitygacja

| Ryzyko | Prawdopodobieństwo | Mitygacja |
|--------|-------------------|-----------|
| Za mało czasu | Średnie | Wyciąć tabele contracts (opcjonalna) |
| Problemy z deploymentem | Niskie | Pokazać lokalnie + screenshots |
| Auth nie działa | Niskie | Użyć prostego session (bez Lucia) |
| Student nie zna TypeScript | Średnie | Tutorial + dokumentacja |

---

**Koniec specyfikacji technicznej**

**Wersja:** 2.0 (pełny zakres z PDF, implementacja uproszczona)
**Data:** 2025-10-11
**Cel:** Zdać Laboratorium 6 z oceną bardzo dobrą 🎯
