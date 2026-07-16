import React from 'react';

export interface LogoProps {
  appName?: string;
  imageUrl?: string;
  icon?: React.ReactNode;
  iconWrapperClassName?: string;
  textClassName?: string;
  containerClassName?: string;
  showText?: boolean;
}

export function Logo({
  appName = 'FitTitans',
  imageUrl,
  icon = '🌸',
  iconWrapperClassName = 'w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br from-pink-500/30 to-purple-500/30 border border-pink-500/40',
  textClassName = 'font-bold text-sm leading-tight text-slate-900',
  containerClassName = 'flex items-center gap-3',
  showText = true,
}: LogoProps) {
  return (
    <div className={containerClassName}>
      <div className={iconWrapperClassName}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={appName} 
            className="w-full h-full object-cover" 
            style={{ borderRadius: 'inherit' }} 
          />
        ) : (
          icon
        )}
      </div>
      {showText && (
        <p className={textClassName} style={{ fontFamily: "'Playfair Display', serif" }}>
          {appName}
        </p>
      )}
    </div>
  );
}
