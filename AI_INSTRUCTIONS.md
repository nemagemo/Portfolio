
# Instrukcje i Niestandardowe Polecenia dla AI

Ten plik służy do zachowania ciągłości pracy nad projektem pomiędzy sesjami. Zawiera definicje poleceń specyficznych dla tego projektu, które AI powinna umieć wykonać na żądanie użytkownika.

---

## Ważne Definicje Danych

### Struktura Danych PPK
W plikach CSV oraz logice aplikacji dla portfela PPK obowiązuje następująca definicja zysku:
*   **Całkowity Zysk (Profit)** = Zysk z Funduszu + Wpłaty Pracodawcy + Dopłaty Państwa.
*   **Exit ROI (Zwrot)**: Obliczany wg wzoru: `((Zysk Funduszu * 0.81) + (Wpłaty Pracodawcy * 0.70)) / Wpłaty Pracownika`. Uwzględnia podatek Belki i "karę" 30% zwrotu środków pracodawcy.
*   Przy wizualizacji struktury kapitału (np. wykresy skumulowane), aby składniki sumowały się do 100% Wartości Portfela, należy używać: **Wkład Pracownika + Wkład Pracodawcy + Dopłaty Państwa + Zysk Funduszu**.

### OMF - Wkład Własny w PPK
W pliku `OMFopen.ts`, kolumna `Wartość Zakupu` dla wiersza PPK reprezentuje **wyłącznie** wkład własny pracownika (składki potrącone z pensji).

### OMF - Zainwestowany Kapitał w IKE i Krypto (Efekt Kuli Śnieżnej)
W pliku `OMFopen.ts` oraz w wyliczeniach historycznych dla portfeli **IKE** oraz **Krypto**, obowiązuje specjalna zasada obliczania **Wkładu (Zainwestowano)**, aby uwzględnić efekt reinwestycji zysków (Kula Śnieżna):
*   **Formuła:** `Wkład = Suma(Wartość Zakupu z OMFopen.ts) - Suma(Zysk z OMFclosed.ts)`.
*   **Cel:** Zysk z zamkniętych pozycji reinwestowany w nowe pozycje nie jest "nowym kapitałem" z zewnątrz.

---

## Logika Wyceny i Zmiany 24h (Market Watch)

Aplikacja stosuje hybrydowy model wyceny w czasie rzeczywistym:

1.  **Pobieranie Danych:** Równoległy fetch cen aktualnych i historycznych (z wczoraj) z Google Sheets CSV.
2.  **Normalizacja:** Symbole są zamieniane na UPPERCASE. Z plików CSV usuwany jest znak BOM (`\uFEFF`) na początku, aby uniknąć błędów parowania pierwszego wiersza.
3.  **Priorytet Ceny Aktualnej:**
    *   1. Google Sheet (Online).
    *   2. `fallbackPrices.ts` (Hardcoded).
    *   3. `OMFopen.ts` (Snapshot z ostatniego zapisu).
4.  **Obliczanie Zmiany 24h:**
    *   Wzór: `((Cena Aktualna - Cena Historyczna) / Cena Historyczna) * 100`.
    *   **Ustalanie Ceny Historycznej:**
        *   Priorytet 1: Google Sheet Historyczny.
        *   Priorytet 2: Wyliczenie z `OMFopen.ts` (`Obecna Wartość / Ilość`). Traktujemy stan zapisany w pliku jako punkt odniesienia ("wczoraj"), jeśli brak danych online.

## Zasady Wizualizacji (Heatmapy)

1.  **Grupowanie:** Aktywa są grupowane wg Portfela (PPK, IKE, Krypto, Gotówka).
2.  **Kolejność:** PPK -> IKE -> Krypto -> Gotówka.
3.  **Sortowanie:** Wewnątrz grup kafelki sortowane są malejąco wg Wartości (size).
4.  **Agregacja "Reszta Krypto":**
    *   Kryptowaluty o wartości < 1000 PLN są zwijane w jeden kafelek o nazwie "Reszta Krypto".
    *   ROI/Zmiana dla tej grupy liczona jest na podstawie sumy wartości i kosztów składowych (podejście portfelowe), a nie średniej ważonej.
5.  **Kolory (24h):**
    *   Wzrost > 0: Odcienie zieleni (im więcej tym ciemniejszy/intensywniejszy).
    *   Spadek < 0: Odcienie czerwieni.
    *   Brak zmian (~0%): Szary.

---

## Procedury i Polecenia

### Polecenie: `AktualizujKomentarze`

**Wyzwalacz:** "AktualizujKomentarze"
**Cel:** Utrzymanie spójności dokumentacji z kodem po sesji zmian.
**Procedura:**
1.  Przeanalizuj ostatnie zmiany w logice aplikacji (np. nowe wzory wyliczeń, nowe źródła danych, zmiany w UI).
2.  Zaktualizuj niniejszy plik `AI_INSTRUCTIONS.md`, dodając nowe definicje lub korygując istniejące.
3.  Dodaj lub zaktualizuj komentarze w kodzie (`.tsx`, `.ts`), szczególnie w miejscach skomplikowanej logiki (np. parsery, hooki `useMemo`, algorytmy grupujące), aby wyjaśniały "Dlaczego" coś jest zrobione w dany sposób (np. dlaczego usuwamy BOM, dlaczego taki wzór Exit ROI).
4.  Jeśli nic nie wymagało aktualizacji to poinformuj o tym użytkownika.

### Polecenie: `RejestrujTransakcje`
**Procedura:**
1.  Analiza języka naturalnego użytkownika.
2.  Edycja `CSV/OMFopen.ts` (Kupno/Sprzedaż częściowa) lub przeniesienie do `CSV/OMFclosed.ts` (Sprzedaż całkowita).
3.  Synchronizacja historii w `CSV/PPK.ts`, `CSV/Krypto.ts`, `CSV/IKE.ts`.
4.  Logowanie w `CSV/Transactions.ts`.

### Polecenie: `AktualizujCeny`
**Wyzwalacz:** Użytkownik podaje nowe ceny lub pisze "Aktualizuj ceny".
**Procedura:**
1.  Aktualizacja cen w `CSV/OMFopen.ts` (Obecna Wartość).
2.  Aktualizacja ostatniego wiersza w plikach historii portfeli.
3.  Jeśli podano dane, aktualizacja `constants/fallbackPrices.ts`.

### Polecenie: `UpdateDate`
**Procedura:** Aktualizacja `OMF_LAST_UPDATED` oraz `DATA_LAST_UPDATED`.

---

## PROTOKÓŁ WERYFIKACJI OBLICZEŃ (TRIPLE CHECK)

**KRYTYCZNE:** Każde wyliczenie finansowe musi zostać zweryfikowane **3 RAZY**.
1.  **Weryfikacja 1 (Logika):** Czy wzór jest poprawny dla danego portfela (np. Snowball dla Krypto)?
2.  **Weryfikacja 2 (Dane):** Czy sumy z plików (`OMFopen`, `OMFclosed`) są pobrane poprawnie?
3.  **Weryfikacja 3 (Spójność):** Czy `Wartość - Wkład = Zysk`? Czy ROI ma sens?
