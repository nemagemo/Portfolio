import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { Theme } from '../../theme/styles';

interface StatFlipCardProps {
  frontTitle: string;
  frontValue: string | number;
  frontSub: string;
  backTitle: string;
  backValue: string | number;
  backSub: string;
  icon: React.ElementType;
  theme: Theme;
  colorClass: string;
}

export const StatFlipCard: React.FC<StatFlipCardProps> = ({ 
  frontTitle, frontValue, frontSub, 
  backTitle, backValue, backSub, 
  icon: Icon, theme, colorClass 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="h-[76px] perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* FRONT FACE */}
        <div className="absolute w-full h-full [backface-visibility:hidden] p-2.5 border bg-slate-50 border-slate-100 rounded-lg">
          <div className="flex justify-between items-start mb-0.5">
            <div className={`text-[10px] sm:text-xs uppercase font-bold ${colorClass}`}>
              {frontTitle}
            </div>
            <div>
               <Icon className={`w-4 h-4 opacity-80 ${colorClass}`} />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-700">
            {frontValue}
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-400">
            {frontSub}
          </div>
          {/* Flip Icon - Bottom Right */}
          <div className="absolute bottom-2 right-2">
            <RotateCw className={`w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity ${colorClass}`} />
          </div>
        </div>

        {/* BACK FACE */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] p-2.5 border bg-slate-100 border-slate-200 rounded-lg">
          <div className="flex justify-between items-start mb-0.5">
            <div className={`text-[10px] sm:text-xs uppercase font-bold ${colorClass}`}>
              {backTitle}
            </div>
            <div>
               <Icon className={`w-4 h-4 opacity-80 ${colorClass}`} />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-700">
            {backValue}
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-400">
            {backSub}
          </div>
          {/* Flip Icon - Bottom Right */}
          <div className="absolute bottom-2 right-2">
            <RotateCw className={`w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity ${colorClass}`} />
          </div>
        </div>

      </div>
    </div>
  );
};