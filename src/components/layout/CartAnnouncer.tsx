import React, { useEffect, useRef, useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { cartUpdateAnnouncement } from '@/utils/cartLabel';

/**
 * Visually hidden live region that tells screen reader users when the
 * cart count changes (e.g. after "Adaugă în coș"). Silent on first render.
 */
const CartAnnouncer: React.FC = () => {
  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const previous = useRef(totalItems);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (previous.current !== totalItems) {
      previous.current = totalItems;
      setMessage(cartUpdateAnnouncement(totalItems));
    }
  }, [totalItems]);

  return (
    <div className="sr-only" role="status" aria-live="polite">
      {message}
    </div>
  );
};

export default CartAnnouncer;
