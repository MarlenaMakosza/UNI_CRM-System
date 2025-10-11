# Wymagania minimalne - System CRM dla Firmy X (Projekt studencki)

**Bazuje na:** Załącznik nr 1 z instrukcji Laboratorium 6 (opis procesu firmy X)

## 1. Kontekst biznesowy

**Firma X:**
- Sprzedaż hurtowa warzyw/owoców
- 3 przedstawicieli handlowych (PH)
- Obecnie: 25 małych sklepów + 3 sieci dyskontowe
- Cel: pozyskać ~200 sklepów w Poznaniu, Wrocławiu, Szczecinie

## 2. Role użytkowników

### 2.1. Przedstawiciel handlowy (PH)
- Pozyskuje leady (Internet/prasa/książki branżowe/spisy firm)
- Wprowadza dane firm do systemu
- Rejestruje kontakty telefoniczne
- Planuje wizyty (harmonogram dzienny)
- Wprowadza wyniki wizyt
- Widzi tylko swoich klientów (podział terytorialny)

### 2.2. Szef firmy (Kierownik)
- Widzi wszystkich klientów i wszystkich PH
- Analizuje pracę PH
- Generuje raporty i zestawienia
- Nie posiada wykształcenia informatycznego (interfejs musi być prosty!)

## 3. Pełny proces (z PDF - uproszczony dla MVP)

### 3.1. KROK 1: Pozyskanie leada
**Źródła:** Internet, prasa, książki branżowe, spisy firm

**Dane wymagane:**
- Nazwa firmy*
- Miasto* (Poznań/Wrocław/Szczecin)
- Adres (ulica + nr)
- Telefon LUB email* (min. 1 kanał kontaktu)
- **Osoba decyzyjna** (imię + nazwisko) - *"kim jest osoba decyzyjna, która podejmuje wiążące decyzje"*
- Źródło leada* (dropdown: Internet/Prasa/Książki branżowe/Spisy firm/Polecenie/Inne)

**Walidacje:**
- Co najmniej 1 kanał: telefon lub email
- Telefon: 9-15 cyfr (format: mogą być spacje/myślniki)
- Email: format podstawowy

**Akcje systemu:**
- Utworzenie leada ze statusem `NEW`
- Przypisanie do PH (domyślnie wg miasta, można zmienić ręcznie)

### 3.2. KROK 2: Kontakt telefoniczny

**Cel:** Umówić spotkanie lub zebrać zamówienie

**Dane rejestrowane:**
- Data kontaktu*
- Rozmówca (z kim rozmawiał)
- Wynik rozmowy*:
  - `NO_ANSWER` - nie odbiera
  - `MEETING_SET` - umówiono wizytę
  - `ORDER_TAKEN` - zamówienie w trakcie rozmowy (uproszczenie: tylko notatka)
  - `INFO_SENT` - wysłano informacje
- Notatka* (co ustalono)

**Akcje:**
- Jeśli `MEETING_SET` → system przekierowuje do dodania wizyty
- Jeśli `ORDER_TAKEN` → PH zapisuje w notatce (bez osobnej tabeli zamówień - za dużo)

### 3.3. KROK 3: Wizyta w sklepie

**Harmonogram:** "Na każdy dzień sporządzany był harmonogram z adresami i godzinami"

**Przed wizytą:**
- Data i godzina*
- Adres* (automatycznie z leada, można zmienić)
- Status: `PLANNED`

**Po wizycie:**
- Status: `DONE` / `CANCELLED`
- Notatka* - efekty rozmowy
- **Ceny konkurencji** (opcjonalnie - pole tekstowe, nie JSON):
  - *"starał się zanotować ceny produktów sprzedawanych w tym sklepie"*
  - Format: np. "Jabłka: 5 zł/kg (Sklep X), Pomarańcze: 7 zł/kg (Hurtownia Y)"

### 3.4. KROK 4: Oferta (kilka dni po wizycie)

*"Kilka dni po wizycie... dzwonił jeszcze raz i próbował przedstawić korzystną ofertę"*

**Uproszczenie dla MVP:**
- Rejestrujemy jako kolejny kontakt telefoniczny (`OFFER_PRESENTED`)
- W notatce: jaką ofertę przedstawił
- Wynik: `ACCEPTED` / `REJECTED` / `NEGOTIATION`

**Alternatywa (jeśli czas pozwala):**
- Osobna tabela `offers` z polami:
  - lead_id, data_oferty, produkty (TEXT), cena, status

### 3.5. KROK 5: Umowa (jeśli oferta zaakceptowana)

*"Jeżeli umowa na dostawę określonych produktów została podpisana..."*

