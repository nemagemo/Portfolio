
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
  'PPK': 176.75,

  // Akcje / ETF (Ostatnia aktualizacja: 2025-11-24)
  'NDIA.L': 36.04,
  'IUIT.L': 151.06,
  'NUKL.DE': 191.24,
  'ETFBS80TR': 448.55,
  'AMZN': 828.23,
  'CRWD': 1861.83,
  'MSFT': 1748.61,
  'PLW': 259.50,
  'SFD': 2.93,
  'CDR': 230.90,
  'LPP': 16140.00,
  'KRU': 458.90,
  'ABS': 84.40,
  'KLE': 7.72,
  'KTY': 927.00,
  'ACN': 913.87,
  'FAST': 145.98,
  'GAW': 919.82,
  'ROL': 220.33,
  'FRO': 28.50,

  // Krypto (Ostatnia aktualizacja: 2025-11-24)
  'POL': 0.50,
  'ETH': 10841.58,
  'NEAR': 7.06,
  'USDC': 3.68,
  'LINK': 46.92,
  'ADA': 1.57,
  'SKL': 0.05,
  'MINA': 0.42,
  'AVAX': 49.97,
  'API3': 2.03,
  'SOL': 496.33,
  'EGLD': 28.09,
  'RUNE': 2.36,
  'OP': 1.16,
  'ARB': 0.77,
  'MAGIC': 0.39,
  'XSWAP': 0.08,
  'BNB': 3175.42,
  'JLP': 16.95,
  'LAI': 0.00,
  'STX': 1.16,
  'EXD': 0.02,
  'SOIL': 0.35,
  'AZERO': 0.04,
  'FOREX': 0.00,
  'KAVA': 0.43,
  '5IRE': 0.00
};