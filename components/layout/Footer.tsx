
import React, { useState } from 'react';
import { Scale, ChevronDown, ChevronUp } from 'lucide-react';
import { Theme, themeStyles } from '../../theme/styles';
import { FooterLogo } from '../logos/FooterLogo';

interface FooterProps {
  theme: Theme;
}

export const Footer: React.FC<FooterProps> = ({ theme }) => {
  const [isLegalExpanded, setIsLegalExpanded] = useState(false);
  const styles = themeStyles[theme];
  const isNeon = theme === 'neon';

  return (
    <footer className={`${styles.footerBg} ${styles.footerBorder} mt-auto py-4 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Logo & Copyright */}
        <div className="flex flex-col items-center justify-center gap-2 mb-3">
          <div className="flex items-center select-none opacity-90 hover:opacity-100 transition-opacity">
             <FooterLogo className={`h-8 sm:h-9 w-auto ${isNeon ? 'text-cyan-400' : 'text-slate-800'}`} />
          </div>
          <div className={`text-[10px] font-mono ${styles.footerText} text-center`}>
            &copy; {new Date().getFullYear()} Old Man Fund. Wszelkie prawa zastrzeżone.
          </div>
        </div>

        {/* Divider */}
        <div className={`w-full h-px mb-3 ${isNeon ? 'bg-cyan-900/30' : 'bg-slate-200'}`}></div>

        {/* Collapsible Legal Section */}
        <div className={`flex flex-col items-center justify-center ${isNeon ? 'text-cyan-800' : 'text-slate-400'}`}>
          <button 
            onClick={() => setIsLegalExpanded(!isLegalExpanded)}
            className={`flex items-center text-[10px] uppercase font-bold tracking-wider hover:opacity-100 transition-opacity focus:outline-none ${isLegalExpanded ? 'opacity-100' : 'opacity-70'}`}
          >
            <Scale size={12} className="mr-1.5" />
            Nota Prawna & Prywatność
            {isLegalExpanded ? <ChevronUp size={12} className="ml-1.5" /> : <ChevronDown size={12} className="ml-1.5" />}
          </button>

          {isLegalExpanded && (
            <div className="w-full mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="text-center md:text-left p-3 rounded border border-transparent hover:border-current transition-colors">
                <strong className={`block mb-1.5 ${isNeon ? 'text-cyan-700' : 'text-slate-500'}`}>Wyłączenie odpowiedzialności (Disclaimer)</strong>
                Prezentowane dane i wykresy mają charakter wyłącznie informacyjny i edukacyjnym. Nie stanowią rekomendacji inwestycyjnych ani porady prawnej czy podatkowej. Decyzje finansowe podejmujesz na własne ryzyko.
              </div>
              <div className="text-center md:text-right p-3 rounded border border-transparent hover:border-current transition-colors">
                 <strong className={`block mb-1.5 ${isNeon ? 'text-cyan-700' : 'text-slate-500'}`}>Prywatność i Cookies</strong>
                 Ta strona nie zbiera danych osobowych ani nie śledzi użytkowników (brak Google Analytics). Wykorzystujemy pamięć przeglądarki (LocalStorage) wyłącznie do technicznego zapamiętania wybranego motywu graficznego.
              </div>
            </div>
          )}
        </div>

      </div>
    </footer>
  );
};
