import React from 'react';
import { RefreshCw } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { isChunkLoadError } from '@/utils/chunkLoad';

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
  /** When this changes (e.g. the path), a shown error is cleared and the children render again. */
  resetKey?: unknown;
}

interface RouteErrorBoundaryState {
  error: Error | null;
}

// Keeps a failing route from unmounting the whole app. A page whose code can't
// be loaded (network drop, or a chunk removed by a newer deploy) is fixed by a
// reload; any other error gets a neutral message.
class RouteErrorBoundary extends React.Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Route failed to render:', error, info.componentStack);
  }

  componentDidUpdate(prevProps: RouteErrorBoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }
    const chunkError = isChunkLoadError(error);
    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-4">
        <Alert
          type="error"
          title={chunkError ? 'Pagina nu a putut fi încărcată' : 'A apărut o eroare'}
          message={
            chunkError
              ? 'Probabil a apărut o versiune nouă a aplicației sau conexiunea s-a întrerupt. Reîncărcați pagina pentru a continua.'
              : 'Această pagină nu a putut fi afișată. Reîncărcați pagina sau încercați din nou mai târziu.'
          }
        />
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => window.location.reload()}>
          Reîncarcă pagina
        </Button>
      </div>
    );
  }
}

export default RouteErrorBoundary;
