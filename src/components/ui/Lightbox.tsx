import React from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

export interface LightboxImage {
  src: string;
  alt?: string;
}

interface AppLightboxProps {
  open: boolean;
  images: LightboxImage[];
  index: number;
  onClose: () => void;
}

const AppLightbox: React.FC<AppLightboxProps> = ({ open, images, index, onClose }) => {
  const slides = React.useMemo(() => images.map((img) => ({ src: img.src, alt: img.alt })), [images]);
  return (
    <Lightbox
      open={open}
      close={onClose}
      index={index}
      slides={slides}
      controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
      animation={{ swipe: 300 }}
    />
  );
};

export default AppLightbox;


