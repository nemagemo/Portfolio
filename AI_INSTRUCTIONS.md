


# Instrukcje i Niestandardowe Polecenia dla AI

**ZASADA EDYCJI TEGO PLIKU:**
W tym pliku (`AI_INSTRUCTIONS.md`) mogą być **tylko dodawane nowe rzeczy**. Usuwanie lub modyfikowanie istniejących treści jest dozwolone **wyłącznie** po wyraźnym potwierdzeniu przez użytkownika.

Ten plik służy do zachowania ciągłości pracy nad projektem pomiędzy sesjami. Zawiera definicje poleceń specyficznych dla tego projektu, które AI powinna umieć wykonać na żądanie użytkownika.

---

## Architektura i Lokalizacja Logiki (Po Refaktoryzacji)

W projekcie przeprowadzono refaktoryzację (podział "God Hooka" i "God Componentu"). Oto mapa kluczowej logiki biznesowej:

1.  **Parsowanie Danych (`utils/parser.ts`):**
    *   Centralny punkt przetwarzania CSV.
    *   Używa wzorca Strategii: `parseCSV` deleguje do `parseOMF`, `parsePPK` itd.
    *   Zawiera logikę walidacji integralności matematycznej (`validateOMFIntegrity`).

2.  **Wycena i Stan Portfela (`hooks/useAssetPricing.ts`):**
    *   Odpowiada za logikę: CSV Snapshot + Ceny Online/Fallback = Aktualny Stan.
    *   Realizuje priorytet cen: Google Sheets (Online) > Fallback (Hardcoded) > CSV.
    *   Wykonuje Cross-Check historii (czy historia zgadza się z wyliczonym stanem obecnym).

3.  **Historia i Wyniki (`hooks/useGlobalHistory.ts`):**
    *   Buduje główną oś czasu (`globalHistoryData`).
    *   Oblicza **TWR** (Time-Weighted Return) metodą łańcuchową.
    *   Oblicza **Real Value** (wartość skorygowaną o inflację CPI).
    *   Implementuje logikę "Kuli Śnieżnej" (Zainwestowany Kapitał = Zakupy - Zamknięte Zyski - Dywidendy).

4.  **Transformacje Wykresów (`hooks/useChartTransformations.ts`):**
    *   Przygotowuje dane specyficznie pod bibliotekę Recharts.
    *   Agregacja Treemapy.
    *   Grupowanie małych aktywów w "Reszta Krypto" dla wykresu bąbelkowego.

5.  **Projekcje (`hooks/useProjections.ts`):**
    *   Wylicza "Drogę do Miliona" (OMF) i "Drogę do Emerytury" (PPK).
    *   Obsługuje metody LTM i CAGR.

6.  **Komponenty Wykresów (`components/charts/*`):**
    *   Podzielone tematycznie: `OMFCharts` (Treemap, Bubble), `TimeCharts` (Liniowe/Obszarowe), `BarCharts` (Słupkowe).
    *   Wspólne style, konfiguracja responsywności i logotypy znajdują się w `chartUtils.tsx`.

---

## Architektura Wykresów i Responsywność

### Struktura Plików
Wykresy zostały wydzielone z głównego pliku `Charts.tsx` do dedykowanego katalogu `components/charts/`:
*   `chartUtils.tsx`: Zawiera definicje motywów (`CHART_THEMES`), hook `useChartConfig` oraz komponent `AssetLogo`.
*   `TimeCharts.tsx`: Wykresy oparte na osi czasu (XAxis = data).
*   `OMFCharts.tsx`: Wykresy specyficzne dla OMF (Treemap, Bubble).
*   `BarCharts.tsx`: Wykresy słupkowe (Dźwignia, Sezonowość).

### Strategia Responsywności (Mobile View)
Aplikacja stosuje podejście adaptacyjne:
1.  **Mobile (< 768px):** "Centrum Dowodzenia". Widoczne są tylko kluczowe metryki i proste wykresy liniowe. Złożone wizualizacje (Heatmapy, Treemapy, Bubble Chart, Tabele szczegółowe) są ukrywane klasą `hidden md:block`.
2.  **Desktop:** "Centrum Analiz". Pełny dostęp do wszystkich narzędzi.

