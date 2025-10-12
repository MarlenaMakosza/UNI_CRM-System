# ✅ LISTA KONTROLNA - CO SPRAWDZIĆ JUTRO

**Data:** 2025-10-11 (wieczór) → Sprawdzić: 2025-10-12 (rano)
**Status:** Przygotowane do weryfikacji po prześpieniu się z pomysłami

---

## 🎯 Cel: Analiza zgodności z instrukcją Laboratorium 6

**Plik źródłowy:** `lab-materials/Laboratorium 6 Budowa systemu CRM.pdf`

---

## 📋 KROK 1: Weryfikacja diagramów PlantUML

### ✅ Co zostało zrobione:

- [x] `diagrams/01-process-full.puml` - Proces pełny (7 kroków)
- [x] `diagrams/02-process-minimal.puml` - Proces minimalny (MVP)
- [x] `diagrams/03-roles-permissions.puml` - Role i uprawnienia
- [x] `diagrams/04-data-model.puml` - Model danych (ERD)
- [x] `diagrams/05-use-cases.puml` - Przypadki użycia
- [x] `diagrams/06-sequence-phone-contact.puml` - Sekwencja głównego ekranu
- [x] Wszystkie diagramy wygenerowane jako PNG

### 🔍 Co sprawdzić jutro:

#### 1.1. Diagram aktywności (01-process-full.puml)

- [ ] **Czy zawiera wszystkie 7 kroków z PDF (strona 3-4, Załącznik nr 1)?**
  - Pozyskanie leada (źródła: Internet/Prasa/Książki/Spisy)
  - Kontakt telefoniczny (typy wyników)
  - Wizyta w sklepie (harmonogram, ceny konkurencji)
  - Oferta (kilka dni po wizycie)
  - Umowa (jeśli zaakceptowano)
  - Telefon kontrolny (po dostawie)
  - Newsletter (miesięczny)

- [ ] **Czy notacja UML jest poprawna?**
  - Start/Stop node
  - Decision diamonds (if/then/else)
  - Activities (prostokąty zaokrąglone)
  - Swimlanes (PH vs Kierownik)
  - Notes (dodatkowe informacje)

- [ ] **Czy diagram jest czytelny?**
  - Nie za duży/mały?
  - Czcionka czytelna?
  - Kolory pomocne czy przeszkadzają?

**Akcja jeśli problem:** Edytuj `.puml` i regeneruj PNG

---

#### 1.2. Diagram minimalny (02-process-minimal.puml)

- [ ] **Czy uproszczenia są sensowne dla 2 tygodni?**
  - Oferta jako typ kontaktu (nie osobna tabela) - OK?
  - Umowa opcjonalna lub tylko status - OK?
  - Newsletter manualny (bez Cron) - OK?
  - Zamówienia w notatkach - OK?

- [ ] **Czy zachowuje wszystkie wymagania z PDF?**
  - Osoba decyzyjna ✓
  - Ceny konkurencji ✓
  - 6 typów kontaktów telefonicznych ✓
  - Raporty dla Kierownika ✓

**Akcja jeśli problem:** Dostosuj uproszczenia w `02-process-minimal.puml`

---

#### 1.3. Model danych (04-data-model.puml)

- [ ] **Czy ERD zawiera wszystkie wymagane pola z PDF?**
  - `leads.contact_person` (osoba decyzyjna) ✓
  - `leads.lead_source` (Internet/Prasa/...) ✓
  - `activities.outcome` (6 typów) ✓
  - `visits.competitor_prices` (TEXT) ✓
  - `leads.total_revenue` (dla raportów) ✓

- [ ] **Czy walidacje są zgodne z PDF (strona 4)?**
  - Telefon: 9-15 cyfr ✓
  - Email: format xxx@xxx.xx ✓
  - Co najmniej 1 kanał: phone OR email ✓

- [ ] **Czy relacje są poprawne?**
  - users → leads (assigned_to)
  - leads → activities (1:N)
  - leads → visits (1:N)
  - leads → contracts (1:N, opcjonalnie)

**Akcja jeśli problem:** Popraw schemat w `04-data-model.puml`

