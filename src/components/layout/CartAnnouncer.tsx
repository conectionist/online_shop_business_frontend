import React, { useEffect, useRef, useState } from 'react';
import { selectTotalItems, useCartStore } from '@/stores/cartStore';
import { cartUpdateAnnouncement } from '@/utils/cartLabel';

// Long enough for screen readers to pick the message up, short enough that it
// isn't left behind as stray page content after navigating.
export const ANNOUNCEMENT_CLEAR_MS = 5000;

/**
 * Visually hidden live region that tells screen reader users the new cart
 * count after they change the cart (e.g. "Adaugă în coș"). Automatic changes,
 * such as purging an expired list or clearing after an order, stay silent.
 */
const CartAnnouncer: React.FC = () => {
  const userChangeId = useCartStore((state) => state.userChangeId);
  const lastSeenChange = useRef(userChangeId);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (lastSeenChange.current === userChangeId) {
      return;
    }
    lastSeenChange.current = userChangeId;
    // The store updates synchronously, so the total already reflects this change
    setMessage(cartUpdateAnnouncement(selectTotalItems(useCartStore.getState())));
    const timer = setTimeout(() => setMessage(''), ANNOUNCEMENT_CLEAR_MS);
    return () => clearTimeout(timer);
  }, [userChangeId]);

  return (
    <div className="sr-only" role="status" aria-live="polite">
      {message}
    </div>
  );
};

export default CartAnnouncer;
