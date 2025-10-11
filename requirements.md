# Wymagania procesu „od leada do umowy" (firma X)

## 1.1. Role i uprawnienia (aktory)

**Przedstawiciel handlowy (PH)**: tworzy/edytuje leady i klientów, rejestruje kontakty, planuje/realizuje wizyty, tworzy oferty, inicjuje umowy i zamówienia.

**Kierownik/Szef**: ma wgląd do wszystkich danych i KPI; zatwierdza wyjątki (np. rabaty > X%).

**System (automaty)**: przypomnienia, SLA follow-up, walidacje, aktualizacja statusów, generowanie numerów, logowanie zmian.

## 1.2. Słownik statusów (stany encji)

- **Lead.status**: `NEW` → `QUALIFIED` / `DISQUALIFIED`
- **Kontakt/aktywność.outcome**: `NO_ANSWER`, `CALLBACK`, `MEETING_SET`, `ORDER_TAKEN`, `INFO_SENT`
- **Wizyta.status**: `PLANNED` → `DONE` / `CANCELLED` / `NO_SHOW`
- **Oferta.status**: `DRAFT` → `SENT` → `NEGOTIATION` → `ACCEPTED` / `REJECTED` / `EXPIRED`
- **Umowa.status**: `DRAFT` → `SIGNED` → `ACTIVE` / `TERMINATED`
- **Klient (customer).status**: `prospect` / `active` / `inactive`

## 1.3. Krok A – Pozyskanie i rejestracja leada

**Cel**: utworzenie minimalnego rekordu leada do dalszej pracy.

**Aktor**: PH

**Wyzwalacz**: znalezienie potencjalnego sklepu (internet/prasa/bazy).

### Wymagane pola (MVP):
- nazwa firmy*
- miasto*
- ulica + nr
- telefon lub email (min. 1 kanał kontaktu)*
- osoba decyzyjna (imię, nazwisko) lub kontakt ogólny
- źródło leada* (Internet/Prasa/Polecenie/Inne)
- NIP (jeśli dostępny)
- kategoria (np. sklep osiedlowy/dyskont)
- notatka wstępna

### Walidacje:
- Co najmniej jeden kanał: telefon lub email
- Jeśli podano NIP → weryfikacja długości (10) i algorytm wag (na froncie), unikalność (brak duplikatu klienta)
- Telefon: 9–15 znaków, cyfry/„+"
- Email: format

### Akcje systemu:
- Utworzenie leada z `status=NEW`, przypisanie do PH (wg miasta domyślnie; możliwość ręcznej zmiany)
- Autonumeracja `LEAD-YYYY-XXXXX`
- Utworzenie zadania follow-up „Wykonaj pierwszy telefon" z terminem T+1 dzień

### KPI / Logi / Kryteria akceptacji:
- Czas od rejestracji do pierwszego kontaktu (SLA: 24h)
- Log: kto utworzył, kiedy, jakie pola
- Lead widoczny w liście „Do kontaktu" dla PH

## 1.4. Krok B – Kwalifikacja leada

**Cel**: ocena, czy warto kontynuować.

