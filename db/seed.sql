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
  ('Jan', 'Kowalski', 'jan.kowalski@firmx.pl', '601234567', 1, '2023-01-15', true, '$2a$10$D7HcQe5AFX4r8EkzMZBIruZvH6pMIqiElw7S2HUVF9HLXxG2UJ5f.', 'szef'),
  ('Anna', 'Nowak', 'anna.nowak@firmx.pl', '602345678', 2, '2023-02-01', true, '$2a$10$D7HcQe5AFX4r8EkzMZBIruZvH6pMIqiElw7S2HUVF9HLXxG2UJ5f.', 'pracownik'),
  ('Piotr', 'Wiśniewski', 'piotr.wisniewski@firmx.pl', '603456789', 3, '2023-03-10', true, '$2a$10$D7HcQe5AFX4r8EkzMZBIruZvH6pMIqiElw7S2HUVF9HLXxG2UJ5f.', 'pracownik');

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

-- Klient 5 - Sieć "FreshMart"
INSERT INTO adres (ulica, numer_budynku, kod_pocztowy, miejscowosc, wojewodztwo)
VALUES ('Centralna', '50', '61-500', 'Poznań', 'wielkopolskie');

INSERT INTO klient (nip, nazwa_firmy, imie, nazwisko, stanowisko, email, telefon, adres_id, status_klienta_id)
VALUES ('5678901234', 'FreshMart Sp. z o.o.', 'Michał', 'Kamiński', 'dyrektor zakupów',
        'zakupy@freshmart.pl', '617777777', 5, 4);

-- ===== UMOWY =====
-- Umowa 1 - Sklep "U Janka"
INSERT INTO umowa (klient_id, typ_id, przedstawiciel_id, status, data_od, data_do, wartosc_umowy)
VALUES (1, 1, 1, 'aktywna', '2024-01-01', '2024-12-31', 15000.00);

INSERT INTO pozycja_umowy (umowa_id, produkt_id, ilosc, jednostka, cena_jednostkowa)
VALUES
  (1, 1, 100, 'kg', 3.50),
  (1, 2, 50, 'kg', 4.20),
  (1, 3, 80, 'kg', 5.80);

-- Umowa 2 - Delikatesy "Smak"
INSERT INTO umowa (klient_id, typ_id, przedstawiciel_id, status, data_od, data_do, wartosc_umowy)
VALUES (2, 1, 2, 'aktywna', '2024-02-01', '2024-12-31', 25000.00);

INSERT INTO pozycja_umowy (umowa_id, produkt_id, ilosc, jednostka, cena_jednostkowa)
VALUES
  (2, 1, 150, 'kg', 3.50),
  (2, 4, 100, 'kg', 8.50),
  (2, 5, 80, 'kg', 3.20),
  (2, 10, 50, 'kg', 18.00);

-- Umowa 3 - "Zdrowa Żywność"
INSERT INTO umowa (klient_id, typ_id, przedstawiciel_id, status, data_od, data_do, wartosc_umowy)
VALUES (3, 1, 3, 'aktywna', '2024-03-01', '2024-12-31', 35000.00);

INSERT INTO pozycja_umowy (umowa_id, produkt_id, ilosc, jednostka, cena_jednostkowa)
VALUES
  (3, 1, 200, 'kg', 3.50),
  (3, 2, 150, 'kg', 4.20),
  (3, 3, 180, 'kg', 5.80),
  (3, 7, 100, 'kg', 12.00),
  (3, 9, 80, 'kg', 7.50);

-- ===== ZDARZENIA =====
-- Zdarzenia dla klienta 1
INSERT INTO zdarzenie (klient_id, przedstawiciel_id, typ_id, umowa_id, data_planowana, data_realizacji, status, opis, notatki)
VALUES
  (1, 1, 1, NULL, '2024-01-05 10:00:00', '2024-01-05 10:15:00', 'zrealizowane',
   'Pierwszy kontakt telefoniczny', 'Klient zainteresowany ofertą ekologicznych warzyw'),

  (1, 1, 2, NULL, '2024-01-08 14:00:00', '2024-01-08 14:30:00', 'zrealizowane',
   'Wizyta w sklepie - prezentacja oferty', 'Omówiono szczegóły współpracy. Klient notował ceny konkurencji: ziemniaki 4.00 zł/kg'),

  (1, 1, 3, NULL, '2024-01-10 11:00:00', '2024-01-10 11:10:00', 'zrealizowane',
   'Follow-up po wizycie', 'Przedstawiono lepszą ofertę cenową. Umowa podpisana!'),

  (1, 1, 4, 1, '2024-02-02 09:00:00', '2024-02-02 09:05:00', 'zrealizowane',
   'Telefon po pierwszej dostawie', 'Wszystko OK, klient bardzo zadowolony z jakości');

