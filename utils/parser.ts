
import { PPKDataRow, CryptoDataRow, IKEDataRow, OMFDataRow, AnyDataRow, ValidationReport, PortfolioType, OMFValidationReport } from '../types';

// Helper to parse Polish currency strings like "1 097,73 zł" or "95,45 zł"
const parseCurrency = (val: string): number => {
  if (!val) return 0;
  // Remove 'zł', remove spaces (including non-breaking \s covers \u00A0, but explicit \u00A0 is safer for Google Sheets), replace comma with dot
  // Google Sheets often uses \u00A0 (nbsp) for thousand separators.
  const clean = val.replace(/zł/g, '')
                   .replace(/\u00A0/g, '') // Explicitly remove non-breaking space
                   .replace(/\s/g, '')     // Remove standard whitespace
                   .replace(/,/g, '.')
                   .trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

// Helper to parse percentage strings like "70,13%"
const parsePercent = (val: string): number => {
  if (!val) return 0;
  const clean = val.replace(/%/g, '')
                   .replace(/\u00A0/g, '')
                   .replace(/\s/g, '')
                   .replace(/,/g, '.')
                   .trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

// Helper to parse standard float strings with comma or dot
const parseFloatStr = (val: string): number => {
  if (!val) return 0;
  const clean = val.replace(/\u00A0/g, '')
                   .replace(/\s/g, '')
                   .replace(/,/g, '.')
                   .trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

export const parseCSV = (csvText: string, type: PortfolioType): { data: AnyDataRow[], report: ValidationReport } => {
  const report: ValidationReport = {
    isValid: true,
    checks: { structure: false, dataTypes: false, logic: false },
    errors: [],
    stats: { totalRows: 0, validRows: 0 }
  };

  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    report.isValid = false;
    report.errors.push("Plik jest pusty lub nie zawiera danych.");
    return { data: [], report };
  }

  const splitCSVLine = (line: string) => line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  const headers = splitCSVLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  
  const data: AnyDataRow[] = [];
  let parseErrors = 0;
  let logicErrors = 0;

  if (type === 'OMF') {
    // --- OMF PARSING LOGIC ---
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
      
      // Fixed header matching to include correct Polish spelling "wartość"
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

      // Logic Check (Triple Check Part 3: Math Integrity)
      // Tolerance slightly increased to 0.10 to account for rounding diffs in sheets
      if (purchaseVal > 0 && Math.abs((purchaseVal + profitVal) - currentVal) > 0.10) {
         logicErrors++;
      }

      data.push({
        status, portfolio, type: assetType, symbol, sector, 
        lastPurchaseDate: lastPurchase, investmentPeriod: period,
        quantity, currentValue: currentVal, purchaseValue: purchaseVal, profit: profitVal, roi: roiVal
      } as OMFDataRow);
    }

  } else if (type === 'PPK') {
    // --- PPK PARSING LOGIC ---
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
      
      // fundProfit is "Zysk Funduszu"
      const fundProfit = columnMap.fundProfit !== -1 ? parseCurrency(row[columnMap.fundProfit]) : 0;
      
      // totalUserProfit is "Całkowity Zysk"
      const totalUserProfit = columnMap.totalUserProfit !== -1 ? parseCurrency(row[columnMap.totalUserProfit]) : 0;
      
      const tax = columnMap.tax !== -1 ? -Math.abs(parseCurrency(row[columnMap.tax])) : 0;
      const roi = columnMap.roi !== -1 ? parsePercent(row[columnMap.roi]) : 0;
      const exitRoi = columnMap.exitRoi !== -1 ? parsePercent(row[columnMap.exitRoi]) : 0;

      if (isNaN(employee) || isNaN(employer)) {
        report.errors.push(`Wiersz ${i + 1}: Błąd parsowania wartości liczbowych.`);
        parseErrors++;
        continue;
      }

      if (employee < 0 || employer < 0) {
         report.errors.push(`Wiersz ${i + 1}: Ujemna wartość składki.`);
         logicErrors++;
      }
      
      // UPDATE: Total Value = Employee + Employer + State + Fund Profit
      const totalValue = parseFloat((employee + employer + state + fundProfit).toFixed(2));
      
      // UPDATE: Profit (My Profit) = Value from "Całkowity Zysk" column
      const userProfit = totalUserProfit;

      data.push({
        date: dateStr, dateObj,
        employeeContribution: employee, employerContribution: employer, stateContribution: state,
        fundProfit: fundProfit,
        profit: userProfit, // This maps "Całkowity Zysk" to the generic "profit" field
        tax, roi, exitRoi,
        totalValue: totalValue
      } as PPKDataRow);
    }

  } else {
    // --- CRYPTO & IKE PARSING LOGIC ---
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

      // Check for empty values specifically for IKE to filter out "non-started" months
      const invRaw = row[columnMap.investment];
      const profRaw = row[columnMap.profit];
      const roiRaw = columnMap.roi !== -1 ? row[columnMap.roi] : '';
      
      if (type === 'IKE' && !invRaw && !profRaw && !roiRaw) {
        continue;
      }

      const investment = parseCurrency(row[columnMap.investment]);
      const profit = parseCurrency(row[columnMap.profit]);
      const roi = columnMap.roi !== -1 ? parsePercent(row[columnMap.roi]) : 0;

      if (isNaN(investment) || isNaN(profit)) {
         report.errors.push(`Wiersz ${i + 1}: Błąd parsowania wartości liczbowych.`);
         parseErrors++;
         continue;
      }

      if (investment < 0) {
        report.errors.push(`Wiersz ${i + 1}: Ujemny wkład własny.`);
        logicErrors++;
      }

      const rowData = {
        date: dateStr, dateObj,
        investment, profit, roi,
        totalValue: parseFloat((investment + profit).toFixed(2))
      };

      if (type === 'CRYPTO') {
        data.push(rowData as CryptoDataRow);
      } else {
        data.push(rowData as IKEDataRow);
      }
    }
  }

  report.stats.validRows = data.length;
  if (parseErrors === 0) report.checks.dataTypes = true;
  if (logicErrors === 0) report.checks.logic = true;

  if (data.length === 0) {
    report.isValid = false;
    report.errors.push("Nie udało się zaimportować żadnych poprawnych wierszy danych.");
  }

  return { data, report };
};

// Special OMF Integrity Check Function
export const validateOMFIntegrity = (data: OMFDataRow[]): OMFValidationReport => {
   const report: OMFValidationReport = {
     isConsistent: true,
     checks: { structure: true, mathIntegrity: true },
     messages: [],
     stats: { totalAssets: data.length, openAssets: 0, closedAssets: 0 }
   };
   
   let mathErrors = 0;

   data.forEach(row => {
     if (row.status === 'Otwarta') report.stats.openAssets++;
     if (row.status === 'Zamknięta') report.stats.closedAssets++;

     const expectedCurrent = row.purchaseValue + row.profit;
     // Tolerance slightly increased for float comparison
     if (Math.abs(expectedCurrent - row.currentValue) > 0.10) {
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
}
