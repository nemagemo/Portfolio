
import { PPKDataRow, CryptoDataRow, IKEDataRow, OMFDataRow, AnyDataRow, ValidationReport, PortfolioType, OMFValidationReport, CashDataRow, DividendDataRow } from '../types';

/**
 * ARCHITECTURAL NOTE:
 * ===================
 * This file handles the parsing of raw CSV text into structured data objects.
 * 
 * 1. Aggressive Currency Parsing: `parseCurrency` strips all non-numeric chars (except ,.-) to handle
 *    various formats from Google Sheets/Excel (spaces, nbsp, currency symbols).
 * 
 * 2. Strategy Pattern: `parseCSV` acts as a dispatcher, delegating to specific functions 
 *    (`parseOMF`, `parsePPK`, etc.) based on the PortfolioType.
 */

// --- HELPERS ---

// Helper to parse Polish currency strings like "1 097,73 zł" or "95,45 zł"
export const parseCurrency = (val: string): number => {
  if (!val) return 0;
  // Remove everything that is NOT a digit, dot, comma, or minus sign.
  const clean = val.replace(/[^0-9.,-]/g, '').replace(/,/g, '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

const parsePercent = (val: string): number => {
  if (!val) return 0;
  const clean = val.replace(/[^0-9.,-]/g, '').replace(/,/g, '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

const parseFloatStr = (val: string): number => {
  if (!val) return 0;
  const clean = val.replace(/[^0-9.,-]/g, '').replace(/,/g, '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

// Regex to split by comma ONLY if not inside quotes
const splitCSVLine = (line: string) => line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

const createBaseReport = (source: 'Online' | 'Offline'): ValidationReport => ({
  isValid: true,
  source: source,
  checks: { structure: false, dataTypes: false, logic: false },
  errors: [],
  stats: { totalRows: 0, validRows: 0 }
});

// --- SPECIFIC PARSERS ---

const parseOMF = (lines: string[], source: 'Online' | 'Offline'): { data: AnyDataRow[], report: ValidationReport } => {
  const report = createBaseReport(source);
  const data: OMFDataRow[] = [];
  
  const headers = splitCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  
  const colMap: Record<string, number> = {
    status: -1, portfolio: -1, type: -1, symbol: -1, sector: -1, lastPurchase: -1,
    period: -1, quantity: -1, current: -1, purchase: -1, profit: -1, roi: -1
  };

  headers.forEach((h, index) => {
    if (h.includes('status')) colMap.status = index;
    else if (h.includes('portfel')) colMap.portfolio = index;
    else if (h.includes('typ')) colMap.type = index;
    else if (h.includes('symbol')) colMap.symbol = index;
    else if (h.includes('sektor')) colMap.sector = index;
    else if (h.includes('ostatni zakup')) colMap.lastPurchase = index;
    else if (h.includes('okres')) colMap.period = index;
    else if (h.includes('ilość') || h.includes('ilosc')) colMap.quantity = index;
    else if (h.includes('obecna wartośc') || h.includes('obecna wartosc') || h.includes('obecna wartość')) colMap.current = index;
    else if (h.includes('wartośc zakupu') || h.includes('wartosc zakupu') || h.includes('wartość zakupu')) colMap.purchase = index;
    else if (h.includes('zysk')) colMap.profit = index;
    else if (h.includes('roi')) colMap.roi = index;
  });

  const missingCols = [];
  if (colMap.status === -1) missingCols.push("Status pozycji");
  if (colMap.portfolio === -1) missingCols.push("Portfel");
  if (colMap.symbol === -1) missingCols.push("Symbol");
  if (colMap.current === -1) missingCols.push("Obecna wartość");

  if (missingCols.length > 0) {
     report.isValid = false;
     report.errors.push(`[OMF] Brak wymaganych kolumn: ${missingCols.join(', ')}`);
     return { data: [], report };
  }
  report.checks.structure = true;

  let parseErrors = 0;
  let logicErrors = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    report.stats.totalRows++;

    const rowRaw = splitCSVLine(line);
    const row = rowRaw.map(cell => cell.replace(/^"|"$/g, '').trim());

    const status = row[colMap.status];
    const portfolio = row[colMap.portfolio];
    const assetType = row[colMap.type];
    const symbol = row[colMap.symbol];
    const sector = colMap.sector !== -1 ? row[colMap.sector] : '';
    const lastPurchase = colMap.lastPurchase !== -1 ? row[colMap.lastPurchase] : '';
    const period = colMap.period !== -1 ? row[colMap.period] : '';
    
    const quantity = colMap.quantity !== -1 ? parseFloatStr(row[colMap.quantity]) : 0;
    const currentVal = parseCurrency(row[colMap.current]);
    const purchaseVal = colMap.purchase !== -1 ? parseCurrency(row[colMap.purchase]) : 0;
    const profitVal = colMap.profit !== -1 ? parseCurrency(row[colMap.profit]) : 0;
    const roiVal = colMap.roi !== -1 ? parsePercent(row[colMap.roi]) : 0;

    if (isNaN(currentVal)) {
      report.errors.push(`Wiersz ${i+1}: Błąd formatu kwoty (Obecna wartość).`);
      parseErrors++;
      continue;
    }

    if (purchaseVal > 0 && Math.abs((purchaseVal + profitVal) - currentVal) > 1.00) {
       logicErrors++;
    }

    data.push({
      status, portfolio, type: assetType, symbol, sector, 
      lastPurchaseDate: lastPurchase, investmentPeriod: period,
      quantity, currentValue: currentVal, purchaseValue: purchaseVal, profit: profitVal, roi: roiVal
    });
  }

  report.stats.validRows = data.length;
  if (parseErrors === 0) report.checks.dataTypes = true;
  if (logicErrors === 0) report.checks.logic = true;

  return { data, report };
};

const parsePPK = (lines: string[], source: 'Online' | 'Offline'): { data: AnyDataRow[], report: ValidationReport } => {
  const report = createBaseReport(source);
  const data: PPKDataRow[] = [];
  
  const headers = splitCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  
  const columnMap: Record<string, number> = {
    date: -1, employee: -1, employer: -1, state: -1, fundProfit: -1, totalUserProfit: -1, tax: -1, roi: -1, exitRoi: -1
  };

  headers.forEach((h, index) => {
    if (h.includes('data')) columnMap.date = index;
    else if (h.includes('pracownik')) columnMap.employee = index;
    else if (h.includes('pracodawca')) columnMap.employer = index;
    else if (h.includes('państwo') || h.includes('panstwo')) columnMap.state = index;
    else if (h.includes('zysk funduszu')) columnMap.fundProfit = index;
    else if (h.includes('całkowity zysk')) columnMap.totalUserProfit = index;
    else if (h.includes('podatek')) columnMap.tax = index;
    else if (h.includes('exit roi')) columnMap.exitRoi = index;
    else if (h.includes('roi')) columnMap.roi = index;
  });

  const missingColumns = [];
  if (columnMap.date === -1) missingColumns.push("Data");
  if (columnMap.employee === -1) missingColumns.push("Pracownik");
  if (columnMap.employer === -1) missingColumns.push("Pracodawca");
  if (columnMap.totalUserProfit === -1) missingColumns.push("Całkowity Zysk");
  
  if (missingColumns.length > 0) {
    report.isValid = false;
    report.errors.push(`[PPK] Brak wymaganych kolumn: ${missingColumns.join(', ')}`);
    return { data: [], report };
  }
  report.checks.structure = true;

  let parseErrors = 0;
  let logicErrors = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    report.stats.totalRows++;

    const rowRaw = splitCSVLine(line);
    const row = rowRaw.map(cell => cell.replace(/^"|"$/g, '').trim());

    const dateStr = row[columnMap.date];
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) {
      report.errors.push(`Wiersz ${i + 1}: Nieprawidłowy format daty.`);
      parseErrors++;
      continue;
    }

    const employee = parseCurrency(row[columnMap.employee]);
    const employer = parseCurrency(row[columnMap.employer]);
    const state = columnMap.state !== -1 ? parseCurrency(row[columnMap.state]) : 0;
    const fundProfit = columnMap.fundProfit !== -1 ? parseCurrency(row[columnMap.fundProfit]) : 0;
    const totalUserProfit = columnMap.totalUserProfit !== -1 ? parseCurrency(row[columnMap.totalUserProfit]) : 0;
    const tax = columnMap.tax !== -1 ? -Math.abs(parseCurrency(row[columnMap.tax])) : 0;
    const roi = columnMap.roi !== -1 ? parsePercent(row[columnMap.roi]) : 0;

    if (isNaN(employee) || isNaN(employer)) {
      report.errors.push(`Wiersz ${i + 1}: Błąd parsowania wartości liczbowych.`);
      parseErrors++;
      continue;
    }

    if (employee < 0 || employer < 0) {
       report.errors.push(`Wiersz ${i + 1}: Ujemna wartość składki.`);
       logicErrors++;
    }
    
    const totalValue = parseFloat((employee + employer + state + fundProfit).toFixed(2));
    const userProfit = totalUserProfit;
    const exitGain = (fundProfit * 0.81) + (employer * 0.70);
    const calculatedExitRoi = employee > 0 ? (exitGain / employee) * 100 : 0;

    data.push({
      date: dateStr, dateObj,
      employeeContribution: employee, employerContribution: employer, stateContribution: state,
      fundProfit: fundProfit,
      profit: userProfit, 
      tax, roi, 
      exitRoi: calculatedExitRoi,
      totalValue: totalValue
    });
  }

  report.stats.validRows = data.length;
  if (parseErrors === 0) report.checks.dataTypes = true;
  if (logicErrors === 0) report.checks.logic = true;

  return { data, report };
};

const parseCash = (lines: string[], source: 'Online' | 'Offline'): { data: AnyDataRow[], report: ValidationReport } => {
  const report = createBaseReport(source);
  const data: CashDataRow[] = [];
  
  const headers = splitCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const columnMap: Record<string, number> = { date: -1, value: -1 };
  
  headers.forEach((h, index) => {
    if (h.includes('data')) columnMap.date = index;
    else if (h.includes('kwota') || h.includes('wartość') || h.includes('value')) columnMap.value = index;
  });

  if (columnMap.date === -1 || columnMap.value === -1) {
    report.isValid = false;
    report.errors.push(`[CASH] Brak wymaganych kolumn: Data, Kwota`);
    return { data: [], report };
  }
  report.checks.structure = true;

  let parseErrors = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    report.stats.totalRows++;

    const rowRaw = splitCSVLine(line);
    const row = rowRaw.map(cell => cell.replace(/^"|"$/g, '').trim());

    const dateStr = row[columnMap.date];
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) {
      report.errors.push(`Wiersz ${i + 1}: Nieprawidłowy format daty.`);
      parseErrors++;
      continue;
    }

    const val = parseCurrency(row[columnMap.value]);
    if (isNaN(val)) {
      report.errors.push(`Wiersz ${i + 1}: Błąd parsowania kwoty.`);
      parseErrors++;
      continue;
    }

    data.push({ date: dateStr, dateObj, value: val });
  }

  report.stats.validRows = data.length;
  if (parseErrors === 0) report.checks.dataTypes = true;
  report.checks.logic = true;

  return { data, report };
};

const parseDividends = (lines: string[], source: 'Online' | 'Offline'): { data: AnyDataRow[], report: ValidationReport } => {
  const report = createBaseReport(source);
  const data: DividendDataRow[] = [];
  
  const headers = splitCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const columnMap: Record<string, number> = { date: -1, portfolio: -1, symbol: -1, value: -1, status: -1 };
  
  headers.forEach((h, index) => {
    if (h.includes('data')) columnMap.date = index;
    else if (h.includes('portfel')) columnMap.portfolio = index;
    else if (h.includes('symbol') || h.includes('aktywo')) columnMap.symbol = index;
    else if (h.includes('kwota')) columnMap.value = index;
    else if (h.includes('status') || h.includes('uwagi')) columnMap.status = index;
  });

  if (columnMap.date === -1 || columnMap.value === -1 || columnMap.portfolio === -1) {
    report.isValid = false;
    report.errors.push(`[DIVIDENDS] Brak wymaganych kolumn: Data, Portfel, Symbol, Kwota`);
    return { data: [], report };
  }
  report.checks.structure = true;

  let parseErrors = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    report.stats.totalRows++;

    const rowRaw = splitCSVLine(line);
    const row = rowRaw.map(cell => cell.replace(/^"|"$/g, '').trim());

    const dateStr = row[columnMap.date];
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) {
      continue;
    }

    const val = parseCurrency(row[columnMap.value]);
    if (isNaN(val)) {
      report.errors.push(`Wiersz ${i + 1}: Błąd parsowania kwoty dywidendy.`);
      parseErrors++;
      continue;
    }

    const status = columnMap.status !== -1 ? row[columnMap.status] : '';
    const isCounted = !status.toLowerCase().includes('historyczna');

    data.push({
      date: dateStr,
      dateObj,
      portfolio: row[columnMap.portfolio],
      symbol: columnMap.symbol !== -1 ? row[columnMap.symbol] : 'Unknown',
      value: val,
      isCounted
    });
  }

  report.stats.validRows = data.length;
  if (parseErrors === 0) report.checks.dataTypes = true;
  report.checks.logic = true;

  return { data, report };
};

