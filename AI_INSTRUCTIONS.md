
# Instrukcje i Niestandardowe Polecenia dla AI

Ten plik służy do zachowania ciągłości pracy nad projektem pomiędzy sesjami. Zawiera definicje poleceń specyficznych dla tego projektu, które AI powinna umieć wykonać na żądanie użytkownika.

---

## Ważne Definicje Danych

### Struktura Danych PPK
W plikach CSV oraz logice aplikacji dla portfela PPK obowiązuje następująca definicja zysku:
*   **Całkowity Zysk (Profit)** = Zysk z Funduszu + Wpłaty Pracodawcy + Dopłaty Państwa.
*   Oznacza to, że "Całkowity Zysk" to wszystko, co użytkownik posiada ponad swój własny wkład ("Pracownik").
*   Przy wizualizacji struktury kapitału (np. wykresy skumulowane), aby składniki sumowały się do 100% Wartości Portfela, należy używać: **Wkład Pracownika + Wkład Pracodawcy + Dopłaty Państwa + Zysk Funduszu**. Nie należy używać "Całkowitego Zysku" jako osobnej warstwy w sumowaniu, ponieważ zawiera on już w sobie Pracodawcę i Państwo.

### OMF - Wkład Własny w PPK
W pliku `OMF.ts`, kolumna `Wartość Zakupu` dla wiersza PPK reprezentuje **wyłącznie** wkład własny pracownika (składki potrącone z pensji). Wpłaty pracodawcy i państwa nie są wliczane do tej kolumny, aby zachować spójność z definicją "Zainwestowanego Kapitału" użytkownika.

### OMF - Zainwestowany Kapitał w IKE i Krypto (Efekt Kuli Śnieżnej)
W pliku `OMF.ts` oraz w wyliczeniach historycznych dla portfeli **IKE** oraz **Krypto**, obowiązuje specjalna zasada obliczania **Wkładu (Zainwestowano)**, aby uwzględnić efekt reinwestycji zysków (Kula Śnieżna):
*   **Formuła:** `Wkład = Suma(Wartość Zakupu Aktywów Otwartych) - Suma(Zysk z Aktywów Zamkniętych)`.
*   **Cel:** Ponieważ zysk z zamkniętych pozycji jest reinwestowany w nowe pozycje (zwiększając ich `Wartość Zakupu`), musimy odjąć ten zrealizowany zysk, aby uzyskać kwotę faktycznie wpłaconą "z zewnątrz" (z kieszeni użytkownika).

---

## NOWE: Model Hybrydowy (Transakcje + Wycena + Snapshoty)

Aplikacja działa w trybie Offline, ale dane są aktualizowane w modelu hybrydowym. Głównym plikiem stanu bieżącego jest `CSV/OMF.ts`.

### Polecenie: `RejestrujTransakcje`

**Wyzwalacz:** Użytkownik opisuje transakcję naturalnym językiem.
*   *Przykład 1:* "Kupiłem 0,25 akcji AMZN za 300zł na IKE dnia 2025-05-01".
*   *Przykład 2:* "Kupno PPK: 1.2 jednostki Pracownik po 50zł, 0.8 jednostki Pracodawca po 50zł".

**Zasada Kosztu:**
Użytkownik podaje **KWOTĘ CAŁKOWITĄ (KOSZT)** w PLN lub **ILOŚĆ JEDNOSTEK i CENĘ JEDNOSTKOWĄ**.

**Procedura:**
1.  **Analiza:** Zidentyfikuj: Typ (Kupno/Sprzedaż), Symbol (np. AMZN, PPK), Ilość, Koszt Całkowity (PLN), Datę, Portfel. Dla PPK zidentyfikuj Źródło: "Pracownik", "Pracodawca" lub "Państwo".
2.  **Edycja `CSV/OMF.ts` (Stan Bieżący):**
    *   **Znajdź wiersz:** Szukaj wiersza pasującego do Symbolu i Portfela, który ma `Status pozycji` równy **"Otwarta"** (lub "Gotówka" dla walut).
        *   **WAŻNE:** Ignoruj wiersze ze statusem "Zamknięta". Jeśli istnieje tylko zamknięta pozycja dla tego symbolu, lub brak pozycji -> **Utwórz nowy wiersz** na końcu sekcji danego portfela ze statusem "Otwarta".
    *   **Kupno (Standardowe):**
        *   `Ilość`: Dodaj podaną ilość do obecnej.
        *   `Wartość Zakupu`: Dodaj podany koszt do obecnej wartości zakupu.
        *   `Obecna Wartość`: **DODAJ** podany koszt do `Obecna Wartość` (utrzymanie wyceny w momencie zakupu).
        *   `Ostatni zakup`: Zaktualizuj datę.
        *   `Zysk` i `ROI`: Przelicz na podstawie nowych wartości.
    *   **Kupno (PPK - Specjalne):**
        *   **Oblicz:** Koszt Transakcji = Ilość * Cena (lub podana kwota).
        *   **Aktualizuj `Ilość`:** Zawsze dodaj Nowe Jednostki do `OMF.Ilość`.
        *   **Aktualizuj `Obecna Wartość`:** DODAJ Koszt Transakcji do `OMF.Obecna Wartość` (niezależnie od źródła).
        *   **Aktualizuj `Wartość Zakupu`:**
            *   Jeśli źródło to **Pracownik**: DODAJ Koszt Transakcji do `OMF.Wartość Zakupu`.
            *   Jeśli źródło to **Pracodawca** lub **Państwo**: **NIE** zmieniaj `OMF.Wartość Zakupu`.
