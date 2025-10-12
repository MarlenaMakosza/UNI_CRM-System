# CRM Lab 6 - System CRM dla Firmy X

System CRM dla hurtowni warzyw i owoców - projekt studencki na Laboratorium 6.

## 📋 Status projektu

### ✅ Gotowe

- [x] Docker Compose dla PostgreSQL
- [x] Instrukcja instalacji (Windows)
- [x] Konfiguracja projektu (Nodejs, SvelteKit, Drizzle, Tailwind)
- [x] Wymagania minimalne (pełny zakres z PDF)
- [x] Specyfikacja techniczna
- [x] **KROK 1 - Diagramy PlantUML** (6 diagramów: proces, role, ERD, use cases, sequence)

### ⏳ Do zrobienia

- [ ] KROK 2 - Model bazy danych (już w diagramach, do implementacji Drizzle)
- [ ] KROK 3 - Uzasadnienie wyboru technologii (już w specyfikacji)
- [ ] KROK 4 - Strategia testowania (już w specyfikacji)
- [ ] Implementacja struktury projektu SvelteKit
- [ ] Schemat bazy danych (Drizzle)
- [ ] System autentykacji (Lucia)
- [ ] Ekrany aplikacji (8-9 widoków)
- [ ] Logika biznesowa
- [ ] KROK 6 - Instrukcja obsługi (ekran kontaktu telefonicznego)

## 🚀 Szybki start

### 1. Instalacja środowiska

Postępuj zgodnie z instrukcją:

```
docs/minimal-student/INSTALLATION.md
```

Instaluje:

- Nodejs
- Docker Desktop
- VS Code + rozszerzenia

### 2. Uruchom bazę danych

```powershell
docker-compose up -d
```

### 3. Skopiuj konfigurację środowiska

```powershell
cp .env.example .env
```

Wygeneruj `AUTH_SECRET` (patrz INSTALLATION.md, Krok 5.2)

### 4. Zainstaluj zależności (po utworzeniu projektu)

```powershell
npm install
```

### 5. Uruchom migracje (po utworzeniu schematu)

```powershell
npm run db:migrate
```

### 6. Uruchom aplikację

```powershell
npm run dev
```

Aplikacja: http://localhost:5173

## 📁 Struktura projektu

```
CRM_Lab6/
├── docs/
│   ├── full/                          # Pełna dokumentacja (referencja)
│   │   ├── requirements.md
│   │   └── technical-specification.md
│   └── minimal-student/               # Wersja minimalna (główna)
│       ├── requirements-minimal.md    ← GŁÓWNE WYMAGANIA
│       ├── technical-specification-minimal.md
│       └── INSTALLATION.md            ← INSTRUKCJA INSTALACJI
├── lab-materials/
│   └── Laboratorium 6 Budowa systemu CRM.pdf
├── src/                               # Kod aplikacji (do utworzenia)
│   ├── lib/
│   │   ├── server/
│   │   │   ├── db/
│   │   │   │   ├── schema.ts
│   │   │   │   ├── client.ts
│   │   │   │   └── migrations/
│   │   │   ├── auth.ts
│   │   │   └── validators.ts
│   │   └── components/
│   └── routes/
│       ├── login/
│       ├── (app)/
│       │   ├── dashboard/
│       │   ├── leads/
│       │   ├── activities/
│       │   ├── visits/
│       │   └── reports/
├── docker-compose.yml                 # PostgreSQL w Docker
├── package.json                       # Zależności npm
├── drizzle.config.ts                  # Konfiguracja Drizzle ORM
├── svelte.config.js                   # Konfiguracja SvelteKit
├── tailwind.config.js                 # Konfiguracja Tailwind + DaisyUI
└── .env.example                       # Przykładowa konfiguracja środowiska
```

## 🛠️ Stack technologiczny

- **Runtime**: Node.js
- **Package Manager**: npm
- **Framework**: SvelteKit 2.0+
- **Baza danych**: PostgreSQL 15 (Docker)
- **ORM**: Drizzle ORM
- **Auth**: Lucia v3
- **UI**: Tailwind CSS + DaisyUI
- **TypeScript**: 5.5+

