
# Instrukcje i Niestandardowe Polecenia dla AI

Ten plik służy do zachowania ciągłości pracy nad projektem pomiędzy sesjami. Zawiera definicje poleceń specyficznych dla tego projektu, które AI powinna umieć wykonać na żądanie użytkownika.

---

## Ważne Definicje Danych

### Struktura Danych PPK
W plikach CSV oraz logice aplikacji dla portfela PPK obowiązuje następująca definicja zysku:
*   **Całkowity Zysk (Profit)** = Zysk z Funduszu + Wpłaty Pracodawcy + Dopłaty Państwa.
*   Oznacza to, że "Całkowity Zysk" to wszystko, co użytkownik posiada ponad swój własny wkład ("Pracownik").
*   Przy wizualizacji struktury kapitału (np. wykresy skumulowane), aby składniki sumowały się do 100% Wartości Portfela, należy używać: **Wkład Pracownika + Wkład Pracodawcy + Dopłaty Państwa + Zysk Funduszu**. Nie należy używać "Całkowitego Zysku" jako osobnej warstwy w sumowaniu, ponieważ zawiera on już w sobie Pracodawcę i Państwo.

---

## NOWE: Model Hybrydowy (Transakcje + Wycena + Snapshoty)

Aplikacja działa w trybie Offline, ale dane są aktualizowane w modelu hybrydowym. Głównym plikiem stanu bieżącego jest `CSV/OMF.ts`.

### Polecenie: `RejestrujTransakcje`

**Wyzwalacz:** Użytkownik opisuje transakcję naturalnym językiem.
*   *Przykład 1:* "Kupiłem 0,25 akcji AMZN za 300zł na IKE dnia 2025-05-01".
*   *Przykład 2:* "Wpłata PPK 300zł" (lub "Kupno PPK za 300zł").

**Zasada Kosztu:**
Użytkownik podaje **KWOTĘ CAŁKOWITĄ (KOSZT)** jaką poniósł, a nie cenę jednostkową.
*   Jeżeli użytkownik pisze "za 300zł", oznacza to, że `Wartość Zakupu` wzrasta o 300 PLN.

**Procedura:**
1.  **Analiza:** Zidentyfikuj: Typ (Kupno/Sprzedaż), Symbol (np. AMZN, PPK), Ilość (jeśli podana), Koszt Całkowity (PLN), Datę, Portfel.
2.  **Edycja `CSV/OMF.ts`:**
    *   Znajdź odpowiedni wiersz dla danego aktywa (Symbol + Portfel). Jeśli nie istnieje, utwórz nowy.
    *   **Kupno:**
        *   `Ilość`: Dodaj podaną ilość do obecnej.
        *   `Wartość Zakupu`: Dodaj podany **Koszt Całkowity** do obecnej wartości zakupu.
        *   `Ostatni zakup`: Zaktualizuj datę.
        *   `Obecna Wartość`: Tymczasowo dodaj **Koszt Całkowity** do `Obecna Wartość` (aby zachować spójność do czasu następnej aktualizacji cen rynkowych).
    *   **Sprzedaż:**
        *   `Ilość`: Odejmij sprzedaną ilość.
        *   `Wartość Zakupu`: Zmniejsz proporcjonalnie do sprzedanej ilości.
        *   Jeśli `Ilość` == 0, zmień `Status pozycji` na "Zamknięta", a wynik przenieś do `Zysk/Strata`.
3.  **Dla PPK:** Traktuj "Wpłatę" lub "Kupno" jako zwiększenie `Wartość Zakupu` i `Obecna Wartość` w wierszu PPK w `OMF.ts`.
4.  **Raport:** Potwierdź wykonanie zmian w pliku, wymieniając zaktualizowane wartości.

### Polecenie: `AktualizujCeny`

**Wyzwalacz:** Użytkownik wkleja listę cen (np. z Google Sheets: "Symbol, Cena") lub pisze "Aktualizuj ceny używając fallback".

**Zasada Walutowa (PLN):**
Wszystkie ceny jednostkowe (lub wartości całościowe) podawane przez użytkownika w tym poleceniu są już **przeliczone na PLN**.
*   AI **nie powinna** dokonywać przeliczania walut (np. USD na PLN), chyba że użytkownik wyraźnie o to poprosi w treści wiadomości.
*   Przyjmujemy: `Cena wejściowa` = `Cena w PLN`.