const parseStandard = (lines: string[], type: PortfolioType, source: 'Online' | 'Offline'): { data: AnyDataRow[], report: ValidationReport } => {
  const report = createBaseReport(source);
  const data: AnyDataRow[] = [];
  
  const headers = splitCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const columnMap: Record<string, number> = {
    date: -1, investment: -1, profit: -1, roi: -1
  };

  headers.forEach((h, index) => {
    if (h.includes('data')) columnMap.date = index;
    else if (h.includes('wkład') || h.includes('wklad')) columnMap.investment = index;
    else if (h.includes('zysk')) columnMap.profit = index;
    else if (h.includes('roi')) columnMap.roi = index;
  });

  const missingColumns = [];
  if (columnMap.date === -1) missingColumns.push("Data");
  if (columnMap.investment === -1) missingColumns.push("Wkład");
  if (columnMap.profit === -1) missingColumns.push("Zysk");

  if (missingColumns.length > 0) {
    report.isValid = false;
    report.errors.push(`[${type}] Brak wymaganych kolumn: ${missingColumns.join(', ')}`);
    return { data: [], report };
  }
  report.checks.structure = true;

  let parseErrors = 0;
  let logicErrors = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    report.stats.totalRows++;

    const rowRaw = splitCSVLine(line);
    const row = rowRaw.map(cell => cell.replace(/^"|"$/g, '').trim());

    const dateStr = row[columnMap.date];
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) {
      report.errors.push(`Wiersz ${i + 1}: Nieprawidłowy format daty.`);
      parseErrors++;
      continue;
    }

    const invRaw = row[columnMap.investment];
    const profRaw = row[columnMap.profit];
    const roiRaw = columnMap.roi !== -1 ? row[columnMap.roi] : '';
    
    // IKE Specific: filter out empty rows before start
    if (type === 'IKE' && !invRaw && !profRaw && !roiRaw) {
      continue;
    }

    const investment = parseCurrency(invRaw);
    const profit = parseCurrency(profRaw);
    const roi = columnMap.roi !== -1 ? parsePercent(roiRaw) : 0;

    if (isNaN(investment) || isNaN(profit)) {
       report.errors.push(`Wiersz ${i + 1}: Błąd parsowania wartości liczbowych.`);
       parseErrors++;
       continue;
    }

    if (investment < 0) {
      report.errors.push(`Wiersz ${i + 1}: Ujemny wkład własny.`);
      logicErrors++;
    }

    const totalValue = parseFloat((investment + profit).toFixed(2));

    let taxedTotalValue = undefined;
    if (type === 'IKE') {
       const tax = profit > 0 ? profit * 0.19 : 0;
       taxedTotalValue = totalValue - tax;
    }

    const rowData = {
      date: dateStr, dateObj,
      investment, profit, roi,
      totalValue,
      taxedTotalValue
    };

    if (type === 'CRYPTO') {
      data.push(rowData as CryptoDataRow);
    } else {
      data.push(rowData as IKEDataRow);
    }
  }

  report.stats.validRows = data.length;
  if (parseErrors === 0) report.checks.dataTypes = true;
  if (logicErrors === 0) report.checks.logic = true;

  return { data, report };
};