3.  **Natychmiastowa Synchronizacja Historii (`CSV/PPK.ts`, `CSV/Krypto.ts`, `CSV/IKE.ts`):**
    *   Zidentyfikuj plik historii odpowiadający portfelowi.
    *   **Agregacja:** Oblicz sumy dla danego portfela na podstawie zaktualizowanego `OMF.ts` (tylko pozycje 'Otwarta'/'Gotówka').
    *   **Aktualizacja:** Znajdź **ostatni wiersz** w odpowiednim pliku historii.
        *   **IKE/Krypto:**
            *   `Wkład` = Suma(`Wartość Zakupu` Otwartych) - Suma(`Zysk` Zamkniętych).
            *   `Zysk` = Suma(`Obecna Wartość` Otwartych) - `Wkład`.
            *   `ROI` = (Zysk / Wkład) * 100.
        *   **PPK:**
            *   Zidentyfikuj, czy transakcja dotyczyła Pracownika, Pracodawcy czy Państwa.
            *   **Jeśli Pracownik:** Zwiększ kolumnę `Pracownik` w ostatnim wierszu o kwotę wpłaty.
            *   **Jeśli Pracodawca:** Zwiększ kolumnę `Pracodawca` w ostatnim wierszu o kwotę wpłaty.
            *   **Jeśli Państwo:** Zwiększ kolumnę `Państwo` w ostatnim wierszu o kwotę wpłaty.
            *   **Zawsze:** Zwiększ `Wartość Całkowita` w ostatnim wierszu o kwotę wpłaty.
            *   **Przelicz:** `Zysk Funduszu` = `Wartość Całkowita` - (`Pracownik` + `Pracodawca` + `Państwo`).
4.  **Logowanie Transakcji (`CSV/Transactions.ts`):**
    *   Dopisz nowy wiersz na końcu pliku `CSV/Transactions.ts`.
    *   **Format:** `Data,Portfel,Typ,Symbol,Ilość,Koszt,Waluta`.
    *   *Przykład:* `2025-11-24,PPK,Kupno,Pracodawca,0.5,75 zł,PLN`.
5.  **Raport:** Potwierdź zmiany w OMF i historii.

### Polecenie: `AktualizujCeny`

**Wyzwalacz:** Użytkownik wkleja listę cen (np. z Google Sheets: "Symbol, Cena") lub pisze "Aktualizuj ceny używając fallback".

**Zasada Walutowa (PLN):**
Wszystkie ceny podawane przez użytkownika są już **w PLN**.

**Procedura:**
1.  **Źródło Cen:**
    *   Jeśli podano dane: Sparsuj do `Symbol -> Cena` i zaktualizuj `constants/fallbackPrices.ts`.
    *   Brak danych: Użyj `constants/fallbackPrices.ts`.
2.  **Edycja `CSV/OMF.ts`:**
    *   Iteruj przez wiersze (tylko `Status: Otwarta` / `Gotówka`).
    *   **Oblicz:**
        *   Dla aktywów z ilością > 0: `Nowa Obecna Wartość = Ilość * Cena`.
        *   Dla aktywów kwotowych (np. PPK jeśli brak ilości, Gotówka): `Nowa Obecna Wartość = Podana Cena`.
    *   **Zaktualizuj:** Nadpisz `Obecna wartość`. Przelicz `Zysk` i `ROI`.
3.  **Synchronizacja Historii (Ostatni Miesiąc):**
    *   Dla każdego portfela (PPK, IKE, Krypto) zsumuj `Obecna Wartość` z OMF (tylko Otwarte).
    *   **IKE/Krypto:** Oblicz `Wkład` = Suma(Otwarta.WartośćZakupu) - Suma(Zamknięta.Zysk).
    *   **PPK:** Pobierz `Wartość Zakupu` (Pracownik) z OMF.
    *   Zaktualizuj **ostatni wiersz** w plikach historii (`CSV/IKE.ts` itd.) wpisując nowe sumy wartości i przeliczając Zysk/ROI.
4.  **Raport:** Podaj nową wartość portfela.

### Polecenie: `ZamknijMiesiac`

**Wyzwalacz:** "Zamknij miesiąc [Nazwa] z datą [RRRR-MM-DD]".

**Procedura:**
1.  **Agregacja z `CSV/OMF.ts`:**
    *   Oblicz sumy `Obecna Wartość` dla każdego portfela (Tylko Otwarte/Gotówka).
    *   Oblicz `Wartość Zakupu` (Wkład) wg zasad specyficznych (PPK = Tylko Pracownik; IKE/Krypto = Otwarte.Zakup - Zamknięte.Zysk).
2.  **Edycja plików historii:**
    *   Dopisz **nowy wiersz** na końcu każdego pliku z podaną datą.
    *   **IKE/Krypto:** `Wkład` (skorygowany), `Zysk` (Wartość - Wkład), `ROI`.
    *   **PPK:**
        *   `Pracownik`: Suma `Wartość Zakupu` z OMF.
        *   `Pracodawca` i `Państwo`: Przepisz z poprzedniego miesiąca (chyba że masz info o zmianie w transakcjach).
        *   `Wartość Całkowita`: Suma `Obecna Wartość` PPK z OMF.
        *   `Zysk Funduszu`: Różnica Wartości i sumy składek.
3.  **Raport:** Potwierdź utworzenie snapshotu.

### Polecenie: `UpdateDate`

**Wyzwalacz:** "UpdateDate [RRRR-MM-DD]"
**Procedura:** Zaktualizuj stałą `DATA_LAST_UPDATED` w pliku `constants/appData.ts`.
