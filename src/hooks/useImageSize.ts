import { useState, useEffect } from 'react';

type ImageSize = 'thumbnail' | 'medium' | 'original';

interface NetworkConnection {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  saveData?: boolean;
}

export const useImageSize = (): ImageSize => {
  const [imageSize, setImageSize] = useState<ImageSize>('medium');

  useEffect(() => {
    const updateImageSize = () => {
      // Check if mobile/tablet using user agent
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      // Get network connection information
      // Note: Network Information API has limited browser support (not in Firefox/Safari)
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection as NetworkConnection | undefined;

      if (isMobile) {
        // Mobile devices
        if (connection?.type === 'wifi') {
          // Mobile on wifi: use medium (as per requirements)
          setImageSize('medium');
        } else {
          // Mobile on cellular or unknown connection type: use medium (safe default)
          setImageSize('medium');
        }
      } else {
        // Desktop devices
        if (connection?.type === 'ethernet') {
          // Desktop with wired connection: use original (as per requirements)
          setImageSize('original');
        } else if (connection?.type === 'wifi') {
          // Desktop on wifi: use original (wifi is usually fast enough on desktop)
          setImageSize('original');
        } else {
          // Desktop with unknown connection type: assume wired and use original
          // This is a safe assumption for desktop devices
          setImageSize('original');
        }
      }
    };

    // Initial update
    updateImageSize();

    // Listen for connection changes (if API is available)
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection && typeof connection.addEventListener === 'function') {
      connection.addEventListener('change', updateImageSize);
      return () => {
        if (typeof connection.removeEventListener === 'function') {
          connection.removeEventListener('change', updateImageSize);
        }
      };
    }
  }, []);

  return imageSize;
};
