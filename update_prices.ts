import fs from 'fs';

const parseNumber = (val: string) => {
  if (!val) return 0;
  return parseFloat(val.replace(/\s/g, '').replace('zł', '').replace('%', '').replace(',', '.').trim());
};

const formatNumber = (num: number, isCurrency = false, isPercentage = false) => {
  let formatted = num.toFixed(2).replace('.', ',');
  const parts = formatted.split(',');
  // Add spaces as thousands separators
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  formatted = parts.join(',');
  if (isCurrency) return `"${formatted} zł"`;
  if (isPercentage) return `"${formatted}%"`;
  return `"${formatted}"`;
};

function splitCsv(str: string) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < str.length; i++) {
    const minChar = str[i];
    if (minChar === '"') {
      inQuotes = !inQuotes;
    } else if (minChar === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += minChar;
    }
  }
  result.push(current);
  return result;
}

const pricesNum = JSON.parse(fs.readFileSync('prices.json', 'utf-8'));

let openContent = fs.readFileSync('./CSV/OMFopen.ts', 'utf-8');
const dataMatchOpen = openContent.match(/export const OMF_OPEN_DATA = `([\s\S]*?)`;/);
if (!dataMatchOpen) process.exit(1);

let openLines = dataMatchOpen[1].split('\n');

for (let i = 1; i < openLines.length; i++) {
  const line = openLines[i];
  if (!line.trim()) continue;
  
  if (line.startsWith('Otwarta')) {
    const parts: string[] = splitCsv(line);
    const symbol = parts[3];
    const amountStr = parts[8];
    const amount = parseFloat(amountStr.replace(',', '.'));
    const purchaseVal = parseNumber(parts[10]);
    
    let newPrice = pricesNum[symbol];
    if (newPrice !== undefined) {
      let newCurrentVal = amount * newPrice;
      
      const profit = newCurrentVal - purchaseVal;
      const roi = purchaseVal !== 0 ? (profit / purchaseVal) * 100 : 0;
      
      parts[9] = formatNumber(newCurrentVal, true);
      parts[11] = formatNumber(profit, true);
      parts[12] = formatNumber(roi, false, true);
      
      openLines[i] = parts.map((p) => p.includes(',') || p.includes(' ') ? `"${p.replace(/"/g, '')}"` : p).join(',');
    }
  }
}

let finalOpenContent = openContent.replace(dataMatchOpen[1], openLines.join('\n'));
let updatedOpenMatch = finalOpenContent.match(/export const OMF_LAST_UPDATED = '.*?';/);
if (updatedOpenMatch) {
  finalOpenContent = finalOpenContent.replace(updatedOpenMatch[0], `export const OMF_LAST_UPDATED = '2026-05-13';`);
}
fs.writeFileSync('./CSV/OMFopen.ts', finalOpenContent, 'utf-8');
console.log('Prices updated in OMFopen.ts');