### Hook `useChartConfig`
Wszystkie wykresy używają hooka `useChartConfig` (z `chartUtils.tsx`), który dynamicznie dostosowuje parametry biblioteki Recharts:
*   **Marginesy:** Na mobile marginesy są ujemne (`left: -20`), aby wykres zajmował całą szerokość karty.
*   **Legendy:** Na mobile czcionka jest mniejsza (9-10px), a legenda jest centrowana, aby nie wychodziła poza ekran.
*   **Padding Osi:** Na mobile `padding.left` wynosi 0, aby wykres zaczynał się od samej krawędzi.

### Zarządzanie Logotypami
System logotypów opiera się na plikach SVG w folderze `logos/` oraz mapowaniu w `chartUtils.tsx`.
*   **Aby dodać nowe logo:**
    1. Utwórz komponent `NameLogo.tsx` w folderze `logos/`.
    2. Zaimportuj go w `components/charts/chartUtils.tsx`.
    3. Dodaj wpis do obiektu `LOGO_MAP` (klucz musi odpowiadać `symbol` aktywa w CSV).

---

## Ważne Definicje Danych

### Struktura Danych PPK
W plikach CSV oraz logice aplikacji dla portfela PPK obowiązuje następująca definicja zysku:
*   **Całkowity Zysk (Profit)** = Zysk z Funduszu + Wpłaty Pracodawcy + Dopłaty Państwa.
*   **Podatek (Bieżący)** = Jest to podatek dochodowy od wpłat pracodawcy potrącany z pensji (12%). Traktowany jako koszt (wartość ujemna). Nie mylić z podatkiem Belki.
*   **Exit ROI (Zwrot)**: Obliczany wg wzoru: `((Zysk Funduszu * 0.81) + (Wpłaty Pracodawcy * 0.70)) / Wpłaty Pracownika`. Uwzględnia podatek Belki i "karę" 30% zwrotu środków pracodawcy.
*   Przy wizualizacji struktury kapitału (np. wykresy skumulowane), aby składniki sumowały się do 100% Wartości Portfela, należy używać: **Wkład Pracownika + Wkład Pracodawcy + Dopłaty Państwa + Zysk Funduszu**.

### OMF - Wkład Własny w PPK
W pliku `OMFopen.ts`, kolumna `Wartość Zakupu` dla wiersza PPK reprezentuje **wyłącznie** wkład własny pracownika (składki potrącone z pensji).

### OMF - Zainwestowany Kapitał w IKE i Krypto (Efekt Kuli Śnieżnej)
W pliku `OMFopen.ts` oraz w wyliczeniach historycznych dla portfeli **IKE** oraz **Krypto**, obowiązuje specjalna zasada obliczania **Wkładu (Zainwestowano)**, aby uwzględnić efekt reinwestycji zysków (Kula Śnieżna):
*   **Formuła:** `Wkład = Suma(Wartość Zakupu z OMFopen.ts) - Suma(Zysk z OMFclosed.ts) - Suma(Aktywnych Dywidend z Dividends.ts)`.
*   **Cel:** Zysk z zamkniętych pozycji oraz otrzymane i reinwestowane dywidendy nie są "nowym kapitałem" z zewnątrz.

### Logika Statusów Dywidend (Dividends.ts)
Plik `Dividends.ts` obsługuje dwa statusy dywidend, które wpływają na obliczenia:
1.  **Status "Aktywna" (Domyślny):** Dywidenda otrzymana w trakcie aktywnego śledzenia portfela.
    *   **Działanie:** Jej wartość jest odejmowana od `Wkładu Własnego` w formule Kuli Śnieżnej. Dzięki temu reinwestycja (wzrost `Wartości Zakupu`) bilansuje się z dywidendą, a `Zainwestowany Kapitał` nie rośnie sztucznie.
