import fs from 'fs';

const formatNumber = (num: number, isCurrency = false, isPercentage = false) => {
  let formatted = num.toFixed(2).replace('.', ',');
  const parts = formatted.split(',');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  formatted = parts.join(',');
  if (isCurrency) return `"${formatted} zł"`;
  if (isPercentage) return `"${formatted}%"`;
  return `"${formatted}"`;
};

const parseNumber = (str: string) => {
  if (!str) return 0;
  return parseFloat(str.replace(/"/g, '').replace(/ /g, '').replace(',', '.').replace('zł', '').replace('%', ''));
};

// 1. Update OMFopen.ts
let openContent = fs.readFileSync('./CSV/OMFopen.ts', 'utf-8');
let openLines = openContent.split('\n');

let usdcPrice = 0;
let linkPrice = 0;

let usdcClosedPurchaseValue = 0;
let usdcClosedAmount = 50;
let usdcClosedSellValue = 187;

for (let i = 0; i < openLines.length; i++) {
  if (openLines[i].startsWith('Otwarta,Krypto,Krypto,USDC,')) {
    let parts = openLines[i].split(',');
    let amountStr = parts[8].replace(/"/g, '');
    let amount = parseNumber(amountStr);
    
    let currentValStr = parts[9].replace(/"/g, '');
    let currentVal = parseNumber(currentValStr);
    usdcPrice = currentVal / amount;
    
    let purchaseValStr = parts[10].replace(/"/g, '');
    let purchaseVal = parseNumber(purchaseValStr);
    
    usdcClosedPurchaseValue = (50 / amount) * purchaseVal;
    
    let newAmount = amount - 50;
    let newPurchaseVal = purchaseVal - usdcClosedPurchaseValue;
    let newCurrentVal = newAmount * usdcPrice;
    let newProfit = newCurrentVal - newPurchaseVal;
    let newRoi = (newProfit / newPurchaseVal) * 100;
    
    parts[8] = `"${newAmount.toFixed(6).replace('.', ',')}"`;
    parts[9] = formatNumber(newCurrentVal, true);
    parts[10] = formatNumber(newPurchaseVal, true);
    parts[11] = formatNumber(newProfit, true);
    parts[12] = formatNumber(newRoi, false, true);
    
    // Check if parts[12] has a trailing backtick
    if (openLines[i].endsWith('`')) {
      parts[12] += '`';
    }
    
    openLines[i] = parts.join(',');
  }
  
  if (openLines[i].startsWith('Otwarta,Krypto,Krypto,LINK,')) {
    let parts = openLines[i].split(',');
    let amountStr = parts[8].replace(/"/g, '');
    let amount = parseNumber(amountStr);
    
    let currentValStr = parts[9].replace(/"/g, '');
    let currentVal = parseNumber(currentValStr);
    linkPrice = currentVal / amount;
    
    let purchaseValStr = parts[10].replace(/"/g, '');
    let purchaseVal = parseNumber(purchaseValStr);
    
    let newAmount = amount + 5.43;
    let newPurchaseVal = purchaseVal + 187;
    let newCurrentVal = newAmount * linkPrice;
    let newProfit = newCurrentVal - newPurchaseVal;
    let newRoi = (newProfit / newPurchaseVal) * 100;
    
    parts[7] = '2026-03-13'; // Ostatni zakup
    parts[8] = `"${newAmount.toFixed(6).replace('.', ',')}"`;
    parts[9] = formatNumber(newCurrentVal, true);
    parts[10] = formatNumber(newPurchaseVal, true);
    parts[11] = formatNumber(newProfit, true);
    parts[12] = formatNumber(newRoi, false, true);
    
    if (openLines[i].endsWith('`')) {
      parts[12] += '`';
    }
    
    openLines[i] = parts.join(',');
  }
}

fs.writeFileSync('./CSV/OMFopen.ts', openLines.join('\n'));

// 2. Update OMFclosed.ts
let closedContent = fs.readFileSync('./CSV/OMFclosed.ts', 'utf-8');
let closedLines = closedContent.split('\n');

let closedProfit = usdcClosedSellValue - usdcClosedPurchaseValue;
let closedRoi = (closedProfit / usdcClosedPurchaseValue) * 100;

let newClosedLine = `Zamknięta,Krypto,Krypto,USDC,,,393,2026-03-13,"50,000000",${formatNumber(usdcClosedSellValue, true)},${formatNumber(usdcClosedPurchaseValue, true)},${formatNumber(closedProfit, true)},${formatNumber(closedRoi, false, true)}`;

closedLines.splice(3, 0, newClosedLine); // Insert at index 3 (after the first data row or header)

fs.writeFileSync('./CSV/OMFclosed.ts', closedLines.join('\n'));

console.log('Transactions applied.');
