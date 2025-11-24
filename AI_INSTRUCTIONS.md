
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
W pliku `OMFopen.ts`, kolumna `Wartość Zakupu` dla wiersza PPK reprezentuje **wyłącznie** wkład własny pracownika (składki potrącone z pensji). Wpłaty pracodawcy i państwa nie są wliczane do tej kolumny, aby zachować spójność z definicją "Zainwestowanego Kapitału" użytkownika.

### OMF - Zainwestowany Kapitał w IKE i Krypto (Efekt Kuli Śnieżnej)
W pliku `OMFopen.ts` oraz w wyliczeniach historycznych dla portfeli **IKE** oraz **Krypto**, obowiązuje specjalna zasada obliczania **Wkładu (Zainwestowano)**, aby uwzględnić efekt reinwestycji zysków (Kula Śnieżna):
*   **Formuła:** `Wkład = Suma(Wartość Zakupu z OMFopen.ts) - Suma(Zysk z OMFclosed.ts)`.
*   **Cel:** Ponieważ zysk z zamkniętych pozycji jest reinwestowany w nowe pozycje (zwiększając ich `Wartość Zakupu`), musimy odjąć ten zrealizowany zysk, aby uzyskać kwotę faktycznie wpłaconą "z zewnątrz" (z kieszeni użytkownika).

---

## NOWE: Model Hybrydowy (Transakcje + Wycena + Snapshoty)

Aplikacja działa w trybie Offline, ale dane są aktualizowane w modelu hybrydowym. Dane stanu bieżącego są podzielone na:
*   `CSV/OMFopen.ts`: Aktywne pozycje i Gotówka.
*   `CSV/OMFclosed.ts`: Zamknięte (historyczne) pozycje.

### Polecenie: `RejestrujTransakcje`

**Wyzwalacz:** Użytkownik opisuje transakcję naturalnym językiem.
*   *Przykład 1:* "Kupiłem 0,25 akcji AMZN za 300zł na IKE dnia 2025-05-01".
*   *Przykład 2:* "Sprzedałem BTC za 3000zł (zysk 500zł) na Krypto".

**Zasada Kosztu:**
Użytkownik podaje **KWOTĘ CAŁKOWITĄ (KOSZT)** w PLN lub **ILOŚĆ JEDNOSTEK i CENĘ JEDNOSTKOWĄ**.

**Procedura:**
1.  **Analiza:** Zidentyfikuj: Typ (Kupno/Sprzedaż), Symbol, Ilość, Kwotę, Datę, Portfel.
2.  **KUPNO (Edycja `CSV/OMFopen.ts`):**
    *   **Znajdź wiersz:** Szukaj wiersza pasującego do Symbolu i Portfela w `OMFopen.ts`.
        *   Jeśli istnieje -> Zaktualizuj `Ilość`, `Wartość Zakupu` (dodaj koszt), `Obecna Wartość` (dodaj koszt), `Ostatni zakup`.
        *   Jeśli nie istnieje -> **Utwórz nowy wiersz** na końcu pliku `OMFopen.ts` ze statusem "Otwarta".
3.  **SPRZEDAŻ (Edycja `CSV/OMFopen.ts` i `CSV/OMFclosed.ts`):**
    *   **Znajdź wiersz:** Szukaj wiersza w `OMFopen.ts`.
    *   **Częściowa:** Zmniejsz `Ilość` i `Wartość Zakupu`. Przenieś odpowiednią część zysku/straty do `OMFclosed.ts` jako nowy wiersz.
    *   **Całkowita:**
        *   Usuń wiersz z `CSV/OMFopen.ts`.
        *   Dodaj wiersz do `CSV/OMFclosed.ts` ze statusem "Zamknięta".
        *   Ustaw `Data sprzedaży` jako datę transakcji (zamiast Ostatni Zakup).
        *   `Obecna Wartość` = Kwota Sprzedaży.
        *   `Zysk` = Kwota Sprzedaży - Wartość Zakupu.
4.  **Synchronizacja Historii (`CSV/PPK.ts`, `CSV/Krypto.ts`, `CSV/IKE.ts`):**
    *   Zaktualizuj ostatni wiersz w odpowiednim pliku historii, przeliczając sumy z `OMFopen` i `OMFclosed`.
5.  **Logowanie Transakcji (`CSV/Transactions.ts`):**
    *   Dopisz wiersz do logu transakcji.

### Polecenie: `AktualizujCeny`

**Wyzwalacz:** Użytkownik wkleja listę cen (np. z Google Sheets: "Symbol, Cena") lub pisze "Aktualizuj ceny".

**Procedura:**
1.  **Źródło Cen:**
    *   Jeśli podano dane: Zaktualizuj `constants/fallbackPrices.ts`.
    *   Brak danych: Użyj istniejących w `fallbackPrices.ts`.
2.  **Edycja `CSV/OMFopen.ts`:**
    *   Iteruj przez wiersze w `OMFopen.ts`. **IGNORUJ** `OMFclosed.ts` (ceny historyczne są stałe).
    *   **Oblicz:** `Nowa Obecna Wartość = Ilość * Cena`.
    *   **Zaktualizuj:** Nadpisz `Obecna wartość`. Przelicz `Zysk` i `ROI`.
3.  **Synchronizacja Historii (Ostatni Miesiąc):**
    *   Dla każdego portfela zsumuj `Obecna Wartość` z `OMFopen`.
    *   **IKE/Krypto:** Oblicz `Wkład` = Suma(OMFopen.WartośćZakupu) - Suma(OMFclosed.Zysk).
    *   Zaktualizuj **ostatni wiersz** w plikach historii.
4.  **Raport:** Podaj nową wartość portfela.

### Polecenie: `UpdateDate`

**Wyzwalacz:** "UpdateDate [RRRR-MM-DD]"
**Procedura:** Zaktualizuj stałą `OMF_LAST_UPDATED` w `CSV/OMFopen.ts` oraz `DATA_LAST_UPDATED` w `constants/appData.ts`.

---

## PROTOKÓŁ WERYFIKACJI OBLICZEŃ (TRIPLE CHECK)

**KRYTYCZNE:** Każde wyliczenie finansowe (szczególnie Wkład, Zysk, ROI, Sumy w Krypto/IKE) musi zostać zweryfikowane **3 RAZY** przed podaniem wyniku lub modyfikacją pliku.

1.  **Weryfikacja 1 (Definicja i Logika):**
    *   Upewnij się, że stosujesz poprawną formułę dla danego portfela.
    *   Dla Krypto/IKE: Czy uwzględniłeś odjęcie zysków z zamkniętych pozycji (`OMFclosed`) od sumy zakupów otwartych (`OMFopen`) przy liczeniu Wkładu ("Kula Śnieżna")?
2.  **Weryfikacja 2 (Dane Surowe):**
    *   Wypisz wartości składowe pobrane z plików.
    *   Czy suma kolumny `Wartość Zakupu` w `OMFopen.ts` jest obliczona poprawnie?
    *   Czy suma kolumny `Zysk` w `OMFclosed.ts` jest obliczona poprawnie?
3.  **Weryfikacja 3 (Spójność Wyniku):**
    *   Wykonaj działanie matematyczne ponownie.
    *   Sprawdź test spójności: `Obecna Wartość Portfela - Obliczony Wkład Netto` musi równać się `Rzeczywistemu Zyskowi`.
    *   Jeśli wynik wydaje się dziwny (np. nagły skok ROI), sprawdź dane wejściowe jeszcze raz.
