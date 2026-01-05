# Typy - Prosty Przewodnik

## Problem przed refactoringiem
- 11 różnych typów dla tego samego klienta/adresu
- `dto/`, `types/`, `requests/` - wszystko duplikowało się

## Rozwiązanie - 4 proste pliki

### 1. `domainTypes.ts` - Encje z bazy danych
```typescript
type Client = {
  id: number;
  nip: string;
  telefon: string; // "" zamiast null
  ...
}

type Address = {
  ulica: string; // "" zamiast null
  ...
}
```

### 2. `requests.ts` - Co przychodzi z API
```typescript
type CreateClientRequest = {
  nip: string;          // wymagane
  telefon?: string;     // opcjonalne (może być undefined)
  adres: { ... }
}
```

### 3. `responses.ts` - Co zwracamy z API
```typescript
type ClientListResponse = { ... }
type ClientDetailResponse = { ... }
```

### 4. `utils.ts` - Pomocnicze funkcje
```typescript
nullToEmpty(value)      // null -> ""
undefinedToEmpty(value) // undefined -> ""
isEmpty(value)          // sprawdza czy pusty
```

## Jak używać

### Tworzenie klienta
```typescript
import { CreateClientRequest, nullToEmpty, undefinedToEmpty } from "./types";

async function createClient(req: CreateClientRequest) {
  // 1. Znajdź status
  const status = await db.query("SELECT id FROM status_klienta WHERE kod = $1",
    [req.status_kod]);

  // 2. Wstaw adres (undefined -> "")
  const adresResult = await db.query(
    "INSERT INTO adres (ulica, numer_budynku, ...) VALUES ($1, $2, ...)",
    [
      undefinedToEmpty(req.adres.ulica),      // undefined -> ""
      req.adres.numer_budynku,
      undefinedToEmpty(req.adres.numer_lokalu),
      ...
    ]
  );

  // 3. Wstaw klienta (undefined -> "")
  await db.query(
    "INSERT INTO klient (nip, imie, telefon, ...) VALUES ($1, $2, $3, ...)",
    [
      req.nip,
      undefinedToEmpty(req.imie),             // undefined -> ""
      undefinedToEmpty(req.telefon),          // undefined -> ""
      ...
    ]
  );
}
```

### Pobieranie klienta
```typescript
import { Client, ClientDetailResponse, nullToEmpty } from "./types";

async function getClient(id: number): Promise<ClientDetailResponse> {
  const result = await db.query("SELECT * FROM klient WHERE id = $1", [id]);
  const row = result.rows[0];

  // Konwertuj null z bazy -> ""
  return {
    id: row.id,
    nip: row.nip,
    imie: nullToEmpty(row.imie),              // null -> ""
    telefon: nullToEmpty(row.telefon),        // null -> ""
    ...
  };
}
```

### Sprawdzanie pustych wartości
```typescript
import { isEmpty } from "./types";

const client = await getClient(1);

if (isEmpty(client.telefon)) {
  console.log("Brak telefonu");
}

if (client.imie === "") {
  console.log("Brak imienia");
}
```

## Co usunąć?
Po migracji usuń:
- `dto/dto.ts`
- `requests/clientRequests.ts`
- `types/clients.ts`
- `types/common.ts`

## Zasady
1. **Brak null** - zawsze pusty string `""`
2. **Proste typy** - odzwierciedlają bazę danych
3. **undefined tylko w requestach** - bo pole może nie być przesłane
4. **Utility functions** - zamiast skomplikowanych konwerterów
