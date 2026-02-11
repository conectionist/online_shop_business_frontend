import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet, HelpCircle, LayoutGrid, List, Trash2 } from 'lucide-react';
import { useSessions, useCurrentSession, useRevokeSession, useLogoutOthers } from '@/hooks/useSessions';
import { Session } from '@/types/api';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/ToastContainer';
import AdminPageHeader from '@/components/layout/AdminPageHeader';

type ViewMode = 'card' | 'list';

// Helper function to get device icon
const getDeviceIcon = (deviceType: Session['device_type']) => {
  switch (deviceType) {
    case 'desktop':
      return Monitor;
    case 'mobile':
      return Smartphone;
    case 'tablet':
      return Tablet;
    default:
      return HelpCircle;
  }
};

// Parse timestamp as UTC (backend may omit the Z suffix)
const parseUTC = (dateString: string): Date => {
  return new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
};

// Helper function to format timestamp as relative time
const formatDate = (dateString: string): string => {
  const now = new Date();
  const date = parseUTC(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Acum câteva secunde';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Acum ${diffInMinutes} ${diffInMinutes === 1 ? 'minut' : 'minute'}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Acum ${diffInHours} ${diffInHours === 1 ? 'oră' : 'ore'}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `Acum ${diffInDays} ${diffInDays === 1 ? 'zi' : 'zile'}`;
};

// Format as absolute date+time for the table view
const formatAbsolute = (dateString: string): string => {
  const date = parseUTC(dateString);
  return date.toLocaleString('ro-RO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Session Card Component (compact view)
const SessionCard = React.memo<{
  session: Session;
  isCurrent: boolean;
  onRevoke: (session: Session) => void;
}>(({ session, isCurrent, onRevoke }) => {
  const DeviceIcon = getDeviceIcon(session.device_type);

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        {/* Header with device icon and session name */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <DeviceIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {session.session_name}
              </h3>
              <p className="text-sm text-gray-500">
                {session.browser_name} pe {session.os_name}
              </p>
            </div>
          </div>
          {isCurrent && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Sesiune curentă
            </span>
          )}
        </div>

        {/* Session details */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <p>
            <span className="font-medium">IP:</span> {session.ip_address}
          </p>
          <p>
            <span className="font-medium">Ultima activitate:</span> {session.last_used_at ? formatDate(session.last_used_at) : formatDate(session.created_at)}
          </p>
          <p>
            <span className="font-medium">Prima conectare:</span> {formatDate(session.created_at)}
          </p>
          {(session.location_city || session.location_country) && (
            <p>
              <span className="font-medium">Locație:</span>{' '}
              {[session.location_city, session.location_country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        {/* Action button */}
        {isCurrent ? (
          <div className="text-sm text-gray-500 italic">
            Nu poți revoca sesiunea curentă. Folosește butonul de deconectare din meniu.
          </div>
        ) : (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onRevoke(session)}
            className="w-full"
          >
            Revocă sesiune
          </Button>
        )}
      </div>
    </Card>
  );
});

SessionCard.displayName = 'SessionCard';

// Session Table Component (list view)
const SessionTable = React.memo<{
  sessions: Session[];
  currentSessionId: number | undefined;
  onRevoke: (session: Session) => void;
}>(({ sessions, currentSessionId, onRevoke }) => {
  return (
    <Card className="mt-6 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-600">
              <th className="px-4 py-3 font-medium">Dispozitiv</th>
              <th className="px-4 py-3 font-medium">IP</th>
              <th className="px-4 py-3 font-medium">Locație</th>
              <th className="px-4 py-3 font-medium">Prima conectare</th>
              <th className="px-4 py-3 font-medium">Ultima activitate</th>
              <th className="px-4 py-3 font-medium">Expiră</th>
              <th className="px-4 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.map((session) => {
              const isCurrent = session.id === currentSessionId;
              const DeviceIcon = getDeviceIcon(session.device_type);
              const location = [session.location_city, session.location_country].filter(Boolean).join(', ');

              return (
                <tr key={session.id} className={isCurrent ? 'bg-green-50/50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <DeviceIcon className="h-5 w-5 text-blue-600 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <span className="truncate">{session.session_name}</span>
                          {isCurrent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 shrink-0">
                              Curentă
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500 truncate">
                          {session.browser_name} pe {session.os_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{session.ip_address}</td>
                  <td className="px-4 py-3 text-gray-600">{location || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatAbsolute(session.created_at)}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {session.last_used_at ? formatDate(session.last_used_at) : formatDate(session.created_at)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatAbsolute(session.expires_at)}</td>
                  <td className="px-4 py-3">
                    {!isCurrent && (
                      <button
                        onClick={() => onRevoke(session)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Revocă sesiune"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
});

SessionTable.displayName = 'SessionTable';

// Detect if screen is mobile-width on initial render
const getDefaultView = (): ViewMode => {
  return window.innerWidth < 768 ? 'card' : 'list';
};

// Main component
const SessionsList: React.FC = () => {
  const { showToast } = useToast();
  const { data: sessions, isLoading, error } = useSessions();
  const { data: currentSession } = useCurrentSession();
  const revokeSessionMutation = useRevokeSession();
  const logoutOthersMutation = useLogoutOthers();

  const [viewMode, setViewMode] = useState<ViewMode>(getDefaultView);
  const [sessionToRevoke, setSessionToRevoke] = useState<Session | null>(null);
  const [showLogoutOthersModal, setShowLogoutOthersModal] = useState(false);

  // Sort sessions: current first, then by last_used_at descending
  const sortedSessions = React.useMemo(() => {
    if (!sessions || !currentSession) return [];

    return [...sessions].sort((a, b) => {
      // Current session always first
      if (a.id === currentSession.id) return -1;
      if (b.id === currentSession.id) return 1;

      // Then sort by last_used_at descending (fall back to created_at)
      return new Date(b.last_used_at || b.created_at).getTime() - new Date(a.last_used_at || a.created_at).getTime();
    });
  }, [sessions, currentSession]);

  const handleRevokeSession = async () => {
    if (!sessionToRevoke) return;

    try {
      await revokeSessionMutation.mutateAsync(sessionToRevoke.id);
      showToast({ type: 'success', title: 'Sesiunea a fost revocată cu succes' });
      setSessionToRevoke(null);
    } catch (error) {
      showToast({ type: 'error', title: 'Eroare la revocarea sesiunii' });
      console.error('Error revoking session:', error);
    }
  };

  const handleLogoutOthers = async () => {
    try {
      const message = await logoutOthersMutation.mutateAsync();
      showToast({ type: 'success', title: message || 'Celelalte sesiuni au fost revocate' });
      setShowLogoutOthersModal(false);
    } catch (error) {
      showToast({ type: 'error', title: 'Eroare la revocarea sesiunilor' });
      console.error('Error logging out other devices:', error);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-6">
        <AdminPageHeader
          title="Sesiuni Active"
          subtitle="Gestionează dispozitivele conectate la contul tău"
        />
        <Alert
          type="error"
          message="A apărut o eroare la încărcarea sesiunilor. Încearcă din nou mai târziu."
          className="mt-6"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader
          title="Sesiuni Active"
          subtitle="Gestionează dispozitivele conectate la contul tău"
        />
        {sortedSessions.length > 0 && (
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded ${viewMode === 'card' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Vizualizare carduri"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Vizualizare listă"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Info alert */}
      <Alert
        type="info"
        title="Securitate"
        message="Sesiunile inactive sunt șterse automat după 7 zile. Poți revoca accesul pentru orice dispozitiv suspect sau nerecunoscut."
        className="mt-6"
      />

      {/* Sessions */}
      {sortedSessions.length === 0 ? (
        <Alert
          type="info"
          message="Nu există sesiuni active."
          className="mt-6"
        />
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {sortedSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isCurrent={currentSession?.id === session.id}
              onRevoke={setSessionToRevoke}
            />
          ))}
        </div>
      ) : (
        <SessionTable
          sessions={sortedSessions}
          currentSessionId={currentSession?.id}
          onRevoke={setSessionToRevoke}
        />
      )}

      {/* Logout others card */}
      {sortedSessions.length > 1 && (
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Deconectează celelalte dispozitive
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Revocă toate sesiunile active, cu excepția sesiunii curente.
              Celelalte dispozitive vor fi deconectate imediat.
            </p>
            <Button
              variant="primary"
              onClick={() => setShowLogoutOthersModal(true)}
              disabled={logoutOthersMutation.isPending}
            >
              {logoutOthersMutation.isPending ? 'Se deconectează...' : 'Deconectează celelalte dispozitive'}
            </Button>
          </div>
        </Card>
      )}

      {/* Revoke session modal */}
      <Modal
        isOpen={!!sessionToRevoke}
        onClose={() => setSessionToRevoke(null)}
        title="Revocă sesiune"
      >
        <div className="space-y-4">
          <p>
            Ești sigur că vrei să revoci sesiunea <strong>{sessionToRevoke?.session_name}</strong>?
          </p>
          <p className="text-sm text-gray-600">
            Dispozitivul va fi deconectat imediat și va trebui să se autentifice din nou pentru a accesa contul.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setSessionToRevoke(null)}
              disabled={revokeSessionMutation.isPending}
            >
              Anulează
            </Button>
            <Button
              variant="danger"
              onClick={handleRevokeSession}
              disabled={revokeSessionMutation.isPending}
            >
              {revokeSessionMutation.isPending ? 'Se revocă...' : 'Revocă sesiune'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Logout others modal */}
      <Modal
        isOpen={showLogoutOthersModal}
        onClose={() => setShowLogoutOthersModal(false)}
        title="Deconectează celelalte dispozitive"
      >
        <div className="space-y-4">
          <p>
            Ești sigur că vrei să revoci toate sesiunile, cu excepția sesiunii curente?
            Celelalte dispozitive vor fi deconectate imediat.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowLogoutOthersModal(false)}
              disabled={logoutOthersMutation.isPending}
            >
              Anulează
            </Button>
            <Button
              variant="primary"
              onClick={handleLogoutOthers}
              disabled={logoutOthersMutation.isPending}
            >
              {logoutOthersMutation.isPending ? 'Se deconectează...' : 'Deconectează celelalte'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default SessionsList;
