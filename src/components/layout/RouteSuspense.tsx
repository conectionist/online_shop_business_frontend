import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import RouteErrorBoundary from '@/components/RouteErrorBoundary';
import Loading from '@/components/ui/Loading';

interface RouteSuspenseProps {
  children: React.ReactNode;
  /** Classes for the loading placeholder, e.g. a min height so the footer doesn't jump */
  fallbackClassName?: string;
}

/**
 * Wraps a layout's <Outlet /> for lazy-loaded pages: shows a spinner while a
 * page's chunk loads, and an error message if the page fails.
 *
 * The Suspense boundary stays mounted across navigations, so React Router's
 * transitions keep the current page on screen while the next one loads
 * (the spinner only shows on a first load). The error boundary resets when the
 * path changes.
 */
const RouteSuspense: React.FC<RouteSuspenseProps> = ({ children, fallbackClassName = '' }) => {
  const { pathname } = useLocation();
  return (
    <RouteErrorBoundary resetKey={pathname}>
      <Suspense
        fallback={
          <div className={`flex justify-center py-16 ${fallbackClassName}`} role="status" aria-live="polite">
            <Loading size="lg" text="Se încarcă..." />
          </div>
        }
      >
        {children}
      </Suspense>
    </RouteErrorBoundary>
  );
};

export default RouteSuspense;
