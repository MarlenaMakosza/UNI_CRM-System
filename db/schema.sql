-- schema.sql

CREATE TABLE adres (
  id SERIAL PRIMARY KEY,
  ulica VARCHAR(200),
  numer_budynku VARCHAR(20) NOT NULL,
  numer_lokalu VARCHAR(20),
  kod_pocztowy CHAR(6) NOT NULL,
  miejscowosc VARCHAR(100) NOT NULL,
  wojewodztwo VARCHAR(50),
  
  CONSTRAINT check_kod_pocztowy CHECK (kod_pocztowy ~ '^\d{2}-\d{3}$')
);

CREATE TABLE status_klienta (
  id      SERIAL PRIMARY KEY,
  kod     VARCHAR(50)  NOT NULL UNIQUE,  -- np. 'PROSPEKT', 'AKTYWNY'
  nazwa   VARCHAR(100) NOT NULL          -- opis przyjazny dla użytkownika
);

CREATE TABLE klient (
  id          SERIAL PRIMARY KEY,
  nip         VARCHAR(10) NOT NULL UNIQUE,
  nazwa_firmy VARCHAR(200) NOT NULL,
  imie        VARCHAR(100),  -- osoby decyzyjnej
  nazwisko    VARCHAR(100),  -- osoby decyzyjnej
  stanowisko  VARCHAR(100),  -- np. 'właściciel', 'kierownik zakupów'
  email       VARCHAR(255) NOT NULL,
  telefon     VARCHAR(30),
  adres_id    INTEGER NOT NULL REFERENCES adres(id),
  status_klienta_id   INTEGER NOT NULL REFERENCES status_klienta(id),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_klient_status FOREIGN KEY (status_klienta_id) REFERENCES status_klienta(id),
  CONSTRAINT fk_klient_adres FOREIGN KEY (adres_id) REFERENCES adres(id)
);

CREATE TABLE region (
  id SERIAL PRIMARY KEY,
  nazwa VARCHAR(100) NOT NULL UNIQUE, -- 'Poznań', 'Szczecin', 'Wrocław'
  wojewodztwo VARCHAR(50)
);

CREATE TABLE przedstawiciel_handlowy (
  id          SERIAL PRIMARY KEY,
  imie        VARCHAR(100) NOT NULL,
  nazwisko    VARCHAR(100) NOT NULL,
  email       VARCHAR(255),
  telefon     VARCHAR(30),
  region_id   INTEGER NOT NULL REFERENCES region(id),
  data_zatrudnienia DATE,
  aktywny     BOOLEAN DEFAULT TRUE,

  CONSTRAINT fk_przedst_region FOREIGN KEY (region_id) REFERENCES region(id)
);

CREATE TABLE typ_zdarzenia (
  id      SERIAL PRIMARY KEY,
  nazwa   VARCHAR(100) NOT NULL UNIQUE -- np. 'telefon', 'wizyta', 'newsletter', 'follow-up', 'telefon_po_dostawie'
);

CREATE TABLE typ_umowy (
  id      SERIAL PRIMARY KEY,
  nazwa   VARCHAR(100) NOT NULL UNIQUE -- np. 'ramowa', 'jednorazowa'
);

CREATE TABLE produkt (
  id      SERIAL PRIMARY KEY,
  nazwa   VARCHAR(100) NOT NULL,
  opis    TEXT,
  cena    NUMERIC(12,2) -- cena jednostkowa
);

CREATE TABLE umowa (
  id              SERIAL PRIMARY KEY,
  klient_id       INTEGER NOT NULL REFERENCES klient(id) ON DELETE CASCADE,
  typ_id          INTEGER NOT NULL REFERENCES typ_umowy(id),
  przedstawiciel_id INTEGER NOT NULL REFERENCES przedstawiciel_handlowy(id),
  
  status          VARCHAR(50) NOT NULL,
  data_od         DATE NOT NULL,
  data_do         DATE,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  -- wartosc_umowy można obliczyć z pozycji, ale zostawmy dla cache
  wartosc_umowy   NUMERIC(14,2) NOT NULL,

  CONSTRAINT fk_umowa_klient FOREIGN KEY (klient_id) REFERENCES klient(id),
  CONSTRAINT fk_umowa_typ FOREIGN KEY (typ_id) REFERENCES typ_umowy(id),
  CONSTRAINT fk_umowa_przedstawiciel FOREIGN KEY (przedstawiciel_id) REFERENCES przedstawiciel_handlowy(id)
);


