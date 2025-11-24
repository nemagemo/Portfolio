
/**
 * FALLBACK PRICES
 * ===============
 * Ten plik służy jako awaryjne źródło cen dla aktywów, w przypadku gdy użytkownik
 * nie poda aktualnych danych z Google Sheets podczas wykonywania polecenia `AktualizujCeny`.
 * 
 * Format: 'SYMBOL': Cena_Jednostkowa_PLN
 */

export const FALLBACK_PRICES: Record<string, number> = {
  // Waluty
  'USD': 4.05,
  'EUR': 4.35,
  'GBP': 5.15,

  // Krypto (Przykładowe)
  'BTC': 385000,
  'ETH': 11500,
  'USDC': 4.05,

  // Akcje / ETF (Przykładowe)
  'AMZN': 850.00, // Cena w PLN (lub USD * Kurs)
  'MSFT': 1700.00,
  'VWCE.DE': 500.00,
  
  // PPK (Wartość jednostki lub całościowo - zależnie od logiki)
  'PPK': 1.0 // Zazwyczaj dla PPK podajemy wartość całkowitą bezpośrednio
};