**Uproszczenie dla MVP:**
- Zmiana statusu leada na `ACTIVE` (był prospect, jest klient)
- Opcjonalnie: tabela `contracts` z polami:
  - lead_id, data_podpisania, produkty (TEXT), warunki (TEXT)

### 3.6. KROK 6: Telefon kontrolny po dostawie

*"dzwonił w dzień po pierwszej dostawie produktów, żeby upewnić się że... jest wszystko ok"*

**Uproszczenie:**
- Kolejny kontakt telefoniczny z typem `POST_DELIVERY_CHECK`
- Notatka: czy klient jest zadowolony, czy są braki

### 3.7. KROK 7: Newsletter miesięczny

*"raz w miesiącu wysyłany był do klientów newsletter z informacjami o najnowszych promocjach"*

**Uproszczenie dla MVP:**
- **Opcjonalnie** (jeśli czas): przycisk "Wyślij newsletter" → pobiera emaile z ACTIVE klientów
- Bez automatyzacji Cron (za trudne)
- Bez faktycznego wysyłania (tylko lista emaili do skopiowania)

## 4. Raporty dla Szefa

*"Interesują go szczególnie zestawienia dotyczące..."*

### 4.1. Podstawowe statystyki (must-have):
1. **Liczba odbytych wizyt** (per PH, per okres)
2. **Liczba zawartych umów** (per PH, per okres)
3. **Liczba wykonanych telefonów** (per PH, per okres)
4. **Zestawienie planowanych wizyt** (dla każdego PH)

### 4.2. Zaawansowane (opcjonalnie):
5. **Kwota zawartych umów** (jeśli mamy umowy z kwotą)
6. **Dotychczasowe obroty z kontrahentem** (per klient, per miesiąc)
   - Wymaga: tabela zamówień/faktur = za dużo dla MVP
   - **Uproszczenie:** Pole `total_revenue` w tabeli `leads`

### 4.3. Interfejs raportu:
- Tabela z filtrami:
  - Okres (od-do)
  - PH (dropdown)
  - Miasto
- Wyświetla: imię PH, liczba wizyt, liczba telefonów, liczba umów

## 5. Model danych (uproszczony)

### 5.1. Tabela: users
```
- id
- username
- password_hash
- role (PH / MANAGER)
- first_name
- last_name
- territory (Poznań/Wrocław/Szczecin)
```

### 5.2. Tabela: leads
```
- id
- company_name*
- city*
- address (ulica + nr)
- phone
- email
- contact_person (osoba decyzyjna - imię+nazwisko)
- lead_source* (Internet/Prasa/Książki branżowe/Spisy firm/Polecenie/Inne)
- status (NEW/QUALIFIED/ACTIVE/INACTIVE)
- assigned_to → users.id
- total_revenue (opcjonalnie - suma obrotów)
- created_at
```

### 5.3. Tabela: activities (kontakty telefoniczne)
```
- id
- lead_id → leads.id
- user_id → users.id
- activity_date*
- contact_person_name (z kim rozmawiał)
- outcome* (NO_ANSWER/MEETING_SET/ORDER_TAKEN/INFO_SENT/OFFER_PRESENTED/POST_DELIVERY_CHECK)
- notes* (szczegóły rozmowy)
- created_at
```

### 5.4. Tabela: visits
```
- id
- lead_id → leads.id
- user_id → users.id
- scheduled_at* (data + godzina)
- address*
- status* (PLANNED/DONE/CANCELLED)
- visit_notes (efekty rozmowy)
- competitor_prices (TEXT - ceny konkurencji)
- created_at
```

### 5.5. Tabela: contracts (opcjonalnie)
```
- id
- lead_id → leads.id
- user_id → users.id
- signed_at
- products (TEXT - lista produktów)
- terms (TEXT - warunki)
- contract_value (kwota)
- created_at
```

## 6. Walidacje (z instrukcji)

Z punktu 5 instrukcji:
> "Zwróć uwagę na wprowadzane dane – czy nie jest potrzebna ich weryfikacja"

1. **Telefon:**
   - 9-15 znaków
   - Tylko cyfry (+ opcjonalnie spacje/myślniki)

2. **Email:**
   - Format: xxx@xxx.xx

3. **Co najmniej 1 kanał:**
   - Telefon LUB email musi być wypełniony

4. **Pola opcjonalne:**
   - *"które z pól mogą zostać uzupełnione później"*
   - Adres, osoba decyzyjna → mogą być puste przy tworzeniu

## 7. Ekrany (minimum 6-8)

