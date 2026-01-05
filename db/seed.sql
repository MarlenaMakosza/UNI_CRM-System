-- ============================================
-- SKRYPT INICJALIZACYJNY - DANE PODSTAWOWE
-- ============================================

-- Czyszczenie danych (jeśli już istnieją)
TRUNCATE TABLE pozycja_umowy, umowa, zdarzenie, przedstawiciel_handlowy, klient,
           adres, status_klienta, region, typ_zdarzenia, typ_umowy, produkt
           RESTART IDENTITY CASCADE;

-- ===== STATUSY KLIENTÓW =====
INSERT INTO status_klienta (kod, nazwa) VALUES
  ('PROSPEKT', 'Potencjalny klient'),
  ('W TRAKCIE', 'Przestawiciel jest w trakcie negocjacji'),
  ('AKTYWNY', 'Klient aktywny'),
  ('NIEAKTYWNY', 'Klient nieaktywny'),
  ('VIP', 'Klient VIP');

-- ===== TYPY ZDARZEŃ =====
INSERT INTO typ_zdarzenia (nazwa) VALUES
  ('telefon'),
  ('wizyta'),
  ('follow-up'),
  ('telefon_po_dostawie'),
  ('newsletter');

-- ===== TYPY UMÓW =====
INSERT INTO typ_umowy (nazwa) VALUES
  ('ramowa'),
  ('jednorazowa');

-- ===== REGIONY =====
INSERT INTO region (nazwa) VALUES
  ('Poznań'),
  ('Szczecin'),
  ('Wrocław'),
  ('Zielona Góra');

-- ===== PRODUKTY =====
INSERT INTO produkt (nazwa, opis, cena) VALUES
  ('Ziemniaki ekologiczne', 'Ziemniaki z gospodarstw ekologicznych', 3.50),
  ('Marchew ekologiczna', 'Świeża marchew ekologiczna', 4.20),
  ('Jabłka ekologiczne', 'Jabłka z sadów ekologicznych', 5.80),
  ('Pomidory', 'Pomidory malinowe', 8.50),
  ('Sałata', 'Sałata masłowa', 3.20),
  ('Ogórki', 'Ogórki gruntowe', 6.50),
  ('Papryka', 'Papryka czerwona i żółta', 12.00),
  ('Cebula', 'Cebula biała i czerwona', 2.80),
  ('Brokuły', 'Świeże brokuły', 7.50),
  ('Kurczak ekologiczny', 'Kurczak z farm ekologicznych', 18.00);

-- ===== PRZEDSTAWICIELE HANDLOWI =====
-- Hasła dla użytkowników (wszystkie: "password123")
-- Hash wygenerowany przez bcrypt z saltem 10
INSERT INTO przedstawiciel_handlowy (imie, nazwisko, email, telefon, region_id, data_zatrudnienia, aktywny, haslo_hash, rola) VALUES
  ('Jan', 'Kowalski', 'jan.kowalski@firmx.pl', '601234567', 4, '2023-01-15', true, '$2a$10$D7HcQe5AFX4r8EkzMZBIruZvH6pMIqiElw7S2HUVF9HLXxG2UJ5f.', 'szef'),
  ('Anna', 'Nowak', 'anna.nowak@firmx.pl', '602345678', 2, '2023-02-01', true, '$2a$10$D7HcQe5AFX4r8EkzMZBIruZvH6pMIqiElw7S2HUVF9HLXxG2UJ5f.', 'pracownik'),
  ('Piotr', 'Wiśniewski', 'piotr.wisniewski@firmx.pl', '603456789', 3, '2023-03-10', true, '$2a$10$D7HcQe5AFX4r8EkzMZBIruZvH6pMIqiElw7S2HUVF9HLXxG2UJ5f.', 'pracownik'),
  ('Marek', 'Zieliński', 'marek.zielinski@firmx.pl', '604567890', 1, '2023-06-01', true, '$2a$10$D7HcQe5AFX4r8EkzMZBIruZvH6pMIqiElw7S2HUVF9HLXxG2UJ5f.', 'pracownik');

-- ===== PRZYKŁADOWI KLIENCI =====
-- Klient 1 - Sklep "U Janka" w Poznaniu
INSERT INTO adres (ulica, numer_budynku, kod_pocztowy, miejscowosc, wojewodztwo)
VALUES ('Świerczewskiego', '15', '60-123', 'Poznań', 'wielkopolskie');

