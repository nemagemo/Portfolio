import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Scale } from 'lucide-react';
import { ValidationReport, OMFValidationReport } from '../types';
import { Theme, themeStyles } from '../theme/styles';

export const DataStatus: React.FC<{ report: ValidationReport, theme: Theme }> = ({ report, theme }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (report.isValid && report.errors.length === 0) {
    return null;
  }

  const isCritical = !report.isValid;
  const containerClass = themeStyles[theme].cardContainer;

  return (
    <div className={`${containerClass} p-4 mb-6 transition-all ${isCritical ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isCritical ? 'bg-rose-100' : 'bg-amber-100'}`}>
            {isCritical ? <XCircle className="text-rose-600 w-5 h-5" /> : <AlertTriangle className="text-amber-600 w-5 h-5" />}
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${isCritical ? 'text-rose-800' : 'text-amber-800'}`}>
              {isCritical ? 'Błąd weryfikacji danych' : 'Ostrzeżenia dotyczące danych'}
            </h3>
            <div className="flex space-x-4 text-xs mt-1 opacity-80">
              <span className="flex items-center">
                {report.checks.structure ? <CheckCircle2 size={12} className="mr-1 text-emerald-600"/> : <XCircle size={12} className="mr-1"/>} 
                Struktura
              </span>
              <span className="flex items-center">
                {report.checks.dataTypes ? <CheckCircle2 size={12} className="mr-1 text-emerald-600"/> : <XCircle size={12} className="mr-1"/>} 
                Formaty
              </span>
              <span className="flex items-center">
                {report.checks.logic ? <CheckCircle2 size={12} className="mr-1 text-emerald-600"/> : <XCircle size={12} className="mr-1"/>} 
                Logika
                {report.source && <span className="ml-1 font-bold opacity-75">• {report.source}</span>}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-white/50">
            {report.stats.validRows} / {report.stats.totalRows} wierszy
          </span>
          {expanded ? <ChevronUp size={18} className="opacity-50"/> : <ChevronDown size={18} className="opacity-50"/>}
        </div>
      </div>
      
      {expanded && report.errors.length > 0 && (
        <div className="mt-4 pt-4 border-t border-black/5 text-xs font-mono">
          <p className="font-semibold mb-2 opacity-70">Log błędów:</p>
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {report.errors.map((err, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-slate-700">
                <span className="mt-0.5">•</span>
                <span>{err}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const OMFIntegrityStatus: React.FC<{ report: OMFValidationReport, theme: Theme }> = ({ report, theme }) => {
  const [expanded, setExpanded] = useState(false);
  const isPerfect = report.isConsistent && report.messages.length === 0;
  const isCritical = !report.isConsistent;
  const containerClass = themeStyles[theme].cardContainer;

  if (isPerfect) {
    return null;
  }

  return (
    <div className={`${containerClass} p-4 mb-6 transition-all shadow-sm ${isCritical ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
       <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
         <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isCritical ? 'bg-rose-100' : 'bg-amber-100'}`}>
              <Scale className={`${isCritical ? 'text-rose-600' : 'text-amber-600'} w-5 h-5`} />
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${isCritical ? 'text-rose-800' : 'text-amber-800'}`}>
                {isCritical ? 'Błąd spójności OMF' : 'Uwagi do spójności OMF'}
              </h3>
              <div className="flex space-x-4 text-xs mt-1 opacity-80 text-slate-700">
                 <span className="flex items-center">
                    {report.checks.structure ? <CheckCircle2 size={12} className="mr-1 text-emerald-600"/> : <XCircle size={12} className="mr-1 text-rose-600"/>}
                    Struktura
                 </span>
                 <span className="flex items-center">
                    {report.checks.mathIntegrity ? <CheckCircle2 size={12} className="mr-1 text-emerald-600"/> : <AlertTriangle size={12} className="mr-1 text-amber-600"/>}
                    Logika
                    {report.source && <span className="ml-1 font-bold opacity-75">• {report.source}</span>}
                 </span>
              </div>
            </div>
         </div>
         {expanded ? <ChevronUp size={18} className="opacity-50"/> : <ChevronDown size={18} className="opacity-50"/>}
       </div>

       {expanded && (
         <div className="mt-4 pt-4 border-t border-black/5 text-xs">
            {report.messages.length > 0 && (
              <ul className="space-y-1 mb-3 max-h-40 overflow-y-auto">
                {report.messages.map((msg, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-slate-700 font-medium">
                    <span className="mt-0.5 text-rose-500">•</span>
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
            )}
            
            <div className="bg-white/50 p-2 rounded text-slate-600 font-mono text-[10px] sm:text-xs">
               <p>Statystyki Aktywów:</p>
               <div className="grid grid-cols-3 gap-2 mt-1">
                  <div>Wszystkie: {report.stats.totalAssets}</div>
                  <div>Otwarte: {report.stats.openAssets}</div>
                  <div>Zamknięte: {report.stats.closedAssets}</div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};