

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
  'PPK': 177.49,

  // Akcje / ETF
  'NDIA.L': 35.637420,
  'IUIT.L': 149.341238,
  'NUKL.DE': 192.012535,
  'ETFBS80TR': 450.100000,
  'AMZN': 838.866893,
  'CRWD': 1870.453358,
  'MSFT': 1744.188810,
  'PLW': 262.000000,
  'SFD': 2.950000,
  'CDR': 231.500000,
  'LPP': 16830.000000,
  'KRU': 463.400000,
  'ABS': 84.400000,
  'KLE': 7.640000,
  'KTY': 940.000000,
  'ACN': 910.287788,
  'FAST': 146.493165,
  'GAW': 930.447408,
  'ROL': 223.646719,
  'FRO': 29.000000,

  // Krypto
  'POL': 0.493666,
  'ETH': 10708.957442,
  'NEAR': 6.937613,
  'USDC': 3.651375,
  'LINK': 47.686958,
  'ADA': 1.533611,
  'SKL': 0.050718,
  'MINA': 0.400556,
  'AVAX': 51.411360,
  'API3': 1.971743,
  'SOL': 502.648283,
  'EGLD': 28.772835,
  'RUNE': 2.328117,
  'OP': 1.173187,
  'ARB': 0.782855,
  'MAGIC': 0.390697,
  'XSWAP': 0.084712,
  'BNB': 3134.194998,
  'JLP': 16.978894,
  'LAI': 0.000576,
  'STX': 1.162963,
  'EXD': 0.016143,
  'SOIL': 0.357214,
  'AZERO': 0.048198,
  'FOREX': 0.001860,
  'KAVA': 0.440356,
  '5IRE': 0.001982
};