INSERT INTO klient (nip, nazwa_firmy, imie, nazwisko, stanowisko, email, telefon, adres_id, status_klienta_id)
VALUES ('1234567890', 'Sklep Spożywczy "U Janka"', 'Janusz', 'Kowalczyk', 'właściciel',
        'sklep.ujanka@example.com', '612345678', 1, 2);

-- Klient 2 - Delikatesy "Smak" w Szczecinie
INSERT INTO adres (ulica, numer_budynku, kod_pocztowy, miejscowosc, wojewodztwo)
VALUES ('Jagiellońska', '42', '70-456', 'Szczecin', 'zachodniopomorskie');

INSERT INTO klient (nip, nazwa_firmy, imie, nazwisko, stanowisko, email, telefon, adres_id, status_klienta_id)
VALUES ('2345678901', 'Delikatesy "Smak"', 'Maria', 'Nowacka', 'kierownik zakupów',
        'zakupy@delikatesysmak.pl', '913456789', 2, 2);

-- Klient 3 - "Zdrowa Żywność" we Wrocławiu
INSERT INTO adres (ulica, numer_budynku, kod_pocztowy, miejscowosc, wojewodztwo)
VALUES ('Rynek', '8', '50-789', 'Wrocław', 'dolnośląskie');

INSERT INTO klient (nip, nazwa_firmy, imie, nazwisko, stanowisko, email, telefon, adres_id, status_klienta_id)
VALUES ('3456789012', '"Zdrowa Żywność" Sp. z o.o.', 'Katarzyna', 'Lewandowska', 'prezes',
        'biuro@zdrowazywnos.pl', '715678901', 3, 2);

-- Klient 4 - Potencjalny klient w Poznaniu
INSERT INTO adres (ulica, numer_budynku, kod_pocztowy, miejscowosc, wojewodztwo)
VALUES ('Grunwaldzka', '120', '60-311', 'Poznań', 'wielkopolskie');

INSERT INTO klient (nip, nazwa_firmy, imie, nazwisko, stanowisko, email, telefon, adres_id, status_klienta_id)
VALUES ('4567890123', 'Sklep "Bio Eko"', 'Tomasz', 'Wójcik', 'właściciel',
        'kontakt@bioeko.pl', '618765432', 4, 1);

-- Klient 5 - Sieć "FreshMart" (VIP)
INSERT INTO adres (ulica, numer_budynku, kod_pocztowy, miejscowosc, wojewodztwo)
VALUES ('Centralna', '50', '61-500', 'Poznań', 'wielkopolskie');

INSERT INTO klient (nip, nazwa_firmy, imie, nazwisko, stanowisko, email, telefon, adres_id, status_klienta_id)
VALUES ('5678901234', 'FreshMart Sp. z o.o.', 'Michał', 'Kamiński', 'dyrektor zakupów',
        'zakupy@freshmart.pl', '617777777', 5, 5);

-- Klient 6 - "Świeże Produkty" (NIEAKTYWNY)
INSERT INTO adres (ulica, numer_budynku, kod_pocztowy, miejscowosc, wojewodztwo)
VALUES ('Lipowa', '22', '65-001', 'Zielona Góra', 'lubuskie');

INSERT INTO klient (nip, nazwa_firmy, imie, nazwisko, stanowisko, email, telefon, adres_id, status_klienta_id)
VALUES ('6789012345', 'Świeże Produkty S.C.', 'Krzysztof', 'Adamski', 'współwłaściciel',
        'kontakt@swiezeprodukty.pl', '683456789', 6, 4);

-- ===== UMOWY =====
-- Każdy przedstawiciel ma wszystkie typy umów (ramowa, jednorazowa) i wszystkie statusy (Aktywna, Zakończona, Anulowana, Wstrzymana)
-- wartosc_umowy = 0, bo trigger automatycznie przeliczy z pozycji

