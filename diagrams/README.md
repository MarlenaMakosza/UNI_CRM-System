# Diagramy PlantUML - System CRM Lab 6

Krok 1 z instrukcji Laboratorium 6: **Diagram procesu w PlantUML**

## 📋 Lista diagramów

### 1. Proces pełny (7 kroków)
**Plik:** `01-process-full.puml`
**Diagram:** Activity Diagram
**Opis:** Pełny proces "od leada do umowy" z PDF (Załącznik nr 1) - wszystkie 7 kroków w wersji referencyjnej.

**Zawiera:**
- Pozyskanie leada (Internet/Prasa/Książki/Spisy)
- Kontakt telefoniczny (6 typów wyników)
- Wizyta w sklepie (z cenami konkurencji)
- Oferta (kilka dni po wizycie)
- Umowa (jeśli zaakceptowano)
- Telefon kontrolny (po dostawie)
- Newsletter miesięczny
- Raporty Kierownika

---

### 2. Proces minimalny (MVP)
**Plik:** `02-process-minimal.puml`
**Diagram:** Activity Diagram
**Opis:** Uproszczona wersja procesu dla implementacji studenckiej (2 tygodnie). Wszystkie funkcje z PDF, ale z prostszymi implementacjami.

**Uproszczenia:**
- Oferta jako typ kontaktu (nie osobna tabela)
- Umowa opcjonalna (lub tylko zmiana statusu)
- Newsletter manualny (bez Cron/SMTP)
- Zamówienia w notatkach (nie osobna tabela)

**Kolory:**
- 🟢 Zielony: Akcje/ekrany
- 🟡 Żółty: Decyzje

---

### 3. Role i uprawnienia
**Plik:** `03-roles-permissions.puml`
**Diagram:** Component Diagram
**Opis:** Podział terytorialny przedstawicieli handlowych + uprawnienia Kierownika.

**Role:**
- **PH (Poznań)** → widzi tylko leadów z Poznania
- **PH (Wrocław)** → widzi tylko leadów z Wrocławia
- **PH (Szczecin)** → widzi tylko leadów ze Szczecina
- **Kierownik** → widzi wszystko + raporty

**Implementacja:**
```sql
-- Filtrowanie dla PH:
WHERE assigned_to = current_user_id

-- Filtrowanie dla Kierownika:
-- (bez WHERE - widzi wszystko)
```

---

### 4. Model danych
**Plik:** `04-data-model.puml`
**Diagram:** Entity Relationship Diagram (ERD)
**Opis:** Schemat bazy danych PostgreSQL dla MVP (Drizzle ORM).

**Tabele główne:**
1. **users** - PH + Kierownik (role, territory)
2. **leads** - Firmy/sklepy (z contact_person, lead_source)
3. **activities** - Kontakty telefoniczne (6 typów outcome)
4. **visits** - Wizyty (z competitor_prices TEXT)
5. **contracts** - Umowy (opcjonalne)

**Walidacje:**
- Telefon: 9-15 cyfr
- Email: format xxx@xxx.xx
- CONSTRAINT: phone OR email NOT NULL

**Indeksy:**
- leads(assigned_to, city, status)
- activities(lead_id, activity_date)
- visits(user_id, scheduled_at)

---

### 5. Przypadki użycia (Use Cases)
**Plik:** `05-use-cases.puml`
**Diagram:** Use Case Diagram
**Opis:** Wszystkie funkcjonalności systemu z perspektywy użytkowników.

**Główne grupy:**
1. **Zarządzanie leadami** (dodaj, edytuj, filtruj, zmień status)
2. **Kontakty telefoniczne** 🟡 **← GŁÓWNY ekran dla instrukcji!**
3. **Wizyty** (planowanie, harmonogram, wyniki)
4. **Oferty i umowy** (uproszczone)
5. **Raporty Kierownika** (KPI per PH)
6. **Dashboard** (PH vs Kierownik)

**Legenda:**
- 🟡 Żółty: Główny ekran (dla instrukcji obsługi - PDF punkt 6)
- ⚪ Szary: Opcjonalne (można pominąć w MVP)

---

### 6. Sekwencja - Dodawanie kontaktu telefonicznego
**Plik:** `06-sequence-phone-contact.puml`
**Diagram:** Sequence Diagram
**Opis:** Szczegółowa sekwencja interakcji dla **głównego ekranu** (rejestracja kontaktu telefonicznego).