## 📖 Dokumentacja

### Wymagania

- **Główne**: `docs/minimal-student/requirements-minimal.md`
- **Pełne** (referencja): `docs/full/requirements.md`

### Specyfikacja techniczna

- **Główna**: `docs/minimal-student/technical-specification-minimal.md`
- **Pełna** (referencja): `docs/full/technical-specification.md`

### Proces biznesowy (7 kroków)

1. Pozyskanie leada
2. Kontakt telefoniczny
3. Wizyta w sklepie
4. Oferta (uproszczona)
5. Umowa (opcjonalna)
6. Telefon kontrolny po dostawie
7. Newsletter (manualny)

### Role

- **Przedstawiciel handlowy (PH)**: Widzi tylko swoich klientów
- **Kierownik**: Widzi wszystko + raporty

### Ekrany (minimum 8-9)

1. Login
2. Dashboard PH
3. Dashboard Kierownik
4. Leady - Lista
5. Lead - Dodaj/Edytuj
6. **Kontakt telefoniczny - Dodaj** ← GŁÓWNY EKRAN (instrukcja obsługi)
7. Wizyta - Lista/Harmonogram
8. Wizyta - Dodaj/Edytuj
9. Raporty - Kierownik

## 🗄️ Model danych (uproszczony)

### Tabele główne

- `users` - użytkownicy (PH + Kierownik)
- `leads` - firmy/sklepy (z osobą decyzyjną)
- `activities` - kontakty telefoniczne (6 typów)
- `visits` - wizyty (z cenami konkurencji)
- `contracts` - umowy (opcjonalne)

Szczegóły: `docs/minimal-student/technical-specification-minimal.md` (Krok 2)

## ⚙️ Przydatne komendy

### Rozwój

```powershell
npm run dev          # Uruchom dev server
npm run build        # Build produkcyjny
npm run preview      # Podgląd buildu
npm run check        # Sprawdź typy TypeScript
```

### Baza danych (Drizzle)

```powershell
npm run db:generate  # Generuj migracje
npm run db:migrate   # Wykonaj migracje
npm run db:push      # Push bez migracji (dev)
npm run db:studio    # Drizzle Studio (GUI)
```

### Docker (PostgreSQL)

```powershell
docker-compose up -d         # Uruchom w tle
docker-compose stop          # Zatrzymaj
docker-compose logs -f       # Zobacz logi
docker-compose down          # Zatrzymaj i usuń kontener
docker-compose down -v       # Usuń kontener + dane
```

### PostgreSQL (terminal)

```powershell
docker exec -it crm-postgres psql -U crm_user -d crm_db
```

## 🎯 Kryteria akceptacji (minimum)

- [ ] PH może dodać leada ze wszystkimi danymi z PDF
- [ ] PH może zarejestrować kontakt telefoniczny (6 typów)
- [ ] PH może zaplanować wizytę (z harmonogramem)
- [ ] PH może wprowadzić wyniki po wizycie (+ ceny konkurencji)
- [ ] PH widzi tylko swoich klientów (podział terytorialny)
- [ ] Kierownik widzi raporty: wizyty, telefony, umowy per PH
- [ ] Instrukcja obsługi z screenshots (ekran rejestracji kontaktu)
- [ ] Aplikacja działa lokalnie

## ⏱️ Timeline (2 tygodnie)

**Tydzień 1:**

- Setup + CRUD leadów + kontakty telefoniczne

**Tydzień 2:**

- Wizyty + raporty + uprawnienia + testy

## 📝 Kontekst projektu

Szczegóły w: `.claude/project-context.md`

---

**Data utworzenia**: 2025-10-11
**Wersja**: 1.0
**Student**: Bazowa znajomość TypeScript, doświadczenie z SvelteKit
**Środowisko**: Windows, VS Code, Docker Compose