// --- MAIN PARSER DISPATCHER ---

export const parseCSV = (csvText: string, type: PortfolioType, source: 'Online' | 'Offline' = 'Offline'): { data: AnyDataRow[], report: ValidationReport } => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    const report = createBaseReport(source);
    report.isValid = false;
    report.errors.push("Plik jest pusty lub nie zawiera danych.");
    return { data: [], report };
  }

  switch (type) {
    case 'OMF':
      return parseOMF(lines, source);
    case 'PPK':
      return parsePPK(lines, source);
    case 'CASH':
      return parseCash(lines, source);
    case 'DIVIDENDS':
      return parseDividends(lines, source);
    case 'IKE':
    case 'CRYPTO':
      return parseStandard(lines, type, source);
    default:
      // Fallback for unknown types (should not happen with proper typing)
      const report = createBaseReport(source);
      report.isValid = false;
      report.errors.push(`Nieznany typ portfela: ${type}`);
      return { data: [], report };
  }
};

/**
 * Specialized OMF Integrity Check.
 * Unlike standard parsing, this looks at the semantic consistency of the portfolio.
 */
export const validateOMFIntegrity = (data: OMFDataRow[], source: 'Online' | 'Offline' = 'Offline'): OMFValidationReport => {
   const report: OMFValidationReport = {
     isConsistent: true,
     source: source,
     checks: { structure: true, mathIntegrity: true },
     messages: [],
     stats: { totalAssets: data.length, openAssets: 0, closedAssets: 0 }
   };
   
   let mathErrors = 0;

   data.forEach(row => {
     if (row.status === 'Otwarta') report.stats.openAssets++;
     if (row.status === 'Zamknięta') report.stats.closedAssets++;

     const expectedCurrent = row.purchaseValue + row.profit;
     // Tolerance slightly increased for float comparison (1.00 PLN to handle rounding/source errors)
     if (Math.abs(expectedCurrent - row.currentValue) > 1.00) {
       mathErrors++;
       report.messages.push(`Błąd matematyczny dla ${row.symbol}: Zakup (${row.purchaseValue}) + Wynik (${row.profit}) != Obecna (${row.currentValue})`);
     }
   });

   if (mathErrors > 0) {
     report.checks.mathIntegrity = false;
     report.isConsistent = false;
     report.messages.unshift(`Znaleziono ${mathErrors} niespójności matematycznych w wierszach.`);
   }

   return report;
};
