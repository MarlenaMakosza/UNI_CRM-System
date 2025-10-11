# Instrukcja instalacji - System CRM Lab 6

## Wymagania systemowe

- **System operacyjny**: Windows 10/11
- **RAM**: minimum 8 GB
- **Dysk**: ~2 GB wolnego miejsca
- **Internet**: połączenie do pobrania pakietów

---

## Krok 1: Instalacja Deno

### 1.1. Pobierz i zainstaluj Deno

Otwórz **PowerShell** jako administrator i uruchom:

```powershell
irm https://deno.land/install.ps1 | iex
```

### 1.2. Sprawdź instalację

Po zakończeniu instalacji, zamknij i otwórz ponownie terminal, a następnie sprawdź wersję:

```powershell
deno --version
```

Powinieneś zobaczyć coś w stylu:
```
deno 2.0.x
v8 12.x
typescript 5.x
```

### 1.3. Dodaj Deno do PATH (jeśli nie działa)

Jeśli komenda `deno` nie jest rozpoznawana:

1. Otwórz **Zmienne środowiskowe** (System Properties → Advanced → Environment Variables)
2. W sekcji **User variables** dodaj do **Path**:
   ```
   C:\Users\%USERNAME%\.deno\bin
   ```
3. Uruchom ponownie terminal

---

## Krok 2: Instalacja Docker Desktop

### 2.1. Pobierz Docker Desktop

Pobierz instalator z oficjalnej strony:
https://www.docker.com/products/docker-desktop/

### 2.2. Zainstaluj Docker Desktop

1. Uruchom pobrany plik `.exe`
2. Postępuj zgodnie z krokami instalatora
3. **WAŻNE**: Zaznacz opcję "Use WSL 2 instead of Hyper-V" (jeśli dostępna)
4. Po instalacji uruchom ponownie komputer

### 2.3. Uruchom Docker Desktop

1. Otwórz **Docker Desktop** z menu Start
2. Poczekaj na uruchomienie (ikona Docker w zasobniku systemowym powinna być zielona)
3. Otwórz PowerShell i sprawdź instalację:

```powershell
docker --version
docker-compose --version
```

Powinieneś zobaczyć:
```
Docker version 24.x.x
Docker Compose version v2.x.x
```

---

## Krok 3: Instalacja Visual Studio Code

### 3.1. Pobierz VS Code

Pobierz instalator z oficjalnej strony:
https://code.visualstudio.com/

### 3.2. Zainstaluj VS Code

1. Uruchom pobrany plik `.exe`
2. Postępuj zgodnie z krokami instalatora
3. **Zalecane**: Zaznacz opcje:
   - "Add to PATH"
   - "Register Code as an editor for supported file types"

### 3.3. Zainstaluj rozszerzenia (extensions)

Otwórz VS Code i zainstaluj następujące rozszerzenia:

1. **Deno** (`denoland.vscode-deno`)
   - Otwórz Extensions (Ctrl+Shift+X)
   - Wyszukaj "Deno"
   - Kliknij "Install"

2. **Svelte for VS Code** (`svelte.svelte-vscode`)
   - Wyszukaj "Svelte for VS Code"
   - Kliknij "Install"

3. **PostgreSQL** (`ckolkman.vscode-postgres`) - opcjonalne
   - Do przeglądania bazy danych w VS Code

4. **Prettier** (`esbenp.prettier-vscode`) - opcjonalne
   - Formatowanie kodu

5. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) - opcjonalne
   - Autouzupełnianie klas Tailwind

---

## Krok 4: Uruchomienie bazy danych PostgreSQL

### 4.1. Przejdź do katalogu projektu

Otwórz PowerShell i przejdź do katalogu projektu:

```powershell
cd C:\Users\Lenerystia\Source\CRM_Lab6
```

### 4.2. Uruchom PostgreSQL w Docker

```powershell
docker-compose up -d
```

Komenda ta:
- Pobierze obraz PostgreSQL 15 (pierwsze uruchomienie)
- Utworzy kontener `crm-postgres`
- Uruchomi go w tle (detached mode)

### 4.3. Sprawdź status kontenera

```powershell
docker ps
```

Powinieneś zobaczyć:
```
CONTAINER ID   IMAGE              STATUS         PORTS                    NAMES
xxxxxxxxx      postgres:15-alpine Up 2 minutes   0.0.0.0:5432->5432/tcp   crm-postgres
```

### 4.4. Testuj połączenie z bazą