-- === Jan Kowalski (ID 1) ===
INSERT INTO umowa (klient_id, typ_id, przedstawiciel_id, status, data_od, data_do, wartosc_umowy) VALUES
  (1, 1, 1, 'Aktywna', '2024-01-01', '2024-12-31', 0),      -- 1: Ramowa + Aktywna
  (1, 1, 1, 'Zakończona', '2023-01-01', '2023-12-31', 0),   -- 2: Ramowa + Zakończona
  (5, 1, 1, 'Anulowana', '2024-06-01', '2025-05-31', 0),    -- 3: Ramowa + Anulowana
  (4, 1, 1, 'Wstrzymana', '2025-01-01', NULL, 0),           -- 4: Ramowa + Wstrzymana
  (1, 2, 1, 'Aktywna', '2024-11-01', NULL, 0),              -- 5: Jednorazowa + Aktywna
  (1, 2, 1, 'Zakończona', '2024-07-15', NULL, 0),           -- 6: Jednorazowa + Zakończona
  (5, 2, 1, 'Anulowana', '2024-08-01', NULL, 0),            -- 7: Jednorazowa + Anulowana
  (4, 2, 1, 'Wstrzymana', '2024-12-01', NULL, 0);           -- 8: Jednorazowa + Wstrzymana

INSERT INTO pozycja_umowy (umowa_id, produkt_id, ilosc, jednostka, cena_jednostkowa) VALUES
  (1, 1, 100, 'kg', 3.50), (1, 2, 50, 'kg', 4.20),
  (2, 3, 80, 'kg', 5.80), (2, 1, 60, 'kg', 3.50),
  (3, 4, 40, 'kg', 8.50), (3, 5, 30, 'kg', 3.20),
  (4, 6, 50, 'kg', 6.50), (4, 7, 25, 'kg', 12.00),
  (5, 4, 50, 'kg', 8.00), (5, 6, 100, 'kg', 6.00),
  (6, 8, 80, 'kg', 2.50), (6, 9, 40, 'kg', 7.50),
  (7, 1, 30, 'kg', 3.50), (7, 2, 20, 'kg', 4.20),
  (8, 3, 15, 'kg', 5.80);

-- === Anna Nowak (ID 2) ===
INSERT INTO umowa (klient_id, typ_id, przedstawiciel_id, status, data_od, data_do, wartosc_umowy) VALUES
  (2, 1, 2, 'Aktywna', '2024-02-01', '2024-12-31', 0),      -- 9: Ramowa + Aktywna
  (2, 1, 2, 'Zakończona', '2023-02-01', '2023-12-31', 0),   -- 10: Ramowa + Zakończona
  (2, 1, 2, 'Anulowana', '2024-05-01', NULL, 0),            -- 11: Ramowa + Anulowana
  (2, 1, 2, 'Wstrzymana', '2024-10-01', NULL, 0),           -- 12: Ramowa + Wstrzymana
  (2, 2, 2, 'Aktywna', '2024-11-01', NULL, 0),              -- 13: Jednorazowa + Aktywna
  (2, 2, 2, 'Zakończona', '2024-06-01', NULL, 0),           -- 14: Jednorazowa + Zakończona
  (2, 2, 2, 'Anulowana', '2024-04-01', NULL, 0),            -- 15: Jednorazowa + Anulowana
  (2, 2, 2, 'Wstrzymana', '2024-09-01', NULL, 0);           -- 16: Jednorazowa + Wstrzymana

INSERT INTO pozycja_umowy (umowa_id, produkt_id, ilosc, jednostka, cena_jednostkowa) VALUES
  (9, 1, 150, 'kg', 3.50), (9, 4, 100, 'kg', 8.50), (9, 10, 50, 'kg', 18.00),
  (10, 5, 80, 'kg', 3.20), (10, 6, 70, 'kg', 6.50),
  (11, 7, 50, 'kg', 12.00), (11, 8, 40, 'kg', 2.80),
  (12, 9, 100, 'kg', 7.50), (12, 10, 80, 'kg', 18.00),
  (13, 7, 150, 'kg', 11.50), (13, 9, 100, 'kg', 7.00),
  (14, 1, 100, 'kg', 3.50), (14, 2, 80, 'kg', 4.20),
  (15, 3, 50, 'kg', 5.80), (15, 4, 30, 'kg', 8.50),
  (16, 5, 60, 'kg', 3.20), (16, 6, 50, 'kg', 6.50);