**Procedura:**
1.  **Źródło Cen:**
    *   Jeśli użytkownik podał dane: Sparsuj je do mapy `Symbol -> Cena Rynkowa (PLN)`.
    *   Jeśli nie: Załaduj ceny z `constants/fallbackPrices.ts`.
2.  **Iteracja `CSV/OMF.ts`:**
    *   Przejdź przez każdy wiersz o statusie "Otwarta".
    *   Znajdź cenę dla danego `Symbolu`.
    *   **Obliczenia:**
        *   *Akcje/Krypto/ETF:* `Nowa Obecna Wartość = Ilość * Cena Rynkowa (PLN)`.
        *   *PPK:* Jeśli podano cenę dla "PPK", traktuj ją jako **całkowitą wartość portfela** (chyba że użytkownik i dane operują na jednostkach uczestnictwa, wtedy `Ilość * Cena`).
    *   Zaktualizuj kolumnę `Obecna Wartość`.
    *   Przelicz pochodne: `Zysk/Strata` (`Obecna Wartość - Wartość Zakupu`) oraz `ROI`.
3.  **Zapis:** Zaktualizuj treść `OMF_DATA` w pliku `CSV/OMF.ts`.

### Polecenie: `ZamknijMiesiac`

**Wyzwalacz:** "Zamknij miesiąc [Nazwa] z datą [RRRR-MM-DD]".

**Cel:** Utworzenie "Snapshotu" historycznego dla wykresów IKE, Krypto oraz PPK na podstawie aktualnego stanu OMF.

**Procedura:**
1.  **Agregacja z `CSV/OMF.ts`:**
    *   Pobierz aktualne dane.
    *   Podziel aktywa na grupy: **PPK**, **IKE** oraz **Krypto**.
2.  **Obliczenia i Zapis (dla każdej grupy):**
    *   **IKE i Krypto:**
        *   `Suma Wkładu` = Suma `Wartość Zakupu` wszystkich otwartych pozycji.
        *   `Suma Wartości` = Suma `Obecna Wartość` wszystkich otwartych pozycji (+ Gotówka).
        *   `Zysk` = `Suma Wartości` - `Suma Wkładu`.
        *   `ROI` = `(Zysk / Suma Wkładu) * 100`.
        *   **Akcja:** Dopisz wiersz do `CSV/IKE.ts` lub `CSV/Krypto.ts`: `Data, Suma Wkładu, Zysk, ROI`.
    *   **PPK:**
        *   Pobierz wiersz PPK z OMF.
        *   `Pracownik` = `OMF.Wartość Zakupu`.
        *   `Wartość Portfela` = `OMF.Obecna Wartość`.
        *   *Uwaga:* Składniki `Pracodawca` i `Państwo` nie są w OMF. Pobierz je z **ostatniego wiersza** w `CSV/PPK.ts` (zakładamy brak zmian, chyba że użytkownik poda inaczej w poleceniu).
        *   `Zysk Funduszu` = `Wartość Portfela` - `Pracownik` - `Pracodawca` - `Państwo`.
        *   `Całkowity Zysk` = `Wartość Portfela` - `Pracownik`.
        *   `Podatek` = (jeśli `Zysk Funduszu` > 0) ? `Zysk Funduszu * 0.19` : 0. (Ze znakiem minus dla display).
        *   Oblicz `ROI` i `Exit ROI` wg standardowych wzorów PPK.
        *   **Akcja:** Dopisz wiersz do `CSV/PPK.ts` zachowując format CSV (Data, Pracownik, Pracodawca, Państwo, Zysk Funduszu, Całkowity Zysk, Podatek, ROI, Exit ROI).
4.  **Raport:** Poinformuj o zaktualizowaniu plików historycznych.

---

## Polecenia Pomocnicze

### Polecenie: `ChangeLogos`
*Automatyzacja konwersji SVG na komponenty React.*
1. Skanuj folder `logos/` w poszukiwaniu `.svg`.
2. Konwertuj każdy plik na komponent `.tsx` (np. `ETHLogo.tsx`).
3. Zachuj `viewBox` i przenieś atrybuty do JSX (`fill-rule` -> `fillRule`).

### Polecenie: `UpdateDate`
*Ręczna zmiana daty ostatniej aktualizacji.*
1. Zaktualizuj plik `constants/appData.ts`.
2. Ustaw zmienną `DATA_LAST_UPDATED` na podaną datę.

### Polecenie: `UpdateCSV`
*Awaryjne nadpisanie całych plików danych (Stary tryb).*
1. Jeśli użytkownik dostarczy pełne pliki CSV, nadpisz odpowiednie pliki w `CSV/*.ts`.
