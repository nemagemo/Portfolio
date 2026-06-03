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

