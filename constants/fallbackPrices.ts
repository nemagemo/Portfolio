
/**
 * FALLBACK PRICES
 * ===============
 * Ten plik służy jako awaryjne źródło cen dla aktywów, w przypadku gdy użytkownik
 * nie poda aktualnych danych z Google Sheets podczas wykonywania polecenia `AktualizujCeny`.
 * 
 * Format: 'SYMBOL': Cena_Jednostkowa_PLN
 */

export const FALLBACK_PRICES: Record<string, number> = {
  // Waluty / Gotówka
  'PLN': 1.0,
  'USD': 4.05,
  'EUR': 4.35,
  'GBP': 5.15,

  // PPK (Cena jednostki)
  'PPK': 178.60,

  // Akcje / ETF (Ostatnia aktualizacja: 2025-11-24)
  'NDIA.L': 35.83,
  'IUIT.L': 148.01,
  'NUKL.DE': 187.30,
  'ETFBS80TR': 447.95,
  'AMZN': 808.52,
  'CRWD': 1797.61,
  'MSFT': 1729.65,
  'PLW': 258.00, // Corrected
  'SFD': 2.90,
  'CDR': 228.60,
  'LPP': 15945.00,
  'KRU': 461.40,
  'ABS': 84.80,
  'KLE': 7.70,
  'KTY': 925.50,
  'ACN': 922.67,
  'FAST': 146.21,
  'GAW': 910.99,
  'ROL': 220.95,
  'FRO': 28.80,

  // Krypto (Ostatnia aktualizacja: 2025-11-24)
  'POL': 0.49,
  'ETH': 10325.81,
  'NEAR': 6.81,
  'USDC': 3.67, // Corrected
  'LINK': 45.61,
  'ADA': 1.50,
  'SKL': 0.05,
  'MINA': 0.39,
  'AVAX': 48.87,
  'API3': 1.97,
  'SOL': 474.25,
  'EGLD': 27.40,
  'RUNE': 2.29,
  'OP': 1.12,
  'ARB': 0.74,
  'MAGIC': 0.38,
  'XSWAP': 0.08,
  'BNB': 3086.03,
  'JLP': 16.52,
  'LAI': 0.00,
  'STX': 1.13,
  'EXD': 0.02,
  'SOIL': 0.36,
  'AZERO': 0.04,
  'FOREX': 0.00,
  'KAVA': 0.42,
  '5IRE': 0.00
};
