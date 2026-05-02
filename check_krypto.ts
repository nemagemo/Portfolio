import fs from 'fs';

function parseNumber(val) {
  if (!val) return 0;
  return parseFloat(val.replace(/\s/g, '').replace('zł', '').replace('%', '').replace(',', '.').trim());
}

function splitCsv(str) {
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

let openContent = fs.readFileSync('./CSV/OMFopen.ts', 'utf-8');
const dataMatchOpen = openContent.match(/export const OMF_OPEN_DATA = `([\s\S]*?)`;/);
let openLines = dataMatchOpen[1].split('\n').slice(1).filter(l => l.trim().length > 0);

let closedContent = fs.readFileSync('./CSV/OMFclosed.ts', 'utf-8');
const dataMatchClosed = closedContent.match(/export const OMF_CLOSED_DATA = `([\s\S]*?)`;/);
let closedLines = dataMatchClosed[1].split('\n').slice(1).filter(l => l.trim().length > 0);

let divContent = fs.readFileSync('./CSV/Dividends.ts', 'utf-8');
let divLines = divContent.match(/export const DIVIDENDS_DATA = `([\s\S]*?)`;/)[1].split('\n').slice(1).filter(l => l.trim().length > 0);

let activeDivs = { IKE: 0, Krypto: 0, PPK: 0 };
divLines.forEach(l => {
    let parts = splitCsv(l);
    if (parts.length >= 5 && parts[4].replace(/"/g, '') === 'Aktywna') {
        activeDivs[parts[1].replace(/"/g, '')] += parseNumber(parts[3].replace(/"/g, ''));
    }
});

let openPurchaseValue = 0;
let openCurrentValue = 0;

console.log("--- OPEN POSITIONS (KRYPTO) ---");
openLines.forEach(l => {
    let p = splitCsv(l);
    if(p[1] === 'Krypto') {
        let pv = parseNumber(p[10]);
        let cv = parseNumber(p[9]);
        openPurchaseValue += pv;
        openCurrentValue += cv;
        console.log(`Symbol: ${p[3]}, Zakup: ${pv}, Obecna: ${cv}`);
    }
});

let closedProfit = 0;
console.log("\n--- CLOSED POSITIONS (KRYPTO) ---");
closedLines.forEach(l => {
    let p = splitCsv(l);
    if(p[1] === 'Krypto') {
        let cp = parseNumber(p[11]); 
        closedProfit += cp;
        console.log(`Symbol: ${p[3]}, Zysk: ${cp}`);
    }
});

let divs = activeDivs['Krypto'] || 0;
let wklad = openPurchaseValue - closedProfit - divs;
let profit = openCurrentValue - wklad;
let roi = wklad !== 0 ? (profit / wklad) * 100 : 0;

console.log("\n--- WYNIKI ---");
console.log(`Suma zakupu otwartych: ${openPurchaseValue}`);
console.log(`Suma zysku zamkniętych: ${closedProfit}`);
console.log(`Aktywne dywidendy (Krypto): ${divs}`);
console.log(`Wkład (Zakup - Zysk zamkniety - Dywidendy): ${wklad}`);
console.log(`Obecna wartość otwartych: ${openCurrentValue}`);
console.log(`Zysk całkowity: ${profit}`);
console.log(`ROI: ${roi.toFixed(2)}%`);

let kryptoContent = fs.readFileSync('./CSV/Krypto.ts', 'utf-8');
const dataMatchKrypto = kryptoContent.match(/export const KRYPTO_DATA = `([\s\S]*?)`;/);
let lastKryptoLines = dataMatchKrypto[1].split('\n').filter(l => l.trim().length > 0).slice(-2);
console.log("\n--- OSTATNIE WPISY W CSV/Krypto.ts ---");
lastKryptoLines.forEach(l => console.log(l));
