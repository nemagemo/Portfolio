

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
  'PPK': 179.22,

  // Akcje / ETF
  'NDIA.L': 36.034630,
  'IUIT.L': 152.608665,
  'NUKL.DE': 197.656635,
  'ETFBS80TR': 453.800000,
  'AMZN': 840.041333,
  'CRWD': 1835.721599,
  'MSFT': 1776.321050,
  'PLW': 271.500000,
  'SFD': 2.870000,
  'CDR': 243.000000,
  'LPP': 17305.000000,
  'KRU': 469.000000,
  'ABS': 84.000000,
  'KLE': 7.440000,
  'KTY': 957.000000,
  'ACN': 907.181844,
  'FAST': 147.095768,
  'GAW': 954.145192,
  'ROL': 225.006508,
  'FRO': 28.900000,

  // Krypto
  'POL': 0.500177,
  'ETH': 11065.591138,
  'NEAR': 7.046285,
  'USDC': 3.650925,
  'LINK': 48.739849,
  'ADA': 1.579666,
  'SKL': 0.051515,
  'MINA': 0.402697,
  'AVAX': 52.682848,
  'API3': 1.989754,
  'SOL': 513.502601,
  'EGLD': 28.951835,
  'RUNE': 2.370546,
  'OP': 1.178884,
  'ARB': 0.801013,
  'MAGIC': 0.390649,
  'XSWAP': 0.084671,
  'BNB': 3129.868680,
  'JLP': 16.970780,
  'LAI': 0.000576,
  'STX': 1.162407,
  'EXD': 0.016135,
  'SOIL': 0.357043,
  'AZERO': 0.048175,
  'FOREX': 0.001859,
  'KAVA': 0.440145,
  '5IRE': 0.001981
};