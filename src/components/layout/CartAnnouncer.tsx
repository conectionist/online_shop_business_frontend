import React, { useEffect, useState } from 'react';
import { selectTotalItems, useCartStore } from '@/stores/cartStore';
import { cartUpdateAnnouncement } from '@/utils/cartLabel';

// The region is emptied first and refilled after this delay, so a message that
// happens to repeat the previous text is still announced.
export const ANNOUNCE_DELAY_MS = 100;
// Long enough for screen readers to pick the message up, short enough that it
// isn't left behind as stray page content after navigating.
export const ANNOUNCEMENT_CLEAR_MS = 5000;

/**
 * Visually hidden live region that tells screen reader users the new cart
 * count after they change the cart (e.g. "Adaugă în coș"). Automatic changes
 * stay silent and clear any message that no longer matches the cart.
 */
const CartAnnouncer: React.FC = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    let announceTimer: ReturnType<typeof setTimeout> | undefined;
    let clearTimer: ReturnType<typeof setTimeout> | undefined;
    const reset = () => {
      clearTimeout(announceTimer);
      clearTimeout(clearTimer);
      setMessage('');
    };

    const unsubscribe = useCartStore.subscribe((state, previous) => {
      if (state.userChangeId !== previous.userChangeId) {
        const text = cartUpdateAnnouncement(selectTotalItems(state));
        reset();
        announceTimer = setTimeout(() => setMessage(text), ANNOUNCE_DELAY_MS);
        clearTimer = setTimeout(() => setMessage(''), ANNOUNCE_DELAY_MS + ANNOUNCEMENT_CLEAR_MS);
      } else if (state.items !== previous.items) {
        // Silent change: drop any message that now states the wrong count
        reset();
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(announceTimer);
      clearTimeout(clearTimer);
    };
  }, []);

  return (
    <div className="sr-only" role="status" aria-live="polite">
      {message}
    </div>
  );
};

export default CartAnnouncer;
