
# Instrukcje i Niestandardowe Polecenia dla AI

Ten plik służy do zachowania ciągłości pracy nad projektem pomiędzy sesjami. Zawiera definicje poleceń specyficznych dla tego projektu, które AI powinna umieć wykonać na żądanie użytkownika.

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