-- === Piotr Wiśniewski (ID 3) ===
INSERT INTO umowa (klient_id, typ_id, przedstawiciel_id, status, data_od, data_do, wartosc_umowy) VALUES
  (3, 1, 3, 'Aktywna', '2024-03-01', '2024-12-31', 0),      -- 17: Ramowa + Aktywna
  (3, 1, 3, 'Zakończona', '2023-03-01', '2023-12-31', 0),   -- 18: Ramowa + Zakończona
  (3, 1, 3, 'Anulowana', '2024-07-01', NULL, 0),            -- 19: Ramowa + Anulowana
  (3, 1, 3, 'Wstrzymana', '2024-11-01', NULL, 0),           -- 20: Ramowa + Wstrzymana
  (3, 2, 3, 'Aktywna', '2024-10-15', NULL, 0),              -- 21: Jednorazowa + Aktywna
  (3, 2, 3, 'Zakończona', '2024-05-01', NULL, 0),           -- 22: Jednorazowa + Zakończona
  (3, 2, 3, 'Anulowana', '2024-08-01', NULL, 0),            -- 23: Jednorazowa + Anulowana
  (3, 2, 3, 'Wstrzymana', '2024-09-15', NULL, 0);           -- 24: Jednorazowa + Wstrzymana

INSERT INTO pozycja_umowy (umowa_id, produkt_id, ilosc, jednostka, cena_jednostkowa) VALUES
  (17, 1, 200, 'kg', 3.50), (17, 2, 150, 'kg', 4.20), (17, 3, 180, 'kg', 5.80),
  (18, 7, 100, 'kg', 12.00), (18, 8, 120, 'kg', 2.80),
  (19, 9, 60, 'kg', 7.50), (19, 10, 40, 'kg', 18.00),
  (20, 1, 300, 'kg', 3.50), (20, 4, 200, 'kg', 8.50),
  (21, 9, 80, 'kg', 7.50), (21, 10, 60, 'kg', 18.00),
  (22, 1, 150, 'kg', 3.50), (22, 2, 100, 'kg', 4.20),
  (23, 5, 70, 'kg', 3.20), (23, 6, 60, 'kg', 6.50),
  (24, 7, 80, 'kg', 12.00), (24, 8, 50, 'kg', 2.80);

-- === Marek Zieliński (ID 4) ===
INSERT INTO umowa (klient_id, typ_id, przedstawiciel_id, status, data_od, data_do, wartosc_umowy) VALUES
  (1, 1, 4, 'Aktywna', '2024-06-01', '2025-05-31', 0),      -- 25: Ramowa + Aktywna
  (4, 1, 4, 'Zakończona', '2023-06-01', '2024-05-31', 0),   -- 26: Ramowa + Zakończona
  (4, 1, 4, 'Anulowana', '2024-09-01', NULL, 0),            -- 27: Ramowa + Anulowana
  (1, 1, 4, 'Wstrzymana', '2024-12-01', NULL, 0),           -- 28: Ramowa + Wstrzymana
  (1, 2, 4, 'Aktywna', '2024-11-15', NULL, 0),              -- 29: Jednorazowa + Aktywna
  (4, 2, 4, 'Zakończona', '2024-04-01', NULL, 0),           -- 30: Jednorazowa + Zakończona
  (1, 2, 4, 'Anulowana', '2024-07-01', NULL, 0),            -- 31: Jednorazowa + Anulowana
  (4, 2, 4, 'Wstrzymana', '2024-10-01', NULL, 0);           -- 32: Jednorazowa + Wstrzymana

INSERT INTO pozycja_umowy (umowa_id, produkt_id, ilosc, jednostka, cena_jednostkowa) VALUES
  (25, 1, 120, 'kg', 3.30), (25, 3, 100, 'kg', 5.50),
  (26, 6, 150, 'kg', 6.00), (26, 7, 80, 'kg', 12.00),
  (27, 8, 100, 'kg', 2.80), (27, 9, 50, 'kg', 7.50),
  (28, 10, 100, 'kg', 18.00), (28, 1, 200, 'kg', 3.50),
  (29, 10, 30, 'kg', 17.00), (29, 4, 50, 'kg', 8.50),
  (30, 2, 100, 'kg', 4.20), (30, 3, 80, 'kg', 5.80),
  (31, 5, 40, 'kg', 3.20), (31, 6, 30, 'kg', 6.50),
  (32, 7, 50, 'kg', 12.00), (32, 8, 60, 'kg', 2.80);

