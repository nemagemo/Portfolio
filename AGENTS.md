# Project Specific Rules & Knowledge

## PPK Calculations
- **Podatek (Tax):** Always calculate as 12% of the **Cumulative Employer Contribution** (`Pracodawca` column). It is a cost, so store it as a negative value (e.g., `-312,95 zł`).
- **Exit ROI:** Use formula: `((Zysk Funduszu * 0.81) + (Wpłaty Pracodawcy * 0.70)) / Wpłaty Pracownika`.
- **ROI:** Use formula: `Całkowity Zysk / Wpłata Pracownika`.
- **Całkowity Zysk:** `Zysk Funduszu + Wpłata Pracodawcy + Dopłata Państwa`.

## Księgowanie Dywidend
- **Gotówka PLN-IKE:** Przy dodawaniu nowej dywidendy do `CSV/Dividends.ts` dla portfela IKE, należy zawsze zaktualizować pozycję gotówkową `PLN-IKE` w `CSV/OMFopen.ts`.
  - Zwiększ jej wartość zakupu (`purchaseValue`) i obecną wartość o kwotę otrzymanej dywidendy netto.
  - Zmień datę pozycji `PLN-IKE` oraz stałą `OMF_LAST_UPDATED` na dzień otrzymania dywidendy.

## PLN-IKE i Nowe Zakupy
- **Brak ujemnego salda gotówki PLN-IKE:** Pozycja gotówkowa `PLN-IKE` w `CSV/OMFopen.ts` nigdy nie powinna być ujemna.
- **Automatyczna wpłata:** Jeśli podczas nowego zakupu aktywów na IKE posiadana gotówka `PLN-IKE` nie jest wystarczająca do pokrycia kwoty zakupu, brakująca kwota musi być traktowana jako nowa wpłata na IKE (zwiększająca zainwestowany kapitał) i natychmiast wydawana, co oznacza, że saldo `PLN-IKE` po zakupie wynosi dokładnie `0,00 zł` (a nie wartość ujemną).
- **Synchronizacja IKE.ts:** Przy dokonaniu nowych zakupów z nową automatyczną wpłatą, należy zaktualizować wkład własny (`Wkład`), zysk (`Zysk`) oraz ROI w ostatnim wierszu pliku historycznego `CSV/IKE.ts` (oraz zmienić datę na bieżący dzień), wyliczając nowy wkład własny na podstawie sumy poprzedniego wkładu oraz kwoty nowej automatycznej wpłaty (lub formuły z `AI_INSTRUCTIONS.md`). Należy pamiętać o tym przy przyszłych transakcjach.

