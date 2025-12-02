
import React, { useState, useEffect } from 'react';
import { X, Monitor, Smartphone } from 'lucide-react';
import { Theme } from '../theme/styles';

interface MobileNoticeProps {
  theme: Theme;
}

export const MobileNotice: React.FC<MobileNoticeProps> = ({ theme }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // 1. Check if mobile
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    // 2. Check if already dismissed
    const hasSeen = localStorage.getItem('omf_mobile_notice_v1');
    if (hasSeen) return;

    // 3. Delay appearance for better UX (don't block immediate interaction)
    setShouldRender(true);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for animation to finish before unmounting
    setTimeout(() => setShouldRender(false), 500);
    localStorage.setItem('omf_mobile_notice_v1', 'true');
  };

  if (!shouldRender) return null;

  const isNeon = theme === 'neon';

  return (
    <div 
      className={`
        fixed bottom-4 left-4 right-4 z-50 
        transition-all duration-500 transform 
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
      `}
    >
      <div 
        className={`
          flex items-start p-4 rounded-xl shadow-2xl border backdrop-blur-md relative
          ${isNeon 
            ? 'bg-black/80 border-cyan-500/50 text-cyan-50 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50'
          }
        `}
      >
        {/* Icon */}
        <div className={`p-2 rounded-lg mr-3 shrink-0 ${isNeon ? 'bg-cyan-900/30 text-cyan-400' : 'bg-slate-100 text-slate-600'}`}>
          <Monitor size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 mr-2">
          <h4 className={`text-sm font-bold mb-1 ${isNeon ? 'text-cyan-300' : 'text-slate-900'}`}>
            Tryb Mobilny
          </h4>
          <p className={`text-xs leading-relaxed ${isNeon ? 'text-cyan-100/80' : 'text-slate-500'}`}>
            Widzisz uproszczoną wersję OMF. Pełne wersja dostępna tylko na komputerze.
          </p>
          
          <button 
            onClick={handleDismiss}
            className={`
                mt-3 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all w-full sm:w-auto
                ${isNeon 
                    ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-800/50' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }
            `}
          >
            Rozumiem
          </button>
        </div>

        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className={`
            absolute top-2 right-2 p-1 rounded-full transition-colors
            ${isNeon ? 'text-cyan-700 hover:text-cyan-400 hover:bg-cyan-900/30' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}
          `}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
