# Project Specific Rules & Knowledge

## PPK Calculations
- **Podatek (Tax):** Always calculate as 12% of the **Cumulative Employer Contribution** (`Pracodawca` column). It is a cost, so store it as a negative value (e.g., `-312,95 zł`).
- **Exit ROI:** Use formula: `((Zysk Funduszu * 0.81) + (Wpłaty Pracodawcy * 0.70)) / Wpłaty Pracownika`.
- **ROI:** Use formula: `Całkowity Zysk / Wpłata Pracownika`.
- **Całkowity Zysk:** `Zysk Funduszu + Wpłata Pracodawcy + Dopłata Państwa`.
