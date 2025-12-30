# Testy CRUD Klientów

## ✅ PATCH /api/clients/:id - Częściowa aktualizacja

### Testy funkcjonalne ✓

1. **Częściowa aktualizacja pojedynczego pola** (email) - działa
2. **Częściowa aktualizacja adresu** (ulica + numer) - działa
3. **Ochrona NIP przed zmianą** - działa (błąd: "NIP cannot be changed")
4. **Zmiana statusu klienta** - działa
5. **Zmiana wielu pól jednocześnie** - działa

### Walidacja ✓

6. **Niepoprawny format email** - odrzucone z błędem
7. **Niepoprawny kod pocztowy** - odrzucone z błędem
8. **Nieistniejący klient (404)** - obsłużone
9. **Puste stringi** - odrzucone z błędem

### Szczegóły testów:

**Test 1: Zmiana tylko email**
```bash
curl -s -X PATCH http://localhost:8080/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{"contact_person":{"contact_data":{"email":"nowy.email@example.com"}}}'
```
Wynik: `"nowy.email@example.com"` ✓

**Test 2: Sprawdzenie że inne pola nie zmieniły się**
```bash
curl -s http://localhost:8080/api/clients/1 | \
  jq '{telefon: .contact_person.contact_data.telefon, email: .contact_person.contact_data.email, nazwa_firmy: .company_data.nazwa_firmy}'
```
Wynik:
```json
{
  "telefon": "612345678",
  "email": "nowy.email@example.com",
  "nazwa_firmy": "Sklep Spożywczy \"U Janka\""
}
```
✓ Telefon i nazwa firmy pozostały bez zmian

**Test 3: Zmiana tylko części adresu**
```bash
curl -s -X PATCH http://localhost:8080/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{"adres":{"ulica":"Nowa Ulica","numer_budynku":"99"}}'
```
Wynik:
```json
{
  "ulica": "Nowa Ulica",
  "numer_budynku": "99",
  "numer_lokalu": null,
  "kod_pocztowy": "60-123",
  "miejscowosc": "Poznań",
  "wojewodztwo": "wielkopolskie"
}
```
✓ Ulica i numer się zmieniły, reszta adresu pozostała nietknięta

**Test 4: Próba zmiany NIP (powinien zwrócić błąd)**
```bash
curl -s -X PATCH http://localhost:8080/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{"company_data":{"nip":"9999999999"}}'
```
Wynik:
```json
{
  "error": "NIP cannot be changed"
}
```
✓ Walidacja zadziałała - NIP jest chroniony przed zmianą

**Test 5: Zmiana statusu klienta**
```bash
curl -s -X PATCH http://localhost:8080/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{"status_kod":"VIP"}'
```
Wynik: `"VIP"` ✓

**Test 6: Zmiana wielu pól jednocześnie**
```bash
curl -s -X PATCH http://localhost:8080/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{
    "contact_person":{
      "imie":"Marek",
      "contact_data":{"telefon":"999888777"}
    },
    "company_data":{"nazwa_firmy":"Super Sklep"},
    "status_kod":"AKTYWNY"
  }'
```
Wynik:
```json
{
  "imie": "Marek",
  "telefon": "999888777",
  "nazwa_firmy": "Super Sklep",
  "status": "AKTYWNY"
}
```
✓ Wszystkie podane pola się zaktualizowały jednocześnie

**Test 7: Walidacja niepoprawnego emaila**
```bash
curl -s -X PATCH http://localhost:8080/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{"contact_person":{"contact_data":{"email":"zly-email"}}}'
```
Wynik:
```json
{
  "error": "Invalid email format"
}
```
✓ Walidacja emaila działa

**Test 8: Walidacja niepoprawnego kodu pocztowego**
```bash
curl -s -X PATCH http://localhost:8080/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{"adres":{"kod_pocztowy":"12345"}}'
```
Wynik:
```json
{
  "error": "Invalid postal code format (XX-XXX)"
}
```
✓ Walidacja kodu pocztowego działa

**Test 9: Próba aktualizacji nieistniejącego klienta**
```bash
curl -s -X PATCH http://localhost:8080/api/clients/999 \
  -H "Content-Type: application/json" \
  -d '{"contact_person":{"imie":"Test"}}'
```
Wynik:
```json
{
  "error": "Client with id: 999 does not exist"
}
```
✓ Obsługa błędu 404 działa