2.  **Status "Historyczna":** Dywidenda dodana wstecznie tylko w celach wizualnych (wykres słupkowy).
    *   **Działanie:** Jest ignorowana w obliczeniach `Wkładu Własnego` (flaga `isCounted = false`), aby nie zaburzyć historii kapitału, która została już ustalona w przeszłości.

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
4.  **Obliczanie Zmiany 24h (Zabezpieczenie):**
    *   Wzór: `((Cena Aktualna - Cena Historyczna) / Cena Historyczna) * 100`.
    *   **Warunek Konieczny (`isLivePrice`):** Zmiana 24h jest liczona **TYLKO** wtedy, gdy cena aktualna pochodzi ze źródła Online (Google Sheet).
    *   Jeśli cena pochodzi z Fallback lub CSV, flaga `isLivePrice` jest `false`, a zmiana 24h jest ustawiana na `undefined` (wyświetla się myślnik). Zapobiega to pokazywaniu absurdalnych procentów wynikających z porównywania ceny sprzed miesiąca (CSV) z ceną wczorajszą.

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
    *   Brak danych (Offline): Żółty (ostrzegawczy).

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
**Wyzwalacz:** Komenda "AktualizujCeny" ORAZ **obowiązkowo** dołączony plik/tekst z aktualnymi cenami.
**Zasada Odmowy:** Jeśli użytkownik wyda polecenie bez dołączenia danych: **NIE INGERUJ W KOD**. Odpisz, że musisz otrzymać plik z cenami, aby wykonać aktualizację.
**Procedura (gdy podano dane):**
1.  **Parsowanie:** Odczytaj dostarczony tekst z cenami (Symbol -> Cena).
2.  **Aktualizacja Fallback:** Zaktualizuj plik `constants/fallbackPrices.ts`, wpisując nowe ceny jednostkowe dla wszystkich znalezionych symboli.
3.  **Przeliczenie OMF (na podstawie fallbackPrices):**
    *   Edytuj `CSV/OMFopen.ts`.
    *   Dla każdej pozycji: Pobierz cenę z właśnie zaktualizowanego `fallbackPrices.ts`.
    *   **Uwaga:** Pozycje ze statusem 'Nieaktywna' (np. FOREX) są pomijane przy sumowaniu wartości portfela, ale ich jednostkowa wycena może być zaktualizowana.
    *   Wylicz: `Obecna wartość` = `Ilość` * `Cena`.
    *   Wylicz: `Zysk/Strata` = `Obecna wartość` - `Wartość zakupu`.
    *   Wylicz: `ROI`.
    *   Zaktualizuj datę `OMF_LAST_UPDATED`.
4.  **Synchronizacja Historii (Weryfikacja TRIPLE CHECK wymagana):**
    *   Na podstawie nowych wartości w `OMFopen.ts`, zsumuj wartość każdego portfela (PPK, IKE, Krypto) oraz pobierz wartość Gotówki.
    *   Zaktualizuj wartości oraz datę w **ostatnim wierszu** plików `CSV/PPK.ts`, `CSV/IKE.ts`, `CSV/Krypto.ts` **oraz `CSV/Cash.ts`**, aby wszystkie wykresy historyczne kończyły się tą samą datą i wartościami odpowiadającymi aktualnemu stanowi ("Teraz"). Zapobiegnie to rozjeżdżaniu się osi czasu na wykresach (np. "dwa razy listopad").

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
    *   **Wylicz `Podatek` = `Pracodawca` * 0.12 (ujemna wartość). To jest zryczałtowany podatek dochodowy od wpłaty pracodawcy.**
    *   Wylicz `ROI` i `Exit ROI`.
    *   Sformatuj i dopisz nowy wiersz do `CSV/PPK.ts`.
