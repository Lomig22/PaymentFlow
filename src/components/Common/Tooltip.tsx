import React, { ReactNode } from "react";

const themeClasses: Record<string, string> = {
  yellow: "border-yellow-400 bg-yellow-100 text-yellow-800",
  green: "border-green-400 bg-green-100 text-green-800",
  blue: "border-blue-400 bg-blue-100 text-blue-800",
  orange: "border-orange-400 bg-orange-100 text-orange-800",
  red: "border-red-400 bg-red-100 text-red-800",
  black: "border-gray-800 bg-black text-white",
};
  
  interface TooltipProps {
  label: ReactNode;
  children: ReactNode;
  theme?: keyof typeof themeClasses;
  className?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ label, children, theme = "yellow", className = "" }) => {
    return (
      <div className="relative group inline-block z-[51]">
        {children}
        <div
          className={`absolute bottom-full mt-1 left-0
         text-xs rounded px-2 py-1 
          opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[51]
          ${themeClasses[theme] || themeClasses.yellow} ${className}`}
          style={{width: "170px"}}
        >
          {label}
        </div>
      </div>
    );
  };
  
  export default Tooltip;