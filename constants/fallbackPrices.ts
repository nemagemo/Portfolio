



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
  'PPK': 182.21,

  // Akcje / ETF
  'NDIA.L': 35.125281,
  'IUIT.L': 153.623262,
  'NUKL.DE': 200.901492,
  'ETFBS80TR': 459.500000,
  'AMZN': 849.749058,
  'CRWD': 1872.442095,
  'MSFT': 1776.201000,
  'PLW': 251.000000,
  'SFD': 2.890000,
  'CDR': 257.200000,
  'LPP': 16845.000000,
  'KRU': 469.000000,
  'ABS': 85.000000,
  'KLE': 7.400000,
  'KTY': 963.500000,
  'ACN': 946.171398,
  'FAST': 146.699703,
  'GAW': 960.098475,
  'ROL': 220.756410,
  'FRO': 26.900000,

  // Krypto
  'POL': 0.465800,
  'ETH': 11143.682442,
  'NEAR': 6.524820,
  'USDC': 3.624900,
  'LINK': 52.017315,
  'ADA': 1.426880,
  'SKL': 0.048610,
  'MINA': 0.371552,
  'AVAX': 51.002343,
  'API3': 1.921559,
  'SOL': 513.140844,
  'EGLD': 27.404244,
  'RUNE': 2.419258,
  'OP': 1.163593,
  'ARB': 0.783703,
  'MAGIC': 0.365752,
  'XSWAP': 0.071157,
  'BNB': 3265.252462,
  'JLP': 17.327022,
  'LAI': 0.000388,
  'STX': 1.137856,
  'EXD': 0.016026,
  'SOIL': 0.348317,
  'AZERO': 0.051220,
  'FOREX': 0.001425,
  'KAVA': 0.437525,
  '5IRE': 0.001864
};