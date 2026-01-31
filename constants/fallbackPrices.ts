
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
  'NDIA.L': 33.177014,
  'IUIT.L': 147.180771,
  'NUKL.DE': 239.271780,
  'ETFBS80TR': 497.00,
  'AMZN': 850.938835,
  'CRWD': 1569.631890,
  'MSFT': 1530.089726,
  'PLW': 280.00,
  'SFD': 2.80,
  'CDR': 259.80,
  'LPP': 19650.00,
  'KRU': 488.90,
  'ABS': 84.40,
  'KLE': 8.52,
  'KTY': 1020.00,
  'ACN': 937.490658,
  'FAST': 154.185992,
  'GAW': 830.691920,
  'ROL': 225.233873,
  'FRO': 30.60,

  // Krypto
  'POL': 0.456940,
  'ETH': 8433.303466,
  'NEAR': 4.124902,
  'USDC': 3.555950,
  'LINK': 34.350477,
  'ADA': 1.399739,
  'SKL': 0.047685,
  'MINA': 0.234373,
  'AVAX': 50.032217,
  'API3': 1.885009,
  'SOL': 503.380282,
  'EGLD': 16.392930,
  'RUNE': 2.373241,
  'OP': 1.141460,
  'ARB': 0.768796,
  'MAGIC': 0.358795,
  'XSWAP': 0.069803,
  'BNB': 2732.100851,
  'JLP': 14.401598,
  'LAI': 0.000380,
  'STX': 0.893966,
  'EXD': 0.015721,
  'SOIL': 0.418180,
  'AZERO': 0.050246,
  'FOREX': 0.001398,
  'KAVA': 0.429203,
  '5IRE': 0.001829
};