-- Zdarzenia dla klienta 2
INSERT INTO zdarzenie (klient_id, przedstawiciel_id, typ_id, umowa_id, data_planowana, data_realizacji, status, opis, notatki)
VALUES
  (2, 2, 1, NULL, '2024-01-15 09:00:00', '2024-01-15 09:20:00', 'zrealizowane',
   'Kontakt telefoniczny', 'Kierownik zainteresowany dużym zamówieniem'),

  (2, 2, 2, NULL, '2024-01-18 15:00:00', '2024-01-18 15:45:00', 'zrealizowane',
   'Wizyta w sklepie', 'Ceny konkurencji: kurczak 20 zł/kg, papryka 13 zł/kg. Nasza oferta lepsza!'),

  (2, 2, 4, 2, '2024-02-03 10:00:00', '2024-02-03 10:08:00', 'zrealizowane',
   'Telefon po dostawie', 'Klient zadowolony, chce zwiększyć zamówienie');

-- Zdarzenia dla klienta 3
INSERT INTO zdarzenie (klient_id, przedstawiciel_id, typ_id, umowa_id, data_planowana, data_realizacji, status, opis, notatki)
VALUES
  (3, 3, 2, NULL, '2024-02-10 11:00:00', '2024-02-10 11:30:00', 'zrealizowane',
   'Wizyta w firmie', 'Spotkanie z prezes. Omówiono potrzeby i możliwości współpracy'),

  (3, 3, 1, NULL, '2024-02-12 14:00:00', '2024-02-12 14:15:00', 'zrealizowane',
   'Follow-up telefoniczny', 'Wysłano ofertę. Prezes zainteresowana długoterminową współpracą'),

  (3, 3, 4, 3, '2024-03-05 09:00:00', '2024-03-05 09:10:00', 'zrealizowane',
   'Kontrola jakości po dostawie', 'Wszystko zgodne z oczekiwaniami');

-- Zdarzenia dla potencjalnego klienta 4
INSERT INTO zdarzenie (klient_id, przedstawiciel_id, typ_id, data_planowana, status, opis, notatki)
VALUES
  (4, 1, 1, '2024-12-15 10:00:00', 'zaplanowane',
   'Pierwszy kontakt z potencjalnym klientem', 'Znaleziony w spisie firm Bio'),

  (4, 1, 2, '2024-12-20 14:00:00', 'zaplanowane',
   'Wizyta zaplanowana po rozmowie telefonicznej', NULL);

-- Zdarzenia dla klienta VIP
INSERT INTO zdarzenie (klient_id, przedstawiciel_id, typ_id, umowa_id, data_planowana, data_realizacji, status, opis, notatki)
VALUES
  (5, 1, 2, NULL, '2024-11-01 10:00:00', '2024-11-01 10:45:00', 'zrealizowane',
   'Spotkanie z dyrektorem zakupów sieci', 'Duży potencjał - sieć 15 sklepów'),

  (5, 1, 3, NULL, '2024-11-05 15:00:00', '2024-11-05 15:20:00', 'zrealizowane',
   'Follow-up', 'Wysłano szczegółową ofertę. Czekamy na decyzję zarządu');

-- ===== DODATKOWE UMOWY DO STATYSTYK =====
-- Umowa z FreshMart (VIP) - w trakcie negocjacji
INSERT INTO umowa (klient_id, typ_id, przedstawiciel_id, status, data_od, wartosc_umowy)
VALUES (5, 1, 1, 'w negocjacji', '2025-01-01', 0.00);

COMMIT;

-- Wyświetlenie podsumowania
SELECT 'Dane inicjalizacyjne zostały pomyślnie załadowane!' as status;
SELECT COUNT(*) as "Liczba klientów" FROM klient;
SELECT COUNT(*) as "Liczba umów" FROM umowa;
SELECT COUNT(*) as "Liczba zdarzeń" FROM zdarzenie;
SELECT COUNT(*) as "Liczba produktów" FROM produkt;
SELECT COUNT(*) as "Liczba przedstawicieli" FROM przedstawiciel_handlowy;
