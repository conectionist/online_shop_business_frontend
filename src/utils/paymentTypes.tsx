import React, { useState, useEffect } from 'react';

export interface PaymentTypeIconConfig {
  type: 'image';
  value: string;
  fallback: string;
}

/**
 * Get payment type icon configuration with fallback chain (SVG → PNG → emoji)
 */
export const getPaymentTypeIcon = (paymentTypeId: number): PaymentTypeIconConfig => {
  const iconMap: Record<number, { svg: string; emoji: string }> = {
    0: { svg: '/assets/payment-types/custom.svg', emoji: '❓' },
    1: { svg: '/assets/payment-types/cash.svg', emoji: '💵' },
    2: { svg: '/assets/payment-types/card-physical.svg', emoji: '💳' },
    3: { svg: '/assets/payment-types/card-online.svg', emoji: '💳' },
    4: { svg: '/assets/payment-types/revolut-logo.svg', emoji: '📱' },
    5: { svg: '/assets/payment-types/bank-transfer.svg', emoji: '🏦' },
  };

  const config = iconMap[paymentTypeId];
  if (!config) {
    // Default fallback for unknown payment types
    return {
      type: 'image',
      value: '/assets/payment-types/custom.svg',
      fallback: '❓',
    };
  }

  return {
    type: 'image',
    value: config.svg,
    fallback: config.emoji,
  };
};

/**
 * Get payment type friendly name from payment method
 */
export const getPaymentTypeFriendlyName = (
  paymentMethod: { payment_type_id?: number },
  paymentTypes?: Array<{ id: number; friendly_name: string }>
): string => {
  if (!paymentMethod.payment_type_id || !paymentTypes) {
    return 'nespecificat';
  }

  const paymentType = paymentTypes.find(pt => pt.id === paymentMethod.payment_type_id);
  return paymentType?.friendly_name || 'nespecificat';
};

interface PaymentTypeIconProps {
  paymentTypeId: number;
  className?: string;
  size?: number;
}

/**
 * PaymentTypeIcon component that handles SVG → PNG → emoji fallback chain
 */
export const PaymentTypeIcon: React.FC<PaymentTypeIconProps> = ({
  paymentTypeId,
  className = '',
  size = 24,
}) => {
  const iconConfig = getPaymentTypeIcon(paymentTypeId);
  const [currentSrc, setCurrentSrc] = useState<string>(iconConfig.value);
  const [showEmoji, setShowEmoji] = useState(false);

  // Reset state when paymentTypeId changes
  useEffect(() => {
    setCurrentSrc(iconConfig.value);
    setShowEmoji(false);
  }, [paymentTypeId, iconConfig.value]);

  const handleImageError = () => {
    // Try PNG if SVG failed
    if (currentSrc.endsWith('.svg')) {
      const pngSrc = currentSrc.replace('.svg', '.png');
      setCurrentSrc(pngSrc);
    } else {
      // Both SVG and PNG failed, show emoji
      setShowEmoji(true);
    }
  };

  if (showEmoji) {
    return (
      <span className={className} style={{ fontSize: `${size}px` }} role="img" aria-label="Payment type icon">
        {iconConfig.fallback}
      </span>
    );
  }

  return (
    <img
      src={currentSrc}
      alt=""
      className={className}
      style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }}
      onError={handleImageError}
    />
  );
};

