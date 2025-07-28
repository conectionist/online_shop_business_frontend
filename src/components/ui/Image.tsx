import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export interface ImageProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

const Image: React.FC<ImageProps> = ({
  src,
  alt,
  fallback = '/placeholder-image.png',
  className = '',
  width,
  height,
  objectFit = 'cover',
  loading = 'lazy',
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
      setHasError(false);
    } else {
      setHasError(true);
    }
    onError?.();
  };

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down'
  };

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
        style={{ width, height }}
      >
        <div className="flex flex-col items-center space-y-2">
          <ImageIcon className="h-8 w-8" />
          <span className="text-sm">Image not available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full ${objectFitClasses[objectFit]} transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
};

export default Image; 