


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
  'PPK': 182.09,

  // Akcje / ETF
  'NDIA.L': 35.660893,
  'IUIT.L': 155.102961,
  'NUKL.DE': 199.911285,
  'ETFBS80TR': 459.400000,
  'AMZN': 859.807510,
  'CRWD': 1887.213908,
  'MSFT': 1792.654081,
  'PLW': 256.000000,
  'SFD': 2.850000,
  'CDR': 255.900000,
  'LPP': 16635.000000,
  'KRU': 471.700000,
  'ABS': 84.400000,
  'KLE': 7.200000,
  'KTY': 964.500000,
  'ACN': 943.040618,
  'FAST': 146.370427,
  'GAW': 953.198688,
  'ROL': 222.295975,
  'FRO': 27.000000,

  // Krypto
  'POL': 0.465492,
  'ETH': 10856.908756,
  'NEAR': 6.467191,
  'USDC': 3.653780,
  'LINK': 46.877997,
  'ADA': 1.438248,
  'SKL': 0.048230,
  'MINA': 0.379262,
  'AVAX': 48.814501,
  'API3': 1.938696,
  'SOL': 489.496907,
  'EGLD': 27.001434,
  'RUNE': 2.330381,
  'OP': 1.141806,
  'ARB': 0.747929,
  'MAGIC': 0.363332,
  'XSWAP': 0.069422,
  'BNB': 3182.322952,
  'JLP': 16.953539,
  'LAI': 0.000361,
  'STX': 1.075673,
  'EXD': 0.016153,
  'SOIL': 0.358692,
  'AZERO': 0.049326,
  'FOREX': 0.001506,
  'KAVA': 0.441011,
  '5IRE': 0.001945
};