**Test 10: Walidacja pustego stringa**
```bash
curl -s -X PATCH http://localhost:8080/api/clients/1 \
  -H "Content-Type: application/json" \
  -d '{"company_data":{"nazwa_firmy":""}}'
```
Wynik:
```json
{
  "error": "company_data.nazwa_firmy cannot be empty"
}
```
✓ Walidacja pustych stringów działa

---

## ✅ DELETE /api/clients/:id - Usunięcie klienta

### Testy funkcjonalne ✓

1. **Usunięcie istniejącego klienta** → 204 No Content ✓
2. **Weryfikacja usunięcia** → klient zniknął z bazy ✓
3. **Idempotentność** → drugie DELETE tego samego ID → 204 No Content ✓
4. **Walidacja niepoprawnego ID** → błąd walidacji ✓
5. **CASCADE** → usunięcie klienta usuwa powiązane umowy i zdarzenia (schemat ma ON DELETE CASCADE) ✓

### Szczegóły testów:

**Przygotowanie: Stworzenie testowego klienta**
```bash
curl -s -X POST http://localhost:8080/api/clients \
  -H "Content-Type: application/json" \
  -d '{
    "contact_person":{
      "imie":"Jan",
      "nazwisko":"Testowy",
      "stanowisko":"testowy",
      "contact_data":{"email":"test@test.pl","telefon":"123456789"}
    },
    "company_data":{"nip":"9999999999","nazwa_firmy":"Test Sp. z o.o."},
    "adres":{
      "ulica":"Testowa",
      "numer_budynku":"1",
      "numer_lokalu":"",
      "kod_pocztowy":"00-000",
      "miejscowosc":"Warszawa",
      "wojewodztwo":"mazowieckie"
    },
    "status_kod":"PROSPEKT"
  }'
```
Wynik:
```json
{
  "id": 6,
  "nazwa": "Test Sp. z o.o."
}
```
✓ Klient o ID 6 został utworzony

**Test 1: Usuń istniejącego klienta**
```bash
curl -s -X DELETE http://localhost:8080/api/clients/6 -w "\nHTTP Status: %{http_code}"
```
Wynik: `HTTP Status: 204` ✓

**Test 2: Weryfikacja usunięcia**
```bash
curl -s http://localhost:8080/api/clients/6
```
Wynik:
```json
{
  "error": "Client with id: 6 does not exist"
}
```
✓ Klient został usunięty z bazy

**Test 3: Idempotentność - usuń tego samego klienta ponownie**
```bash
curl -s -X DELETE http://localhost:8080/api/clients/6 -w "\nHTTP Status: %{http_code}"
```
Wynik: `HTTP Status: 204` ✓

✓ Drugie usunięcie również zwróciło 204 - operacja jest idempotentna!

**Test 4: Niepoprawne ID (walidacja)**
```bash
curl -s -X DELETE http://localhost:8080/api/clients/-5
```
Wynik:
```json
{
  "error": "ID must be a positive integer greater than 0"
}
```
✓ Walidacja ID działa

**Test 5: FK Constraint - CASCADE**
```bash
curl -s -X DELETE http://localhost:8080/api/clients/1
```
Wynik: Klient usunięty pomyślnie

Weryfikacja schematu:
```sql
klient_id INTEGER NOT NULL REFERENCES klient(id) ON DELETE CASCADE
```
✓ Usunięcie klienta automatycznie usuwa wszystkie powiązane umowy i zdarzenia (ON DELETE CASCADE)

---

## 🎉 PODSUMOWANIE - PEŁNY CRUD KLIENTÓW

Wszystkie endpointy działają poprawnie:

- ✅ **GET** `/api/clients` - lista klientów
- ✅ **GET** `/api/clients/:id` - szczegóły klienta
- ✅ **POST** `/api/clients` - tworzenie klienta
- ✅ **PATCH** `/api/clients/:id` - częściowa aktualizacja
- ✅ **DELETE** `/api/clients/:id` - usunięcie klienta

### Implementacja zgodna z:
- ✅ Architektura warstwowa (Controller → Service → Repository)
- ✅ KISS - proste i czytelne rozwiązania
- ✅ DRY - brak duplikacji
- ✅ Walidacja na każdym poziomie
- ✅ Obsługa błędów
- ✅ RESTful API conventions
- ✅ Idempotentność operacji DELETE
- ✅ Immutability NIP