3.  **Snapshot IKE i Krypto:**
    *   Pobierz sumę `Obecna wartość` wszystkich aktywów danego portfela z `OMFopen.ts`.
    *   Oblicz `Wkład` (Net Invested) używając formuły TRIPLE CHECK (z uwzględnieniem dywidend).
    *   Wylicz `Zysk` = `Obecna wartość` - `Wkład`.
    *   Wylicz `ROI`.
    *   Sformatuj i dopisz nowe wiersze do `CSV/IKE.ts` i `CSV/Krypto.ts`.
4.  **Snapshot Gotówki:**
    *   Pobierz wartość gotówki (PLN) z pliku `OMFopen.ts`.
    *   Sformatuj i dopisz nowy wiersz do `CSV/Cash.ts`.
5.  **Aktualizacja Dat:** Zaktualizuj zmienne `*_LAST_UPDATED` we wszystkich plikach CSV na nową datę.

### Polecenie: `WplataIKE`
**Wyzwalacz:** "Wpłaciłem X zł na IKE"
**Procedura:**
1.  Zwiększ wartość (Ilość i Wartość) pozycji `PLN-IKE` w `CSV/OMFopen.ts` o kwotę wpłaty.
2.  **Efekt:** Zwiększa się suma `Wartość zakupu` w portfelu IKE, co poprawnie zwiększa `Zainwestowany Kapitał`.

### Polecenie: `DodajDywidende`
**Wyzwalacz:** "Dostałem dywidendę X zł z spółki Y, data Z"
**Procedura:**
1.  Dopisz wiersz do `CSV/Dividends.ts` (Data, Portfel, Symbol, Kwota, Status="Aktywna").
2.  **AUTOMATYCZNE KSIĘGOWANIE:** Znajdź pozycję `PLN-IKE` w `CSV/OMFopen.ts` i **zwiększ jej wartość (Obecna wartość oraz Ilość)** o kwotę otrzymanej dywidendy netto.
3.  **Efekt:** Gotówka na koncie rośnie, ale wkład własny (Net Invested Capital) nie rośnie (bo dywidenda w `Dividends.ts` niweluje ten wzrost w formule kuli śnieżnej).

### Polecenie: `ZakupIKE` (Reinwestycja lub Zakup)
**Wyzwalacz:** "Kupiłem X za kwotę Y na IKE"
**Procedura:**
1.  Dodaj/Zaktualizuj pozycję aktywa w `CSV/OMFopen.ts` (zwiększ `Wartość zakupu` i `Ilość` wyliczoną z ceny).
2.  Zmniejsz pozycję `PLN-IKE` w `CSV/OMFopen.ts` o kwotę zakupu.
3.  **Zasada:** Nie ma znaczenia czy gotówka pochodziła z dywidend czy wpłaty. Jest to transfer wewnątrz portfela (Gotówka -> Aktywo). Suma `Wartość zakupu` portfela IKE pozostaje bez zmian (wzrost na aktywie, spadek na gotówce).

### Polecenie: `UpdateDate`
**Procedura:** Aktualizacja `OMF_LAST_UPDATED` oraz `DATA_LAST_UPDATED`.

---

## PROTOKÓŁ WERYFIKACJI OBLICZEŃ (TRIPLE CHECK)

**KRYTYCZNE:** Przed każdą edycją plików historycznych (`IKE.ts`, `Krypto.ts`) AI musi wykonać weryfikację krzyżową.

1.  **Weryfikacja 1 (Snowball Math):**
    *   Oblicz teoretyczny wkład własny:
    *   `Wkład = (Suma Wartości Zakupu Otwartych) - (Suma Zysków Zamkniętych) - (Suma Aktywnych Dywidend)`
2.  **Weryfikacja 2 (History Consistency):**
    *   Sprawdź, czy wartość wpisywana do pliku historycznego jako "Wkład" zgadza się z wynikiem z punktu 1.
3.  **Akcja Naprawcza:**
    *   Jeśli różnica > 5 PLN, **PRZERWIJ OPERACJĘ** i poinformuj użytkownika o niespójności, lub skoryguj wpis, wyjaśniając przyczynę (np. "Znalazłem pominiętą dywidendę").