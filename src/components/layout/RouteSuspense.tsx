import React, { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import RouteErrorBoundary from '@/components/RouteErrorBoundary';
import Loading from '@/components/ui/Loading';

/**
 * Wraps a layout's <Outlet /> for lazy-loaded pages: shows a spinner while the
 * page's chunk loads, and an error with a reload button if it fails (usually a
 * chunk removed by a newer deploy). The boundary resets on navigation.
 */
const RouteSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <RouteErrorBoundary key={pathname}>
      <Suspense
        fallback={
          <div className="flex justify-center py-16">
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
