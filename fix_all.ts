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

// 1. Fix Transactions.ts
let txContent = fs.readFileSync('./CSV/Transactions.ts', 'utf-8');
txContent = txContent.replace(
  '2026-03-13,Krypto,Sprzedaż,USDC,"50,000000","187,00 zł",PLN\n2026-03-13,Krypto,Kupno,LINK,"5,430000","187,00 zł",PLN',
  '2026-03-13,Krypto,Sprzedaż,USDC,"50,000000","187,00 zł",PLN\n2026-03-13,Krypto,Kupno,LINK,"5,734300","187,00 zł",PLN\n2026-03-13,Krypto,Sprzedaż,USDC,"50,000000","187,00 zł",PLN\n2026-03-13,Krypto,Kupno,LINK,"5,430000","187,00 zł",PLN'
);
fs.writeFileSync('./CSV/Transactions.ts', txContent);

// 2. Fix OMFopen.ts
let openContent = fs.readFileSync('./CSV/OMFopen.ts', 'utf-8');
let openLines = openContent.split('\n');

// Original state before my actions today
let usdcPrice = 917.63 / 247.21;
let linkPrice = 620.78 / 19.091063;

let usdcClosedPurchaseValue = (50 / 247.21) * 911.14;
let newUsdcAmount = 247.21 - 50 - 50; // Two sales of 50 USDC
let newUsdcPurchaseVal = 911.14 - usdcClosedPurchaseValue - usdcClosedPurchaseValue;
let newUsdcCurrentVal = newUsdcAmount * usdcPrice;
let newUsdcProfit = newUsdcCurrentVal - newUsdcPurchaseVal;
let newUsdcRoi = (newUsdcProfit / newUsdcPurchaseVal) * 100;

let newLinkAmount = 19.091063 + 5.7343 + 5.43; // Two purchases
let newLinkPurchaseVal = 682.07 + 187 + 187;
let newLinkCurrentVal = newLinkAmount * linkPrice;
let newLinkProfit = newLinkCurrentVal - newLinkPurchaseVal;
let newLinkRoi = (newLinkProfit / newLinkPurchaseVal) * 100;

let finalUsdcLine = `Otwarta,Krypto,Krypto,USDC,,,393,2026-03-13,"${newUsdcAmount.toFixed(6).replace('.', ',')}",${formatNumber(newUsdcCurrentVal, true)},${formatNumber(newUsdcPurchaseVal, true)},${formatNumber(newUsdcProfit, true)},${formatNumber(newUsdcRoi, false, true)}`;
let finalLinkLine = `Otwarta,Krypto,Krypto,LINK,,,1023,2026-03-13,"${newLinkAmount.toFixed(6).replace('.', ',')}",${formatNumber(newLinkCurrentVal, true)},${formatNumber(newLinkPurchaseVal, true)},${formatNumber(newLinkProfit, true)},${formatNumber(newLinkRoi, false, true)}`;

for (let i = 0; i < openLines.length; i++) {
  if (openLines[i].includes(',USDC,')) openLines[i] = finalUsdcLine;
  if (openLines[i].includes(',LINK,')) openLines[i] = finalLinkLine;
}
fs.writeFileSync('./CSV/OMFopen.ts', openLines.join('\n'));

// 3. Fix OMFclosed.ts
let closedContent = fs.readFileSync('./CSV/OMFclosed.ts', 'utf-8');
let closedLines = closedContent.split('\n');

let closedProfit = 187 - usdcClosedPurchaseValue;
let closedRoi = (closedProfit / usdcClosedPurchaseValue) * 100;
let newClosedLine = `Zamknięta,Krypto,Krypto,USDC,,,393,2026-03-13,"50,000000","187,00 zł",${formatNumber(usdcClosedPurchaseValue, true)},${formatNumber(closedProfit, true)},${formatNumber(closedRoi, false, true)}`;

// Check if it's already there to avoid duplicates
let hasClosedLine = false;
for (let i = 0; i < closedLines.length; i++) {
  if (closedLines[i].includes('Zamknięta,Krypto,Krypto,USDC,,,393,2026-03-13,"50,000000"')) {
    // It's there, but we need TWO of them!
    // Let's just remove all matching and add two.
  }
}

closedLines = closedLines.filter(l => !l.includes('Zamknięta,Krypto,Krypto,USDC,,,393,2026-03-13,"50,000000"'));
closedLines.splice(3, 0, newClosedLine);
closedLines.splice(3, 0, newClosedLine);

fs.writeFileSync('./CSV/OMFclosed.ts', closedLines.join('\n'));

// 4. Fix Krypto.ts
let totalCurrentValue = 0;
openLines.forEach(line => {
  if (line.includes(',Krypto,')) {
    let match = line.match(/"([^"]+)"/g);
    if (match && match.length >= 5) totalCurrentValue += parseNumber(match[1]);
  }
});
closedLines.forEach(line => {
  if (line.includes(',Krypto,')) {
    let match = line.match(/"([^"]+)"/g);
    if (match && match.length >= 5) totalCurrentValue += parseNumber(match[1]);
  }
});

let wklad = 8169.54;
let totalProfit = totalCurrentValue - wklad;
let totalRoi = (totalProfit / wklad) * 100;

let kryptoContent = fs.readFileSync('./CSV/Krypto.ts', 'utf-8');
let kryptoLines = kryptoContent.split('\n');
let lastLineIndex = kryptoLines.findIndex(l => l.startsWith('2026-03-31'));
if (lastLineIndex !== -1) {
  kryptoLines[lastLineIndex] = `2026-03-31,"${formatNumber(wklad, true).replace(/"/g, '')}",${formatNumber(totalProfit, true)},${formatNumber(totalRoi, false, true)}\``;
}
fs.writeFileSync('./CSV/Krypto.ts', kryptoLines.join('\n'));

console.log('Done');
