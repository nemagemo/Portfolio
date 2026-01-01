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
  'PLN': 1.00,

  // PPK (Cena jednostki)
  'PPK': 189.28,

  // Akcje / ETF
  'NDIA.L': 35.171814,
  'IUIT.L': 151.548082,
  'NUKL.DE': 196.882337,
  'ETFBS80TR': 464.8,
  'AMZN': 830.097966,
  'CRWD': 1685.801588,
  'MSFT': 1739.242606,
  'PLW': 256.0,
  'SFD': 3.02,
  'CDR': 241.0,
  'LPP': 20810.0,
  'KRU': 493.5,
  'ABS': 85.0,
  'KLE': 7.4,
  'KTY': 913.5,
  'ACN': 964.88729,
  'FAST': 144.319519,
  'GAW': 911.167398,
  'ROL': 215.849926,
  'FRO': 27.7,

  // Krypto
  'POL': 0.358084,
  'ETH': 10718.549899,
  'NEAR': 5.466376,
  'USDC': 3.5963,
  'LINK': 44.018712,
  'ADA': 1.415622,
  'SKL': 0.036323,
  'MINA': 0.274434,
  'AVAX': 44.342379,
  'API3': 1.559715,
  'SOL': 449.17787,
  'EGLD': 19.959465,
  'RUNE': 2.004937,
  'OP': 0.980711,
  'ARB': 0.676104,
  'MAGIC': 0.336614,
  'XSWAP': 0.052973,
  'BNB': 3082.93734,
  'JLP': 16.255276,
  'LAI': 0.000221,
  'STX': 0.882532,
  'EXD': 0.015899,
  'SOIL': 0.418609,
  'AZERO': 0.034391,
  'FOREX': 0.001259,
  'KAVA': 0.27242,
  '5IRE': 0.000692
};