-- ===== ZDARZENIA =====

-- === Jan Kowalski (ID 1) - wszystkie typy i statusy ===
INSERT INTO zdarzenie (klient_id, przedstawiciel_id, typ_id, umowa_id, data_planowana, data_realizacji, status, opis, notatki)
VALUES
  -- Zrealizowane
  (1, 1, 1, NULL, '2024-01-05 10:00:00', '2024-01-05 10:15:00', 'zrealizowane',
   'Telefon - pierwszy kontakt', 'Klient zainteresowany ofertą ekologicznych warzyw'),
  (1, 1, 2, NULL, '2024-01-08 14:00:00', '2024-01-08 14:30:00', 'zrealizowane',
   'Wizyta w sklepie', 'Omówiono szczegóły współpracy'),
  (1, 1, 3, NULL, '2024-01-10 11:00:00', '2024-01-10 11:10:00', 'zrealizowane',
   'Follow-up po wizycie', 'Umowa podpisana!'),
  (1, 1, 4, 1, '2024-02-02 09:00:00', '2024-02-02 09:05:00', 'zrealizowane',
   'Telefon po dostawie', 'Klient bardzo zadowolony'),
  (5, 1, 5, NULL, '2024-03-01 08:00:00', '2024-03-01 08:00:00', 'zrealizowane',
   'Newsletter miesięczny', 'Wysłano ofertę promocyjną'),
  -- Zaplanowane
  (4, 1, 1, NULL, '2025-01-15 10:00:00', NULL, 'zaplanowane',
   'Telefon do nowego prospektu', 'Znaleziony w spisie firm Bio'),
  (4, 1, 2, NULL, '2025-01-20 14:00:00', NULL, 'zaplanowane',
   'Wizyta zaplanowana', NULL),
  (5, 1, 3, NULL, '2025-01-25 11:00:00', NULL, 'zaplanowane',
   'Follow-up z VIP', 'Sprawdzić decyzję zarządu'),
  -- Anulowane
  (1, 1, 2, NULL, '2024-06-15 10:00:00', NULL, 'odwołane',
   'Wizyta anulowana', 'Klient poprosił o przełożenie');

-- === Anna Nowak (ID 2) - wszystkie typy i statusy ===
INSERT INTO zdarzenie (klient_id, przedstawiciel_id, typ_id, umowa_id, data_planowana, data_realizacji, status, opis, notatki)
VALUES
  -- Zrealizowane
  (2, 2, 1, NULL, '2024-01-15 09:00:00', '2024-01-15 09:20:00', 'zrealizowane',
   'Kontakt telefoniczny', 'Kierownik zainteresowany zamówieniem'),
  (2, 2, 2, NULL, '2024-01-18 15:00:00', '2024-01-18 15:45:00', 'zrealizowane',
   'Wizyta w sklepie', 'Ceny konkurencji: kurczak 20 zł/kg'),
  (2, 2, 3, NULL, '2024-01-22 10:00:00', '2024-01-22 10:15:00', 'zrealizowane',
   'Follow-up po wizycie', 'Klient potwierdził zamówienie'),
  (2, 2, 4, 2, '2024-02-03 10:00:00', '2024-02-03 10:08:00', 'zrealizowane',
   'Telefon po dostawie', 'Klient zadowolony'),
  (2, 2, 5, NULL, '2024-03-01 08:00:00', '2024-03-01 08:00:00', 'zrealizowane',
   'Newsletter', 'Wysłano promocje na warzywa'),
  -- Zaplanowane
  (2, 2, 1, NULL, '2025-01-10 09:00:00', NULL, 'zaplanowane',
   'Telefon - nowa oferta', 'Przedstawić nowe produkty'),
  (2, 2, 2, NULL, '2025-01-18 14:00:00', NULL, 'zaplanowane',
   'Wizyta kwartalna', NULL),
  -- Anulowane
  (2, 2, 3, NULL, '2024-05-10 11:00:00', NULL, 'odwołane',
   'Follow-up anulowany', 'Klient był niedostępny');

