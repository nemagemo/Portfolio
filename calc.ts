import fs from 'fs';

const parseNumber = (str: string) => {
  if (!str) return 0;
  return parseFloat(str.replace(/"/g, '').replace(/ /g, '').replace(',', '.').replace('zł', '').replace('%', ''));
};

const formatNumber = (num: number, isCurrency = false, isPercentage = false) => {
  let formatted = num.toFixed(2).replace('.', ',');
  const parts = formatted.split(',');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  formatted = parts.join(',');
  if (isCurrency) return `"${formatted} zł"`;
  if (isPercentage) return `"${formatted}%"`;
  return `"${formatted}"`;
};

let openContent = fs.readFileSync('./CSV/OMFopen.ts', 'utf-8');
let openLines = openContent.split('\n');

let finalUsdcLine = `Otwarta,Krypto,Krypto,USDC,,,393,2026-03-13,"197,210000","732,03 zł","726,86 zł","5,17 zł","0,71%"`;
let finalLinkLine = `Otwarta,Krypto,Krypto,LINK,,,1023,2026-03-13,"24,521063","797,35 zł","869,07 zł","-71,72 zł","-8,25%"`;

for (let i = 0; i < openLines.length; i++) {
  if (openLines[i].includes(',USDC,')) openLines[i] = finalUsdcLine;
  if (openLines[i].includes(',LINK,')) openLines[i] = finalLinkLine;
}
fs.writeFileSync('./CSV/OMFopen.ts', openLines.join('\n'));

let closedContent = fs.readFileSync('./CSV/OMFclosed.ts', 'utf-8');
let closedLines = closedContent.split('\n');

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
  kryptoLines[lastLineIndex] = `2026-03-31,"8 169,54 zł",${formatNumber(totalProfit, true)},${formatNumber(totalRoi, false, true)}\``;
}
fs.writeFileSync('./CSV/Krypto.ts', kryptoLines.join('\n'));

console.log('Fixed OMFopen.ts and Krypto.ts');