**Aktor**: PH (ew. Szef przy dyskwalifikacji „strategicznej")

**Wyzwalacz**: wykonanie pierwszego kontaktu lub research.

### Kryteria kwalifikacji (konfigurowalne, domyślnie informacyjne):
- Zasięg terytorialny (miasto docelowe: Poznań/Wrocław/Szczecin)
- Profil: sklep spożywczy, regularne zamówienia
- Dostępność osoby decyzyjnej i zgoda na rozmowę/ofertę

### Zmiany statusu:
- `NEW` → `QUALIFIED` (uzupełniono min. NIP lub osobę decyzyjną i kanał kontaktu)
- `NEW`/`QUALIFIED` → `DISQUALIFIED` (powody: poza zasięgiem/branża/odmowa/duplikat)

### Akcje systemu:
- Przy `QUALIFIED`: automatyczne zadanie „Wykonaj telefon sprzedażowy" w 48h
- Przy `DISQUALIFIED`: wymagany powód (słownik), archiwizacja leada, blokada dalszych zadań

**KPI**: % kwalifikacji, czas kwalifikacji, najczęstsze powody dyskwalifikacji.

## 1.5. Krok C – Kontakt telefoniczny

**Cel**: umówienie wizyty lub zebranie zamówienia/zgód.

**Aktor**: PH

**Dane (rejestr aktywności)**: data/godz., numer, rozmówca, wynik (`NO_ANSWER`/`CALLBACK`/`MEETING_SET`/`ORDER_TAKEN`/`INFO_SENT`), notatka.

### Reguły biznesowe:
- `NO_ANSWER` → automatyczny callback T+1 dzień (max 3 próby; potem znacznik „trudny kontakt")
- `MEETING_SET` → tworzy Wizytę (patrz Krok D)
- `ORDER_TAKEN` → tworzy Zamówienie wstępne (opcjonalnie bez umowy, jeśli proces tak przewiduje)
- `INFO_SENT` → dołączenie załącznika/linku; follow-up T+3 dni

### Walidacje:
- Wymagany wynik i notatka przy każdym zakończeniu rozmowy
- Maskowanie telefonu na UI, ale zapis pełny w bazie (RODO – dostęp wg ról)

**KPI**: #telefonów/PH/miesiąc, konwersja call→wizyta, średnia liczba prób do kontaktu.

## 1.6. Krok D – Planowanie i realizacja wizyty

**Cel**: spotkanie w sklepie, zbadanie potrzeb i cen konkurencji.

**Aktor**: PH

### Planowanie (wymagane pola):
- customer/lead
- sales_rep
- scheduled_at (data+godz.)
- adres
- cel spotkania
- agenda

System proponuje sloty wg kalendarza PH, grupuje po mieście (optymalizacja trasy).

### Realizacja (po wizycie):
- **status**: `DONE`/`CANCELLED`/`NO_SHOW`
- **wyniki**: ustalenia, zapotrzebowanie, ceny konkurencji (JSON: `{produkt, cena, źródło}`)
- Opcjonalnie: zdjęcia półek/ekspozycji jako załączniki

### Reguły:
- `NO_SHOW` → automatycznie proponuj nowy termin (T+7 dni)
- `DONE` i brak oferty w 48h → przypomnienie „Wyślij ofertę"

**KPI**: #wizyt/PH/miesiąc, no-show rate, średni czas od wizyty do oferty.

## 1.7. Krok E – Oferta i negocjacje

**Cel**: złożenie propozycji handlowej i domknięcie.

**Aktor**: PH (Szef dla wyjątków cenowych)

### Dane oferty:
- **Pozycje**: produkt, ilość/okres, cena netto, rabat %, warunki dostawy/płatności, ważność oferty do data
- **status**: `DRAFT` → `SENT` → `NEGOTIATION` → `ACCEPTED`/`REJECTED`/`EXPIRED`

### Reguły:
- Rabaty > X% wymagają akceptu Szefa
- `SENT` → automatyczny follow-up: T+3 dni
- `EXPIRED` → automatyczne zamknięcie po dacie ważności

**KPI**: konwersja oferta→umowa, średni rabat, średni czas negocjacji.

## 1.8. Krok F – Umowa i pierwsza dostawa

**Cel**: formalizacja współpracy i start.

**Aktor**: PH (inicjuje), Szef (zatwierdza), System (checklisty)

### Dane:
- **warunki**: okres, produkty/zakres, ceny/indeksy, płatności, SLA dostaw, kontakt serwisowy
- **status**: `DRAFT` → `SIGNED` → `ACTIVE`/`TERMINATED`

### Reguły:
- Po `SIGNED` → zadanie „Telefon kontrolny po 1. dostawie" (T+1 dzień)
- Rekord klienta przechodzi na `active`

**KPI**: #umów/miesiąc, wartość, czas od oferty do podpisu.

## 1.9. Krok G – Posprzedaż i utrzymanie

**Cel**: upewnienie się, że wszystko działa; cross/upsell.

**Aktor**: PH, System

### Automaty:
- Call T+1 dzień po pierwszej dostawie (satysfakcja, braki)
- Miesięczny newsletter (lista mailingowa klientów `active`)

**KPI**: retencja, średni obrót/m-c na klienta, reakcje na newsletter.

## 1.10. Wymagania danych (przekrojowo – must have)

- **Klient/prospect**: nazwa*, miasto*, adres, NIP (unikalny), kanał kontaktu*, kategoria
- **Osoba kontaktowa**: imię, nazwisko, rola, telefon/email*, znacznik decyzyjny (bool)
- **Aktywność** (CALL/EMAIL/NOTE/MEETING): data/godz., wynik, notatka*
- **Wizyta**: termin*, adres*, cel*, wynik/status*, notatka; ceny konkurencji (JSON)
- **Oferta**: pozycje*, cena*, rabat (0–X%), ważność*, status*, załącznik (PDF)
- **Umowa**: warunki*, daty*, status*

_(\* = wymagane dla zapisu)_

## 1.11. Walidacje i reguły horyzontalne

- **Antyduplikaty**: unikalność NIP; fuzzy match nazwy+miasto (ostrzeżenie)
- **Kompletność**: bloker zapisu, jeśli brakuje pól wymaganych dla danego etapu
- **SLA**: automatyczne zadania przypominające (24h pierwszy kontakt, 48h oferta po wizycie, 3 dni follow-up po wysyłce)
- **Uprawnienia**: PH widzi swoich klientów/leadów; Szef widzi wszystko
- **RODO**: pola kontaktowe maskowane na liście; pełny wgląd w szczegółach wg roli; log zdarzeń (kto/co/kiedy)

## 1.12. Powiadomienia i zadania (automaty)

**Email/in-app**: nowe przypisanie leada, przypomnienia SLA, akceptacje rabatów, oferta wygasa za 24h, wizyta jutro 9:00, no-show – propozycja nowego terminu.

**Generator zadań**: „Oddzwoń", „Wyślij ofertę", „Follow-up", „Telefon po dostawie".

## 1.13. KPI i raporty dla Szefa

- Aktywności PH / m-c: #telefonów, #wizyt, #ofert, #umów
- Lejek: konwersje: Lead→Qualified→Meeting→Offer→Contract
- Wartość zamówień / m-c / klient/miasto
- Plan wizyt (nadchodzący tydzień) z filtrem po mieście/PH
- Powody dyskwalifikacji (Top N)

## 1.14. Kryteria akceptacji procesu (DoR/DoD)

- Każdy etap wymusza wypełnienie pól minimalnych i zapisuje wynik + notatkę
- Zmiana statusu automatycznie generuje następne zadanie zgodnie z SLA
- W dowolnym momencie można wygenerować oś czasu kontaktów (chronologia)
- Raport „Lejek" oraz „KPI PH / m-c" są dostępne i poprawnie liczone
