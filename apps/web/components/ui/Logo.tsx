import React from 'react';
import Image from 'next/image';
import { APP_NAME } from '../../lib/brand';

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
  appName = APP_NAME,
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
          <span className="relative block w-full h-full overflow-hidden" style={{ borderRadius: 'inherit' }}>
            {/* unoptimized: logos can come from any host, so skip Next's image domain allow-list */}
            <Image src={imageUrl} alt={appName} fill unoptimized sizes="64px" className="object-cover" />
          </span>
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
