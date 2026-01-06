
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
  'PPK': 191.87,

  // Akcje / ETF
  'NDIA.L': 35.381119,
  'IUIT.L': 150.882656,
  'NUKL.DE': 216.815379,
  'ETFBS80TR': 481.0,
  'AMZN': 838.852858,
  'CRWD': 1643.260415,
  'MSFT': 1701.929005,
  'PLW': 263.0,
  'SFD': 3.18,
  'CDR': 239.4,
  'LPP': 21340.0,
  'KRU': 498.5,
  'ABS': 86.0,
  'KLE': 7.8,
  'KTY': 921.0,
  'ACN': 950.143214,
  'FAST': 148.111195,
  'GAW': 906.284256,
  'ROL': 212.106749,
  'FRO': 30.3,

  // Krypto
  'POL': 0.458911,
  'ETH': 11646.66461,
  'NEAR': 6.550726,
  'USDC': 3.5993,
  'LINK': 50.03027,
  'ADA': 1.416803,
  'SKL': 0.041536,
  'MINA': 0.325269,
  'AVAX': 52.54978,
  'API3': 1.756458,
  'SOL': 500.014756,
  'EGLD': 24.11531,
  'RUNE': 2.181176,
  'OP': 1.202526,
  'ARB': 0.804444,
  'MAGIC': 0.369648,
  'XSWAP': 0.051614,
  'BNB': 3285.784458,
  'JLP': 17.312633,
  'LAI': 0.000222,
  'STX': 1.360535,
  'EXD': 0.015913,
  'SOIL': 0.471868,
  'AZERO': 0.036389,
  'FOREX': 0.001871,
  'KAVA': 0.323469,
  '5IRE': 0.000896
};