---

## 📋 KROK 2: Weryfikacja modelu bazy danych

### ✅ Co zostało zrobione:

- [x] ERD w PlantUML (diagram 04)
- [x] Opis tabel w `docs/minimal-student/technical-specification-minimal.md` (sekcja "Krok 2")

### 🔍 Co sprawdzić jutro:

#### 2.1. Tabela users

- [ ] Czy zawiera pola: `role` (PH/MANAGER), `territory` (Poznań/Wrocław/Szczecin)?
- [ ] Czy `username` jest UNIQUE?

#### 2.2. Tabela leads

- [ ] **WAŻNE:** Czy ma wszystkie pola wymagane z PDF?
  ```sql
  contact_person VARCHAR(255)  -- Osoba decyzyjna!
  lead_source VARCHAR(100)     -- Źródło leada!
  total_revenue DECIMAL(10,2)  -- Dla raportów!
  ```
- [ ] Czy CONSTRAINT sprawdza `phone OR email NOT NULL`?

#### 2.3. Tabela activities

- [ ] Czy `outcome` ma 6 wartości?
  - NO_ANSWER
  - MEETING_SET
  - ORDER_TAKEN
  - INFO_SENT
  - OFFER_PRESENTED
  - POST_DELIVERY_CHECK

#### 2.4. Tabela visits

- [ ] Czy ma pole `competitor_prices TEXT`? (z PDF!)
- [ ] Czy `status` ma 4 wartości (PLANNED/DONE/CANCELLED/NO_SHOW)?

**Akcja jeśli problem:**

1. Popraw ERD w `04-data-model.puml`
2. Popraw opis w `technical-specification-minimal.md`
3. **PÓŹNIEJ:** Popraw Drizzle schema w `src/lib/server/db/schema.ts`

---

## 📋 KROK 3: Weryfikacja uzasadnienia technologii

### ✅ Co zostało zrobione:

- [x] Sekcja "Krok 3" w `docs/minimal-student/technical-specification-minimal.md`
- [x] Porównanie 4 stacków: Node.js+SvelteKit, Django, PHP+Laravel, Node.js+Express

### 🔍 Co sprawdzić jutro:

#### 3.1. Czy uzasadnienie jest przekonujące?

- [ ] **Node.js + SvelteKit** - wybrane
  - Plusy: TypeScript end-to-end, szybkie prototypowanie, stabilna technologia, jeden język, duża społeczność
  - Minusy: wymaga konfiguracji bundlera (Vite)
  - **Czy to przekona wykładowcę?**

#### 3.2. Czy porównanie jest rzetelne?

- [ ] Czy Django/PHP/Express.js mają fair comparison?
- [ ] Czy wspomniano o doświadczeniu studenta (Svelte nie pierwszy raz)?

#### 3.3. Czy pasuje do profilu studenta?

- [ ] Bazowa znajomość TypeScript ✓
- [ ] Doświadczenie z SvelteKit ✓
- [ ] 2 tygodnie na projekt ✓

**Akcja jeśli problem:** Popraw argumentację w sekcji "Krok 3"

---

## 📋 KROK 4: Weryfikacja strategii testowania

### ✅ Co zostało zrobione:

- [x] Sekcja "Krok 4" w `docs/minimal-student/technical-specification-minimal.md`
- [x] Strategia: głównie manual testing + 3-5 unit testów

### 🔍 Co sprawdzić jutro:

#### 4.1. Czy strategia jest realistyczna dla 2 tygodni?

- [ ] **Manual testing checklist** - OK dla studenta?
- [ ] **3-5 unit testów** - wystarczająco dla MVP?
  - Walidacja telefonu
  - Walidacja email
  - Constraint phone OR email
  - Przypisywanie leada wg miasta
  - Filtrowanie leadów per PH

#### 4.2. Czy pokrywa kluczowe funkcjonalności?

- [ ] Dodanie leada (walidacje z PDF)
- [ ] Rejestracja kontaktu telefonicznego (główny ekran!)
- [ ] Planowanie wizyty
- [ ] Raporty Kierownika
- [ ] Podział terytorialny (PH widzi tylko swoich)