**Uczestnicy:**
- PH (Przedstawiciel Handlowy)
- Dashboard (Lista leadów)
- Formularz Kontaktu
- Walidator
- API Server (SvelteKit)
- Baza Danych (PostgreSQL)
- Formularz Wizyty (jeśli MEETING_SET)

**Kroki:**
1. PH wybiera leada z listy
2. System otwiera formularz (pre-fill: nazwa firmy, data)
3. PH wypełnia: rozmówca, wynik, notatka
4. Walidacja (frontend + backend)
5. Zapis do tabeli `activities`
6. **Jeśli wynik = MEETING_SET** → przekierowanie do formularza wizyty
7. Timeline kontaktów (chronologia)

**Ten diagram jest kluczowy dla instrukcji obsługi (PDF punkt 6)!**

---

## 🛠️ Jak generować diagramy

### Wymagania
- Java 8+ (`java -version`)
- PlantUML JAR (`plantuml-1.2025.0.jar` - już w katalogu)

### Generowanie PNG

```powershell
# Wszystkie diagramy
cd C:\Users\Lenerystia\Source\CRM_Lab6\diagrams
java -jar plantuml-1.2025.0.jar -tpng *.puml

# Pojedynczy diagram
java -jar plantuml-1.2025.0.jar -tpng 01-process-full.puml
```

### Generowanie SVG (wektorowe)

```powershell
java -jar plantuml-1.2025.0.jar -tsvg *.puml
```

### Online (bez instalacji Java)

Wklej zawartość pliku `.puml` do:
- https://www.plantuml.com/plantuml/uml/
- https://plantuml-editor.kkeisuke.com/

---

## 📁 Struktura plików

```
diagrams/
├── 01-process-full.puml                    # Zrodlo: Proces pelny
├── 01-process-full.png                     # PNG: Proces pelny
├── 02-process-minimal.puml                 # Zrodlo: Proces minimalny (MVP)
├── 02-process-minimal.png                  # PNG: Proces minimalny
├── 03-roles-permissions.puml               # Zrodlo: Role i uprawnienia
├── 03-roles-permissions.png                # PNG: Role i uprawnienia
├── 04-data-model.puml                      # Zrodlo: Model danych (ERD)
├── 04-data-model.png                       # PNG: Model danych
├── 05-use-cases.puml                       # Zrodlo: Przypadki uzycia
├── 05-use-cases.png                        # PNG: Przypadki uzycia
├── 06-sequence-phone-contact.puml          # Zrodlo: Sekwencja (glowny ekran)
├── 06-sequence-phone-contact.png           # PNG: Sekwencja
├── plantuml-1.2025.0.jar                   # Generator PlantUML
├── fix-polish-chars.py                     # Skrypt naprawy (opcjonalny)
└── README.md                               # Ten plik
```

**WAZNE:** Nazwy plikow .puml i .png sa teraz zsynchronizowane!
- Plik `01-process-full.puml` generuje `01-process-full.png`
- Brak polskich znakow w zawartosci diagramow
- Latwe mapowanie: nazwa .puml = nazwa .png

---

## 📖 Powiązane dokumenty

- **Wymagania minimalne**: `../docs/minimal-student/requirements-minimal.md`
- **Specyfikacja techniczna**: `../docs/minimal-student/technical-specification-minimal.md`
- **PDF zadania**: `../lab-materials/Laboratorium 6 Budowa systemu CRM.pdf`

---

## ✅ Krok 1 z instrukcji - ZAKOŃCZONY

**Z instrukcji (strona 2):**
> Krok 1: Przedstaw w notacji UML (**możesz użyć narzędzia PlantUML**) diagram aktywności opisujący w jaki sposób przebiega proces „od leada do umowy"

**Status:** ✅ **ZREALIZOWANE**

**Utworzone diagramy:**
- ✅ Diagram aktywności - proces pełny (01)
- ✅ Diagram aktywności - proces minimalny (02)
- ✅ Diagram komponentów - role/uprawnienia (03)
- ✅ ERD - model danych (04)
- ✅ Use Case - przypadki użycia (05)
- ✅ Sequence - główny ekran (06)

**Format:** PlantUML (`.puml`) + PNG

**Zgodność z PDF:** ✅ Wszystkie 7 kroków z Załącznika nr 1

---

**Data utworzenia:** 2025-10-11
**Narzędzie:** PlantUML 1.2025.0
**Projekt:** CRM Lab 6 - Firma X (Hurtownia warzyw/owoców)
