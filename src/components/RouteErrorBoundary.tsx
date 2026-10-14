import React from 'react';
import { RefreshCw } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
}

interface RouteErrorBoundaryState {
  error: Error | null;
}

// Keeps a failing route from unmounting the whole app. The usual cause is a lazy route
// whose chunk no longer exists after a deploy, which a reload fixes.
class RouteErrorBoundary extends React.Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Route failed to render:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }
    return (
      <div className="space-y-4">
        <Alert
          type="error"
          title="Pagina nu a putut fi încărcată"
          message="Probabil a apărut o versiune nouă a aplicației. Reîncărcați pagina pentru a continua."
        />
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => window.location.reload()}>
          Reîncarcă pagina
        </Button>
      </div>
    );
  }
}

export default RouteErrorBoundary;
