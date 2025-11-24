
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

## Polecenie: `ChangeLogos`

**Wyzwalacz:** Użytkownik pisze "Wykonaj polecenie ChangeLogos" (lub podobne).

**Cel:** Automatyzacja procesu dodawania nowych logotypów aktywów do aplikacji poprzez konwersję surowych plików SVG na komponenty Reacta.

**Procedura (Algorytm):**

1.  **Skanowanie:**
    *   Sprawdź zawartość folderu `logos/`.
    *   Zidentyfikuj wszystkie pliki z rozszerzeniem `.svg` (np. `XYZ.svg`).

2.  **Konwersja:**
    *   Dla każdego znalezionego pliku SVG utwórz (lub nadpisz) plik `.tsx` w tym samym folderze.
    *   **Nazwa pliku:** `[NazwaZPliku]Logo.tsx` (np. `XYZ.svg` -> `XYZLogo.tsx`).
    *   **Nazwa komponentu:** `[NazwaZPliku]Logo` (np. `XYZLogo`).

3.  **Szablon Komponentu:**
    *   Kod musi być poprawnym komponentem funkcyjnym React.
    *   Komponent musi przyjmować propsy `React.SVGProps<SVGSVGElement>` i przekazywać je do elementu `<svg>` (spread attributes `...props`).
    *   Należy zachować oryginalny `viewBox` z pliku SVG.
    *   Należy przekonwertować atrybuty SVG na format JSX (np. `fill-rule` -> `fillRule`, `stroke-width` -> `strokeWidth`).
    *   Jeśli SVG zawiera style inline, należy je przenieść do atrybutów lub zachować w obiekcie `style`.

    *Wzór kodu:*
    ```tsx
    import React from 'react';

    export const NAZWALogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
      <svg viewBox="0 0 [ORYGINALNA_SZEROKOSC] [ORYGINALNA_WYSOKOSC]" {...props}>
        {/* Tu wstaw treść SVG (ścieżki, kształty) */}
      </svg>
    );
    ```

4.  **Raport:**
    *   Poinformuj użytkownika krótko, które logotypy zostały przetworzone (np. "Przekształcono KLE.svg na KLELogo.tsx").
    *   Przypomnij użytkownikowi o ręcznym usunięciu plików źródłowych SVG, aby zachować porządek w folderze.

---

## Polecenie: `UpdateCSV`

**Wyzwalacz:** Użytkownik pisze "Wykonaj polecenie UpdateCSV" lub dostarcza pliki `.csv` z prośbą o aktualizację.

**Cel:** Synchronizacja surowych danych CSV z plikami TypeScript używanymi przez aplikację (tryb offline).

**Procedura (Algorytm):**

1.  **Skanowanie:**
    *   Sprawdź czy użytkownik dostarczył treść plików `.csv` lub czy znajdują się one w folderze `CSV/`.

2.  **Konwersja:**
    *   Dla każdego pliku CSV (np. `Dane.csv`) utwórz lub zaktualizuj odpowiadający mu plik `.ts` (np. `Dane.ts`) w folderze `CSV/`.
    *   Nazwa zmiennej z danymi: format `UPPER_SNAKE_CASE` z sufiksem `_DATA`.

3.  **Szablon Pliku TS:**
    *   Zawartość pliku `.ts` powinna wyglądać następująco. NIE generuj zmiennej `_LAST_UPDATED`.

    ```typescript
    export const NAZWA_PLIKU_DATA = `[TUTAJ WKLEJ CAŁĄ ZAWARTOŚĆ PLIKU CSV]`;
    ```

4.  **Weryfikacja:**
    *   Upewnij się, że wklejona zawartość CSV jest kompletna i zawiera nagłówki.

---

## Polecenie: `UpdateDate`

**Wyzwalacz:** Użytkownik pisze "Wykonaj polecenie UpdateDate [RRRR-MM-DD]" (np. `UpdateDate 2025-05-01`).

**Cel:** Ręczna aktualizacja globalnej daty ważności danych wyświetlanej w aplikacji.

**Procedura (Algorytm):**

1.  **Pobranie daty:**
    *   Pobierz datę podaną przez użytkownika w poleceniu.

2.  **Aktualizacja:**
    *   Zaktualizuj plik `constants/appData.ts`.
    *   Nadpisz zmienną `DATA_LAST_UPDATED`.

3.  **Szablon Pliku `constants/appData.ts`:**
    ```typescript
    export const DATA_LAST_UPDATED = 'RRRR-MM-DD';
    ```