**Akcja jeśli problem:** Rozbuduj sekcję testowania

---

## 📋 KROK 5: (OPCJONALNY - instrukcja nie wymaga)

Instrukcja nie wymaga tego kroku jako osobnego punktu. Przejdź do Kroku 6.

---

## 📋 KROK 6: Weryfikacja instrukcji obsługi

### ✅ Co zostało przygotowane:

- [x] Sekcja w `docs/minimal-student/requirements-minimal.md` (linie 244-272)
- [x] Diagram sekwencji dla głównego ekranu: `06-sequence-phone-contact.puml`
- [x] Opis formularza (pola, wyniki, przepływ)

### 🔍 Co sprawdzić jutro:

#### 6.1. Czy zgodne z instrukcją (strona 2, punkt 6)?

> "Instrukcję wykonać należy tylko dla **ekranu/ekranów wprowadzania danych podczas przeprowadzania rozmowy telefonicznej** przez przedstawiciela handlowego."

- [ ] **Czy instrukcja dotyczy TYLKO ekranu kontaktu telefonicznego?** ✓
- [ ] **Czy ma screenshots?** ❌ (TODO: zrobić po implementacji!)

#### 6.2. Czy instrukcja zawiera wszystkie elementy?

- [ ] **Kontekst:** PH dzwoni do klienta z listy leadów
- [ ] **Kroki:**
  1. Otworzenie listy leadów
  2. Kliknięcie "Dodaj kontakt"
  3. Wypełnienie formularza
  4. Zapis
  5. Obsługa wyniku MEETING_SET
- [ ] **Pola formularza:**
  - Data kontaktu (auto: dzisiaj)
  - Rozmówca
  - Wynik rozmowy (6 opcji)
  - Notatka
- [ ] **Screenshot:** [TODO]

#### 6.3. Czy jest zrozumiała dla użytkownika bez IT?

Z PDF (strona 4):

> "Nie posiada wykształcenia informatycznego"

- [ ] **Czy język jest prosty?** (bez żargonu IT)
- [ ] **Czy kroki są jednoznaczne?**
- [ ] **Czy są tooltips/podpowiedzi?**

**Akcja jeśli problem:**

1. Popraw sekcję w `requirements-minimal.md`
2. **PO IMPLEMENTACJI:** Zrób screenshots i dodaj do instrukcji

---

## 🎯 KLUCZOWE PYTANIA DO PRZEMYŚLENIA

### 1. Czy wszystkie wymagania z PDF są uwzględnione?

**Z Załącznika nr 1 (strona 3-4):**

- [x] Osoba decyzyjna (lead.contact_person)
- [x] Źródło leada (lead.lead_source: Internet/Prasa/Książki/Spisy/Polecenie/Inne)
- [x] Kontakty telefoniczne (activities.outcome: 6 typów)
- [x] Harmonogram wizyt (visits.scheduled_at)
- [x] Ceny konkurencji (visits.competitor_prices TEXT)
- [x] Oferta kilka dni po wizycie (OFFER_PRESENTED)
- [x] Umowa (contracts lub zmiana statusu)
- [x] Telefon kontrolny po dostawie (POST_DELIVERY_CHECK)
- [x] Newsletter miesięczny (manualny)

**Z instrukcji (strona 4):**

- [x] Raporty Kierownika:
  - Liczba wizyt per PH
  - Liczba telefonów per PH
  - Liczba umów per PH
  - Zestawienie planowanych wizyt
  - [opcjonalnie] Obroty per klient

**Z instrukcji (strona 4, punkt 5):**

- [x] Walidacja telefonu (9-15 cyfr)
- [x] Walidacja email (format)
- [x] Co najmniej 1 kanał (phone OR email)

---

### 2. Czy implementacja jest realistyczna dla 2 tygodni?

**Tydzień 1:**

- Setup środowiska (Docker, Node.js, VS Code) ✅ GOTOWE
- CRUD leadów (formularz + lista + walidacje) - ~3 dni
- Kontakty telefoniczne (główny ekran!) - ~2 dni

**Tydzień 2:**

