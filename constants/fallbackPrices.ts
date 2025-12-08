




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
  'PPK': 180.76,

  // Akcje / ETF
  'NDIA.L': 35.070802,
  'IUIT.L': 155.890443,
  'NUKL.DE': 210.340255,
  'ETFBS80TR': 456.350000,
  'AMZN': 834.168485,
  'CRWD': 1856.133110,
  'MSFT': 1779.588538,
  'PLW': 250.000000,
  'SFD': 2.800000,
  'CDR': 243.500000,
  'LPP': 16945.000000,
  'KRU': 483.400000,
  'ABS': 83.600000,
  'KLE': 7.260000,
  'KTY': 924.500000,
  'ACN': 975.870532,
  'FAST': 150.688031,
  'GAW': 960.449452,
  'ROL': 221.811909,
  'FRO': 27.000000,

  // Krypto
  'POL': 0.454756,
  'ETH': 11388.346898,
  'NEAR': 6.475729,
  'USDC': 3.638050,
  'LINK': 50.932700,
  'ADA': 1.432056,
  'SKL': 0.045512,
  'MINA': 0.348380,
  'AVAX': 50.132329,
  'API3': 1.832850,
  'SOL': 503.251457,
  'EGLD': 29.468205,
  'RUNE': 2.485152,
  'OP': 1.180911,
  'ARB': 0.779634,
  'MAGIC': 0.357766,
  'XSWAP': 0.070032,
  'BNB': 3302.743643,
  'JLP': 17.207977,
  'LAI': 0.000437,
  'STX': 1.104148,
  'EXD': 0.016084,
  'SOIL': 0.360021,
  'AZERO': 0.046494,
  'FOREX': 0.000905,
  'KAVA': 0.385269,
  '5IRE': 0.001811
};