1. **Login**
2. **Dashboard PH** - lista moich leadów + dzisiejsze wizyty
3. **Dashboard Kierownik** - statystyki
4. **Leady - Lista** (filtrowanie: status, miasto, źródło)
5. **Lead - Dodaj/Edytuj**
6. **Kontakt telefoniczny - Dodaj** (GŁÓWNY EKRAN DO INSTRUKCJI!)
7. **Wizyta - Lista/Harmonogram**
8. **Wizyta - Dodaj/Edytuj**
9. **Raporty - Kierownik**

## 8. Instrukcja obsługi (do sprawozdania)

Z punktu 6 instrukcji:
> "Instrukcję wykonać należy tylko dla ekranu/ekranów wprowadzania danych podczas przeprowadzania rozmowy telefonicznej przez przedstawiciela handlowego."

### Ekran: Rejestracja kontaktu telefonicznego

**Kontekst:** PH dzwoni do klienta z listy leadów

**Kroki:**
1. PH otwiera listę leadów (Dashboard)
2. Przy wybranym leadzie klika "Zadzwoń" lub "Dodaj kontakt"
3. System otwiera formularz z polami:
   - **Data kontaktu** (automatycznie: dzisiaj)
   - **Rozmówca** (z kim rozmawiał - pole tekstowe)
   - **Wynik rozmowy** (dropdown):
     - NO_ANSWER
     - MEETING_SET
     - ORDER_TAKEN
     - INFO_SENT
     - OFFER_PRESENTED
   - **Notatka** (duże pole tekstowe - co ustalono)
4. PH wypełnia i klika "Zapisz"
5. Jeśli wynik = `MEETING_SET` → system pyta: "Czy chcesz od razu zaplanować wizytę?"
   - TAK → przekierowanie do formularza wizyty (data/adres wstępnie wypełnione)
   - NIE → powrót do listy leadów

**Screenshot:** [TODO - zrobić po implementacji]

## 9. Uproszczenia dla MVP (żeby zdążyć)

### ✅ ZOSTAJE (must-have z PDF):
1. ✅ Leady (wszystkie pola z PDF)
2. ✅ Osoba decyzyjna
3. ✅ Kontakty telefoniczne (wszystkie typy z PDF)
4. ✅ Wizyty z harmonogramem
5. ✅ Ceny konkurencji (pole tekstowe)
6. ✅ Raporty dla Szefa (podstawowe)
7. ✅ Podział terytorialny PH

### 🟡 UPROSZCZENIA (zamiast pełnych modułów):
1. 🟡 **Oferty** → jako kontakt telefoniczny `OFFER_PRESENTED` (bez osobnej tabeli)
2. 🟡 **Umowy** → zmiana statusu na `ACTIVE` (opcjonalnie prosta tabela)
3. 🟡 **Zamówienia** → notatka w kontakcie `ORDER_TAKEN` (bez tabeli)
4. 🟡 **Newsletter** → lista emaili do skopiowania (bez wysyłki)
5. 🟡 **Obroty** → pole `total_revenue` w leads (ręczne wpisywanie)

### ❌ CAŁKOWICIE WYŁĄCZONE (zbyt zaawansowane):
1. ❌ Automatyczne zadania/przypomnienia (wymaga Cron)
2. ❌ Generowanie PDF ofert
3. ❌ Faktyczne wysyłanie emaili (newsletter)
4. ❌ NIP z walidacją algorytmem wag
5. ❌ Audit log szczegółowy

## 10. Kryteria akceptacji (DoD)

✅ PH może dodać leada ze wszystkimi danymi z PDF
✅ PH może zarejestrować kontakt telefoniczny (wszystkie typy)
✅ PH może zaplanować wizytę (z harmonogramem)
✅ PH może wprowadzić wyniki po wizycie (+ ceny konkurencji)
✅ PH widzi tylko swoich klientów (podział terytorialny działa)
✅ Kierownik widzi raporty: liczba wizyt, telefonów, umów per PH
✅ Instrukcja obsługi z screenshots (ekran rejestracji kontaktu)
✅ Aplikacja działa lokalnie lub jest wdrożona

## 11. Technologie (wybrane)

**Stack:** Deno + SvelteKit + PostgreSQL + Drizzle ORM

**Uzasadnienie:**
- TypeScript (jeden język front+back)
- SvelteKit (szybkie prototypowanie)
- PostgreSQL (wystarczająco proste + relacyjne)
- Darmowy hosting (Deno Deploy + Neon.tech)

## 12. Czas realizacji

**Tydzień 1:** Setup + CRUD leadów + kontakty
**Tydzień 2:** Wizyty + raporty + uprawnienia
**Tydzień 3:** Testy + instrukcja + sprawozdanie

---

**Wersja:** 2.0 (PEŁNY zakres z PDF, uproszczone implementacje)
**Cel:** Projekt studencki - Laboratorium 6
**Źródło:** Załącznik nr 1 (strona 3-4 PDF)