CREATE TABLE zdarzenie (
  id                 SERIAL PRIMARY KEY,
  klient_id          INTEGER NOT NULL REFERENCES klient(id) ON DELETE CASCADE,
  przedstawiciel_id  INTEGER NOT NULL REFERENCES przedstawiciel_handlowy(id),
  typ_id             INTEGER NOT NULL REFERENCES typ_zdarzenia(id),
  umowa_id           INTEGER REFERENCES umowa(id),
  
  -- Dla planowania:
  data_planowana     TIMESTAMP, 
  data_realizacji    TIMESTAMP,
  
  status             VARCHAR(50) DEFAULT 'zaplanowane', -- 'zaplanowane', 'zrealizowane', 'odwołane'
  
  -- Notatki (np. konkurencji):
  opis               TEXT,
  notatki            TEXT,
  created_at         TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_zdarzenie_klient FOREIGN KEY (klient_id) REFERENCES klient(id),
  CONSTRAINT fk_zdarzenie_przedstawiciel FOREIGN KEY (przedstawiciel_id) REFERENCES przedstawiciel_handlowy(id),
  CONSTRAINT fk_zdarzenie_typ FOREIGN KEY (typ_id) REFERENCES typ_zdarzenia(id),
  CONSTRAINT fk_zdarzenie_umowa FOREIGN KEY (umowa_id) REFERENCES umowa(id)
);

CREATE TABLE pozycja_umowy (
  id         SERIAL PRIMARY KEY,
  umowa_id   INTEGER NOT NULL REFERENCES umowa(id) ON DELETE CASCADE,
  produkt_id INTEGER NOT NULL REFERENCES produkt(id),
  ilosc      NUMERIC(10,2) NOT NULL, -- może być 0.5kg, 100kg, itd.
  jednostka  VARCHAR(20) NOT NULL, -- 'kg', 'szt', 'opakowanie'
  cena_jednostkowa NUMERIC(12,2) NOT NULL, -- cena w momencie podpisania umowy
  wartosc    NUMERIC(14,2) GENERATED ALWAYS AS (ilosc * cena_jednostkowa) STORED,
  
  CONSTRAINT fk_pozycja_umowa FOREIGN KEY (umowa_id) REFERENCES umowa(id),
  CONSTRAINT fk_pozycja_produkt FOREIGN KEY (produkt_id) REFERENCES produkt(id),
  CONSTRAINT check_ilosc_positive CHECK (ilosc > 0)
);


-- Indeksy dla wydajności
CREATE INDEX idx_adres_miejscowosc ON adres(miejscowosc);
CREATE INDEX idx_adres_kod ON adres(kod_pocztowy);
CREATE INDEX idx_klient_status ON klient(status_klienta_id);
CREATE INDEX idx_klient_adres ON klient(adres_id);
CREATE INDEX idx_zdarzenie_data_plan ON zdarzenie(data_planowana) WHERE status = 'zaplanowane';
CREATE INDEX idx_zdarzenie_przedstawiciel ON zdarzenie(przedstawiciel_id, data_planowana);
CREATE INDEX idx_zdarzenie_klient ON zdarzenie(klient_id);
CREATE INDEX idx_umowa_klient ON umowa(klient_id);
CREATE INDEX idx_umowa_przedstawiciel ON umowa(przedstawiciel_id);
CREATE INDEX idx_pozycja_umowa ON pozycja_umowy(umowa_id);
CREATE INDEX idx_pozycja_produkt ON pozycja_umowy(produkt_id);
