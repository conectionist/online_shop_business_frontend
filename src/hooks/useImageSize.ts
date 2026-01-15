import { useState, useEffect } from 'react';

type ImageSize = 'thumbnail' | 'medium' | 'original';

export const useImageSize = (): ImageSize => {
  const [imageSize, setImageSize] = useState<ImageSize>('medium');

  useEffect(() => {
    // Check if mobile/tablet using user agent
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Simple rule: mobile -> medium, desktop -> original
    if (isMobile) {
      setImageSize('medium');
    } else {
      setImageSize('original');
    }
  }, []);

  return imageSize;
};