-- === Piotr Wiśniewski (ID 3) - wszystkie typy i statusy ===
INSERT INTO zdarzenie (klient_id, przedstawiciel_id, typ_id, umowa_id, data_planowana, data_realizacji, status, opis, notatki)
VALUES
  -- Zrealizowane
  (3, 3, 1, NULL, '2024-02-08 09:00:00', '2024-02-08 09:15:00', 'zrealizowane',
   'Telefon wstępny', 'Umówiono spotkanie'),
  (3, 3, 2, NULL, '2024-02-10 11:00:00', '2024-02-10 11:30:00', 'zrealizowane',
   'Wizyta w firmie', 'Spotkanie z prezes'),
  (3, 3, 3, NULL, '2024-02-12 14:00:00', '2024-02-12 14:15:00', 'zrealizowane',
   'Follow-up telefoniczny', 'Wysłano ofertę'),
  (3, 3, 4, 3, '2024-03-05 09:00:00', '2024-03-05 09:10:00', 'zrealizowane',
   'Kontrola po dostawie', 'Wszystko OK'),
  (3, 3, 5, NULL, '2024-04-01 08:00:00', '2024-04-01 08:00:00', 'zrealizowane',
   'Newsletter kwietniowy', 'Promocja na owoce'),
  -- Zaplanowane
  (3, 3, 2, NULL, '2025-01-12 10:00:00', NULL, 'zaplanowane',
   'Wizyta kontrolna', 'Sprawdzić satysfakcję'),
  (3, 3, 4, 3, '2025-01-20 09:00:00', NULL, 'zaplanowane',
   'Telefon po dostawie', NULL),
  -- Anulowane
  (3, 3, 1, NULL, '2024-07-20 10:00:00', NULL, 'odwołane',
   'Telefon anulowany', 'Zmiana terminu na prośbę klienta');

-- === Marek Zieliński (ID 4) - wszystkie typy i statusy ===
INSERT INTO zdarzenie (klient_id, przedstawiciel_id, typ_id, umowa_id, data_planowana, data_realizacji, status, opis, notatki)
VALUES
  -- Zrealizowane
  (1, 4, 1, NULL, '2024-06-01 09:00:00', '2024-06-01 09:20:00', 'zrealizowane',
   'Telefon - nowa oferta', 'Przedstawiono sezonowe produkty'),
  (1, 4, 2, NULL, '2024-06-05 14:00:00', '2024-06-05 14:45:00', 'zrealizowane',
   'Wizyta handlowa', 'Omówiono rozszerzenie współpracy'),
  (1, 4, 3, NULL, '2024-06-08 10:00:00', '2024-06-08 10:10:00', 'zrealizowane',
   'Follow-up', 'Klient potwierdził zwiększenie zamówienia'),
  (1, 4, 4, 1, '2024-06-15 09:00:00', '2024-06-15 09:05:00', 'zrealizowane',
   'Telefon po dostawie', 'Wszystko w porządku'),
  (1, 4, 5, NULL, '2024-07-01 08:00:00', '2024-07-01 08:00:00', 'zrealizowane',
   'Newsletter lipcowy', 'Promocja letnia'),
  -- Zaplanowane
  (4, 4, 1, NULL, '2025-01-08 10:00:00', NULL, 'zaplanowane',
   'Telefon do prospektu', 'Pierwszy kontakt'),
  (4, 4, 2, NULL, '2025-01-15 11:00:00', NULL, 'zaplanowane',
   'Wizyta prezentacyjna', NULL),
  (1, 4, 5, NULL, '2025-02-01 08:00:00', NULL, 'zaplanowane',
   'Newsletter lutowy', 'Do wysłania'),
  -- Anulowane
  (1, 4, 2, NULL, '2024-08-10 14:00:00', NULL, 'odwołane',
   'Wizyta anulowana', 'Urlop klienta');

COMMIT;

-- Wyświetlenie podsumowania
SELECT 'Dane inicjalizacyjne zostały pomyślnie załadowane!' as status;
SELECT COUNT(*) as "Liczba klientów" FROM klient;
SELECT COUNT(*) as "Liczba umów" FROM umowa;
SELECT COUNT(*) as "Liczba zdarzeń" FROM zdarzenie;
SELECT COUNT(*) as "Liczba produktów" FROM produkt;
SELECT COUNT(*) as "Liczba przedstawicieli" FROM przedstawiciel_handlowy;