```powershell
docker exec -it crm-postgres psql -U crm_user -d crm_db
```

Jeśli widzisz prompt PostgreSQL (`crm_db=#`), połączenie działa!

Wyjdź z PostgreSQL:
```sql
\q
```

---

## Krok 5: Konfiguracja projektu

### 5.1. Skopiuj plik .env

```powershell
cp .env.example .env
```

### 5.2. Zmodyfikuj AUTH_SECRET (WAŻNE!)

Otwórz plik `.env` w VS Code i wygeneruj losowy klucz:

**PowerShell:**
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Skopiuj wygenerowany ciąg i wklej do `.env`:
```env
AUTH_SECRET=aBcD1234eFgH5678iJkL9012mNoPqRsT
```

---

## Krok 6: Instalacja zależności projektu (kiedy projekt będzie gotowy)

**UWAGA**: Te kroki wykonasz po utworzeniu struktury projektu SvelteKit.

### 6.1. Zainstaluj zależności

```powershell
deno install
```

### 6.2. Uruchom migracje bazy danych

```powershell
deno task db:migrate
```

### 6.3. Uruchom aplikację w trybie deweloperskim

```powershell
deno task dev
```

Aplikacja powinna być dostępna pod adresem:
```
http://localhost:5173
```

---

## Krok 7: Weryfikacja instalacji

Sprawdź, czy wszystko działa:

```powershell
# Sprawdź Deno
deno --version

# Sprawdź Docker
docker --version

# Sprawdź PostgreSQL
docker ps | findstr crm-postgres

# Sprawdź VS Code (powinno otworzyć VS Code)
code --version
```

Jeśli wszystkie komendy działają - instalacja zakończona sukcesem! ✅

---

## Przydatne komendy Docker

### Zatrzymaj PostgreSQL
```powershell
docker-compose stop
```

### Uruchom ponownie PostgreSQL
```powershell
docker-compose start
```

### Zatrzymaj i usuń kontener (dane pozostaną)
```powershell
docker-compose down
```

### Usuń kontener wraz z danymi (UWAGA: usuwa bazę!)
```powershell
docker-compose down -v
```

### Zobacz logi PostgreSQL
```powershell
docker-compose logs -f postgres
```

### Otwórz terminal PostgreSQL
```powershell
docker exec -it crm-postgres psql -U crm_user -d crm_db
```

---

## Rozwiązywanie problemów

### Problem: Docker nie uruchamia się

**Rozwiązanie**:
1. Sprawdź, czy **WSL 2** jest zainstalowane:
   ```powershell
   wsl --list --verbose
   ```
2. Jeśli nie, zainstaluj:
   ```powershell
   wsl --install
   ```
3. Uruchom ponownie komputer
4. Uruchom Docker Desktop

### Problem: Port 5432 jest zajęty

**Rozwiązanie**:
1. Sprawdź, co używa portu:
   ```powershell
   netstat -ano | findstr :5432
   ```
2. Zatrzymaj lokalną instancję PostgreSQL lub zmień port w `docker-compose.yml`:
   ```yaml
   ports:
     - "5433:5432"  # Zmień 5432 na 5433
   ```

### Problem: Deno nie jest rozpoznawane

**Rozwiązanie**:
1. Sprawdź PATH:
   ```powershell
   $env:Path -split ';' | Select-String deno
   ```
2. Jeśli nie ma, dodaj ręcznie (patrz Krok 1.3)
3. Uruchom ponownie terminal

### Problem: VS Code nie widzi Deno

**Rozwiązanie**:
1. Otwórz Command Palette (Ctrl+Shift+P)
2. Wpisz: "Deno: Initialize Workspace Configuration"
3. W pliku `.vscode/settings.json` powinno być:
   ```json
   {
     "deno.enable": true,
     "deno.lint": true,
     "deno.unstable": false
   }
   ```

---

## Kontakt i pomoc

**Dokumentacja:**
- Deno: https://docs.deno.com/
- SvelteKit: https://svelte.dev/docs/kit/introduction
- Docker: https://docs.docker.com/
- PostgreSQL: https://www.postgresql.org/docs/

**Instrukcja projektu:**
- Wymagania: `docs/minimal-student/requirements-minimal.md`
- Specyfikacja techniczna: `docs/minimal-student/technical-specification-minimal.md`

---

**Data utworzenia**: 2025-10-11
**Wersja**: 1.0
**System**: Windows 10/11
