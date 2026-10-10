import React, { useState } from 'react';
import { Landmark } from 'lucide-react';

interface StudioImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  cutout?: boolean;
  disableCutout?: boolean;
  priority?: boolean;
  width?: number | string;
  height?: number | string;
}

export const StudioImage: React.FC<StudioImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  cutout = false,
  disableCutout = false,
  priority = false,
  width,
  height,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#EAE9E4] text-[#6E6D68] p-6 select-none ${containerClassName}`}
      >
        <Landmark className="w-8 h-8 stroke-[1.25] mb-2 text-[#141413]/50" />
        <span className="text-[11px] font-mono-num uppercase tracking-widest text-center line-clamp-2">
          {alt || 'SERIKALI GUIDE EDITORIAL'}
        </span>
      </div>
    );
  }

  const useCutout = cutout && !disableCutout;

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {!isLoaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#E5E4DE] animate-pulse"
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        referrerPolicy="no-referrer"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${useCutout ? 'studio-cutout' : ''} ${className}`}
      />
    </div>
  );
};
