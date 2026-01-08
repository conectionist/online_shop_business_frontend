import { useState, useEffect } from 'react';

type ImageSize = 'thumbnail' | 'medium' | 'original';

export const useImageSize = (): ImageSize => {
  const [imageSize, setImageSize] = useState<ImageSize>('medium');

  useEffect(() => {
    // Check if mobile/tablet using user agent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      // Mobile/tablet always uses medium
      setImageSize('medium');
    } else {
      // Desktop: check network speed
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        
        // If slow connection (2g or 3g), use medium
        if (effectiveType === '2g' || effectiveType === 'slow-2g' || effectiveType === '3g') {
          setImageSize('medium');
        } else {
          // Fast connection on desktop: use original
          setImageSize('original');
        }
      } else {
        // No connection info available on desktop: default to original
        setImageSize('original');
      }
    }
  }, []);

  return imageSize;
};
