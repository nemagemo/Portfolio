
# Instrukcje i Niestandardowe Polecenia dla AI

**ZASADA EDYCJI TEGO PLIKU:**
W tym pliku (`AI_INSTRUCTIONS.md`) mogą być **tylko dodawane nowe rzeczy**. Usuwanie lub modyfikowanie istniejących treści jest dozwolone **wyłącznie** po wyraźnym potwierdzeniu przez użytkownika.

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
2.  **Normalizacja Danych (KRYTYCZNE):**
    *   **BOM Removal:** Pliki CSV z Google Sheets/Excel często zaczynają się od niewidocznego znaku BOM (`\uFEFF`). Należy go usunąć (`text.replace(/^\uFEFF/, '')`), inaczej nagłówek pierwszej kolumny zostanie uszkodzony.
    *   **Case Insensitivity:** Symbole są zamieniane na `UPPERCASE` przed porównaniem.
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
    *   **Logika Obliczeń:** Zmiana % dla grupy jest liczona metodą portfelową: `(SumaWartościObecnych - SumaWartościPoprzednich) / SumaWartościPoprzednich`.
    *   Nie używamy średniej ważonej zmian procentowych, ponieważ generuje to błędy matematyczne przy dużych wahaniach małych aktywów.
5.  **Kolory (24h):**
    *   Wzrost > 0: Odcienie zieleni.
    *   Spadek < 0: Odcienie czerwieni.
    *   Brak zmian (~0%): Szary (aby odróżnić stagnację od małego zysku).

---

## Standardy Kodowania i Stabilność (Best Practices)

1.  **TypeScript - Spread Types:**
    *   Unikaj używania operatora spread (`...row`) na obiektach będących unią typów (np. `AnyDataRow`). Powoduje to błąd `Spread types may only be created from object types`.
    *   **Rozwiązanie:** Przypisuj właściwości jawnie (explicit assignment) lub rzutuj obiekt na `any`/`object` przed spreadem (tylko w ostateczności).
2.  **JSX Template Literals:**
    *   Uważaj na literówki w `className`. Konstrukcja `` `... ${style} ...` `` wymaga znaku `$` przed klamrą. Błąd typu `Expected "}" but found "$"` często oznacza brak dolara.
3.  **Komponenty w JSX:**
    *   Nie wywołuj komponentów funkcyjnych jak funkcji (np. `NoPPKIcon()`). Używaj składni JSX: `<NoPPKIcon />`. TypeScript zgłosi błąd `This expression is not callable`.

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
**Wyzwalacz:** Użytkownik dostarcza plik (tekst/csv) z aktualnymi cenami aktywów.
**Procedura:**
1.  Parsuj dostarczony przez użytkownika tekst z cenami.
2.  Iteruj przez wszystkie aktywne pozycje w `CSV/OMFopen.ts`.
3.  Dla każdego aktywa, dla którego znaleziono nową cenę:
    *   Przelicz `Obecna wartość` = `Ilość` * `Nowa Cena`.
    *   Zaktualizuj `Zysk/Strata` = `Nowa Obecna wartość` - `Wartość zakupu`.
    *   Zaktualizuj `ROI` = `(Zysk / Wartość zakupu) * 100`.
4.  Zaktualizuj `constants/fallbackPrices.ts` wpisując nowe ceny jednostkowe dla odpowiednich symboli.
5.  Zaktualizuj datę `OMF_LAST_UPDATED`.

### Polecenie: `ZamknijMiesiac`
**Wyzwalacz:** "Zamknij miesiąc [data]" lub po prostu "Zamknij miesiąc".
**Założenie:** Użytkownik **już** zaktualizował ceny w `OMFopen.ts` (np. komendą `AktualizujCeny` lub podając dane). Traktujemy `OMFopen.ts` jako snapshot stanu na koniec miesiąca.
**Procedura:**
1.  **Ustal Datę:** Jeśli nie podano daty, przyjmij 1. dzień kolejnego miesiąca względem ostatniego wpisu w `CSV/PPK.ts`.
2.  **Snapshot PPK:**
    *   Pobierz `Obecna wartość` i `Wartość zakupu` (Wkład Pracownika) z wiersza PPK w `OMFopen.ts`.
    *   Pobierz `Pracodawca` i `Państwo` z **ostatniego wiersza** `CSV/PPK.ts` (skumulowane wartości).
    *   *Opcjonalnie:* Jeśli użytkownik poda w poleceniu nowe wpłaty pracodawcy/państwa, dodaj je do pobranych wartości skumulowanych.
    *   Wylicz `Zysk Funduszu` = `Obecna wartość` - (`Pracownik` + `Pracodawca` + `Państwo`).
    *   Wylicz `Całkowity Zysk` = `Obecna wartość` - `Pracownik`.
    *   Wylicz `ROI` i `Exit ROI`.
    *   Sformatuj i dopisz nowy wiersz do `CSV/PPK.ts`.
3.  **Snapshot IKE i Krypto:**
    *   Pobierz sumę `Obecna wartość` wszystkich aktywów danego portfela z `OMFopen.ts`.
    *   Oblicz `Wkład` (Net Invested): Suma(`Wartość zakupu` otwartych z `OMFopen.ts`) - Suma(`Zysk` zamkniętych z `OMFclosed.ts`).
    *   Wylicz `Zysk` = `Obecna wartość` - `Wkład`.
    *   Wylicz `ROI`.
    *   Sformatuj i dopisz nowe wiersze do `CSV/IKE.ts` i `CSV/Krypto.ts`.
4.  **Snapshot Gotówki:**
    *   Pobierz wartość gotówki (PLN) z pliku `OMFopen.ts`.
    *   Sformatuj i dopisz nowy wiersz do `CSV/Cash.ts`.
5.  **Aktualizacja Dat:** Zaktualizuj zmienne `*_LAST_UPDATED` we wszystkich plikach CSV na nową datę.

### Polecenie: `UpdateDate`
**Procedura:** Aktualizacja `OMF_LAST_UPDATED` oraz `DATA_LAST_UPDATED`.

---

## PROTOKÓŁ WERYFIKACJI OBLICZEŃ (TRIPLE CHECK)

**KRYTYCZNE:** Każde wyliczenie finansowe musi zostać zweryfikowane **3 RAZY**.
1.  **Weryfikacja 1 (Logika):** Czy wzór jest poprawny dla danego portfela (np. Snowball dla Krypto)?
2.  **Weryfikacja 2 (Dane):** Czy sumy z plików (`OMFopen`, `OMFclosed`) są pobrane poprawnie?
3.  **Weryfikacja 3 (Spójność):** Czy `Wartość - Wkład = Zysk`? Czy ROI ma sens?
