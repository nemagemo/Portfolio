import React from 'react';
import { Turtle } from 'lucide-react';

export const TurtleLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  const { x, y, width, height, ...rest } = props;
  
  return (
    <svg 
      x={x} 
      y={y} 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      {...(rest as any)}
    >
      <path d="M12 2C10.9 2 10 2.9 10 4s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 9H6a3 3 0 0 0-3 3v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2a3 3 0 0 0-3-3zm-2 11a2 2 0 0 1-4 0h4zm-8 0a2 2 0 0 1-4 0h4zm14-9V9a2 2 0 0 0-2-2h-3V5h-2v2h-2V5h-2v2H6a2 2 0 0 0-2 2v2H2v2h2v4a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-4h2v-2h-2z" />
    </svg>
  );
};