- Wizyty (harmonogram + wyniki) - ~2 dni
- Raporty Kierownika - ~2 dni
- Uprawnienia (PH vs Kierownik) - ~1 dzień
- Testy + debugging - ~2 dni

**RAZEM:** ~12 dni roboczych = **realistyczne dla 2 tygodni**

---

### 3. Czy coś ważnego zostało pominięte?

**Sprawdź:**

- [ ] Czy wszystkie 7 kroków z PDF są w diagramach?
- [ ] Czy model danych obsługuje wszystkie funkcje?
- [ ] Czy uprawnienia są poprawnie zaprojektowane?
- [ ] Czy instrukcja obsługi jest kompletna?

---

## 📂 GDZIE SZUKAĆ ODPOWIEDZI

### Dokumenty źródłowe:

1. **PDF zadania:** `lab-materials/Laboratorium 6 Budowa systemu CRM.pdf`
   - Strona 2: Instrukcje (6 kroków)
   - Strona 3-4: Załącznik nr 1 (proces firmy X)

2. **Wymagania minimalne:** `docs/minimal-student/requirements-minimal.md`
   - Sekcja 3: Pełny proces (7 kroków)
   - Sekcja 4: Raporty dla Szefa
   - Sekcja 5: Model danych
   - Sekcja 8: Instrukcja obsługi

3. **Specyfikacja techniczna:** `docs/minimal-student/technical-specification-minimal.md`
   - Krok 1: Diagramy (opis każdego)
   - Krok 2: Model bazy (szczegóły tabel)
   - Krok 3: Uzasadnienie technologii
   - Krok 4: Strategia testowania

4. **Diagramy:** `diagrams/`
   - `README.md` - opis wszystkich diagramów
   - Pliki `.puml` - źródła do edycji
   - Pliki `.png` - wygenerowane obrazy

### Kontekst projektu:

- `.claude/project-context.md` - poziom studenta, środowisko, decyzje

---

## ✅ AKCJE PO WERYFIKACJI

### Jeśli wszystko OK:

1. [ ] Zaznacz wszystkie checkboxy powyżej
2. [ ] Przejdź do implementacji (lub poczekaj na decyzję studenta)
3. [ ] Ten plik możesz przenieść do `docs/` jako `WERYFIKACJA-ZAKOŃCZONA.md`

### Jeśli znalazłeś problemy:

1. [ ] Wypisz je w sekcji poniżej
2. [ ] Popraw pliki (diagramy/dokumentacja)
3. [ ] Regeneruj PNG jeśli edytowałeś `.puml`
4. [ ] Przejdź przez checklistę ponownie

---

## 📝 PROBLEMY ZNALEZIONE (wypełnij jutro)

### Problem 1:

**Co:**
**Gdzie:** (plik + linia)
**Jak poprawić:**
**Status:** [ ] Do zrobienia / [ ] W trakcie / [ ] Naprawione

### Problem 2:

**Co:**
**Gdzie:**
**Jak poprawić:**
**Status:**

### Problem 3:

**Co:**
**Gdzie:**
**Jak poprawić:**
**Status:**

---

## 🎉 PODSUMOWANIE (wypełnij jutro po weryfikacji)

**Data weryfikacji:** ******\_\_\_******
**Czas weryfikacji:** ******\_\_\_******

**Status:**

- [ ] ✅ Wszystko zgodne z instrukcją - można przejść do implementacji
- [ ] ⚠️ Drobne poprawki do zrobienia (lista powyżej)
- [ ] ❌ Duże zmiany potrzebne (lista powyżej)

**Następny krok:**

- [ ] Implementacja struktury projektu SvelteKit
- [ ] Schemat bazy danych (Drizzle)
- [ ] Inne: ******\_\_\_******

**Notatki:**
_Miejsce na Twoje przemyślenia po prześpieniu się z pomysłami..._

---

**Powodzenia! 🚀**

_"Najlepsze pomysły przychodzą po prześpieniu się z problemem."_

---

**PS:** Gdy skończysz weryfikację, daj znać Claude'owi co znalazłaś i będę mógł pomóc w poprawkach! 😊
