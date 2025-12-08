## 🎯 Co system ma umieć z opisu

Z treści zadania wynika, że system musi pozwalać na:

* dodawanie **potencjalnych klientów** (prospektów) i ich danych,
* trzymanie info o **osobie decyzyjnej** i danych kontaktowych,
* planowanie **telefonów** i **wizyt** (harmonogram na dni),
* zapisywanie **wyników rozmów/spotkań**, cen konkurencji, notatek,
* rejestrowanie **umów** i ich wartości,
* wykonywanie **follow-up** po kilku dniach,
* kontrolę pierwszej dostawy („czy wszystko ok, czy coś jeszcze potrzeba”),
* wysyłkę **newslettera** (info o promocjach),
* raporty dla szefa:

  * liczba wykonanych wizyt,
  * liczba zawartych umów,
  * suma wartości umów,
  * liczba wykonanych telefonów,
  * lista zaplanowanych wizyt,
  * obroty z klientem w podziale na miesiące.

Na tej podstawie układamy API.

---

## 🧩 1. Endpointy „techniczne”

**MVP:**

* **GET `/health`** – czy API żyje (masz już).
* **GET `/health/db`** – prosty test połączenia z bazą (np. `SELECT 1`).

---

## 🧩 2. Klienci (potencjalni i aktywni)

Oparte o tabelę `klient` + `adres` + `status_klienta`.

**Minimalne:**

* **GET `/api/clients`**
  Lista klientów z filtrowaniem:

  * `?status=PROSPEKT|AKTYWNY|NIEAKTYWNY`
  * `?region_id=...`
  * `?q=` (szukanie po nazwie / NIP / miejscowości)

* **GET `/api/clients/:id`**
  Szczegóły jednego klienta (dane firmy, osoba decyzyjna, adres, status).

* **POST `/api/clients`**
  Dodanie nowego prospektu:

  * nazwa firmy
  * osoba decyzyjna (imię, nazwisko, stanowisko)
  * email, telefon
  * adres (miasto, ulica, kod)
  * status_klienta (np. `PROSPEKT`)

* **PATCH `/api/clients/:id`**
  Zmiana danych (np. zmiana statusu z PROSPEKT → AKTYWNY po podpisaniu umowy).

**Przydatne później:**

* **GET `/api/clients/:id/events`** – historia kontaktów z tym klientem.
* **GET `/api/clients/:id/contracts`** – lista umów z klientem.

---

## 🧩 3. Przedstawiciele handlowi i regiony

Na podstawie tabel `przedstawiciel_handlowy` i `region`.

**MVP:**

* **GET `/api/sales-reps`** – lista przedstawicieli (dla wyboru w UI).
* **GET `/api/regions`** – lista regionów (Poznań, Szczecin, Wrocław).

(Reszta – np. dodawanie przedstawicieli – może być na stałe zseedowana, niekoniecznie przez UI.)

---

## 🧩 4. Zdarzenia kontaktu (telefony, wizyty, follow-up)

To jest serce procesu – tabela `zdarzenie` z typami `typ_zdarzenia`.

**Typy zdarzenia** (w tabeli `typ_zdarzenia`):

* `telefon_pierwszy_kontakt`
* `telefon_follow_up`
* `telefon_po_dostawie`
* `wizyta`
* `newsletter`

**MVP endpointy:**

* **GET `/api/events`**
  Parametry:

  * `?rep_id=...` – przedstawiciel,
  * `?date_from=...&date_to=...`,
  * `?status=zaplanowane|zrealizowane|odwołane`,
  * `?type=telefon|wizyta|newsletter`.

* **GET `/api/events/:id`** – szczegóły jednego zdarzenia.

* **POST `/api/events`** – zaplanowanie kontaktu:

  * `klient_id`,
  * `przedstawiciel_id`,
  * `typ_id` (telefon, wizyta, newsletter),
  * `data_planowana`,
  * wstępne `opis` (np. „pierwszy kontakt”).

* **PATCH `/api/events/:id`**
  Aktualizacja po wykonaniu:

  * ustawienie `status` na `zrealizowane` / `odwołane`,
  * `data_realizacji`,
  * `notatki` (wynik rozmowy, info o konkurencji, ceny).

> Tym jednym modułem ogarniasz: telefon, wizytę, follow-up, telefon po dostawie, newsletter – wszystko to tylko różne `typ_zdarzenia` + status + daty.

---

## 🧩 5. Umowy i obroty

Tabela `umowa` (związana z `klient`, `przedstawiciel_handlowy`, `produkt`, `typ_umowy`).

**MVP:**

* **GET `/api/contracts`**
  Filtry:

  * `?client_id=...`,
  * `?rep_id=...`,
  * `?date_from=...&date_to=...`.

* **GET `/api/contracts/:id`** – szczegóły umowy.

* **POST `/api/contracts`** – rejestracja nowej umowy:

  * `klient_id`,
  * `przedstawiciel_id`,
  * `produkt_id`,
  * `typ_id` (`ramowa`, `jednorazowa`),
  * `status` (np. `aktywna`),
  * `data_od`, opcjonalnie `data_do`,
  * `wartosc_umowy`.

(Reszta typu update/close możesz dodać później.)

---

## 🧩 6. Proste raporty dla szefa

Tu nie ma sensu robić za dużego „BI” – wystarczą 2–3 endpointy pod SQL-owe zestawienia.

**1) aktywność przedstawiciela**

* **GET `/api/reports/rep-activity`**
  Parametry:

  * `rep_id`
  * `from`, `to` (zakres dat)

  Zwraca:

  * liczba zrealizowanych wizyt (`zdarzenie` typ `wizyta`),
  * liczba wykonanych telefonów (`zdarzenie` typ `telefon_*`),
  * liczba zawartych umów (`umowa`),
  * suma `wartosc_umowy`,
  * liczba **zaplanowanych** wizyt w przyszłości (`status = 'zaplanowane'`).

**2) obroty z klientem w miesiącach**

* **GET `/api/reports/client-turnover`**
  Parametry:

  * `client_id`,
  * `from`, `to`.

  Zwraca listę:

  * `miesiac` (np. 2025-01),
  * `suma_obrotu` (sum `umowa.wartosc_umowy`).

**3) plan dnia przedstawiciela**

* **GET `/api/reports/rep-agenda`**
  Parametry:

  * `rep_id`,
  * `day` (konkretna data).

  Zwraca listę **zaplanowanych** zdarzeń (`zdarzenie` z `data_planowana` danego dnia + `status='zaplanowane'`), czyli to, co w opisie jest „harmonogram na każdy dzień – adresy firm + godziny”.

---

## 🧩 7. Minimalne „required” vs „później”

Żeby **mieć sensowne MVP pod zaliczenie**, wystarczy, że backend będzie miał:

**MVP API (do zrobienia najpierw):**

1. `GET /health`
2. `GET /api/clients`, `GET /api/clients/:id`, `POST /api/clients`
3. `GET /api/events`, `POST /api/events`, `PATCH /api/events/:id`
4. `GET /api/contracts`, `POST /api/contracts`
5. `GET /api/reports/rep-activity`
6. `GET /api/reports/rep-agenda`

Reszta (newsletter, rozbudowane raporty, filtrowanie, update’y) może być opisane jako **„future work”** w dokumentacji.

---

Jeśli chcesz, następnym krokiem mogę:

* rozpisać **konkretny JSON request/response** dla jednego z tych endpointów (np. `POST /api/events` albo `GET /api/reports/rep-activity`),
* albo wybrać **3 kluczowe endpointy dla frontendu** i zaprojektować je „ładnie” pod UI (np. dashboard przedstawiciela).
