import React, { useState } from 'react';
import {
  Monitor, Smartphone, Tablet, HelpCircle,
  LayoutGrid, List, Trash2,
  Globe, Clock, MapPin, LogOut, ShieldCheck,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
type ActivityLevel = 'active' | 'recent' | 'stale';

// ─── Helpers ──────────────────────────────────────────────

const getDeviceIcon = (deviceType: Session['device_type']) => {
  switch (deviceType) {
    case 'desktop': return Monitor;
    case 'mobile': return Smartphone;
    case 'tablet': return Tablet;
    default: return HelpCircle;
  }
};

const parseUTC = (dateString: string): Date => {
  return new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
};

const formatDate = (dateString: string): string => {
  const now = new Date();
  const date = parseUTC(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Acum câteva secunde';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Acum ${diffInMinutes} ${diffInMinutes === 1 ? 'minut' : 'minute'}`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Acum ${diffInHours} ${diffInHours === 1 ? 'oră' : 'ore'}`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `Acum ${diffInDays} ${diffInDays === 1 ? 'zi' : 'zile'}`;
};

const getActivityLevel = (session: Session): ActivityLevel => {
  const lastUsed = session.last_used_at || session.created_at;
  const diffMs = Date.now() - parseUTC(lastUsed).getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return 'active';
  if (diffHours < 24) return 'recent';
  return 'stale';
};

const activityColors = {
  active: { bg: 'bg-green-50', icon: 'text-green-600', dot: 'bg-green-500', border: 'border-l-green-400' },
  recent: { bg: 'bg-blue-50', icon: 'text-blue-600', dot: 'bg-blue-500', border: 'border-l-blue-400' },
  stale:  { bg: 'bg-gray-100', icon: 'text-gray-400', dot: 'bg-gray-400', border: 'border-l-gray-200' },
};

const getDefaultView = (): ViewMode => {
  return window.innerWidth < 768 ? 'card' : 'list';
};

// ─── Detail Chip ──────────────────────────────────────────

const DetailChip: React.FC<{ icon: LucideIcon; label: string }> = ({ icon: Icon, label }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 text-gray-700 border border-gray-200/60 text-xs sm:text-sm">
    <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
    <span className="truncate">{label}</span>
  </span>
);

// ─── Current Session Hero ─────────────────────────────────

const CurrentSessionHero = React.memo<{ session: Session }>(({ session }) => {
  const DeviceIcon = getDeviceIcon(session.device_type);
  const location = [session.location_city, session.location_country].filter(Boolean).join(', ');

  return (
    <Card
      className="mt-6 border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50/50 animate-scale-in overflow-hidden"
      padding="none"
      shadow="sm"
    >
      <div className="p-5 sm:p-6">
        {/* Header row */}
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-100 flex items-center justify-center">
              <DeviceIcon className="h-6 w-6 sm:h-7 sm:w-7 text-green-700" />
            </div>
            {/* Pulsing active dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-white" />
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                {session.session_name}
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-600 text-white shrink-0">
                Sesiune curentă
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-0.5">
              {session.browser_name} pe {session.os_name}
            </p>
          </div>
        </div>

        {/* Detail chips */}
        <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
          <DetailChip icon={Globe} label={session.ip_address} />
          <DetailChip icon={Clock} label={session.last_used_at ? formatDate(session.last_used_at) : formatDate(session.created_at)} />
          {location && <DetailChip icon={MapPin} label={location} />}
        </div>
      </div>
    </Card>
  );
});

CurrentSessionHero.displayName = 'CurrentSessionHero';

// ─── Session Card ─────────────────────────────────────────

const SessionCard = React.memo<{
  session: Session;
  onRevoke: (session: Session) => void;
  index: number;
}>(({ session, onRevoke, index }) => {
  const DeviceIcon = getDeviceIcon(session.device_type);
  const activity = getActivityLevel(session);
  const colors = activityColors[activity];
  const location = [session.location_city, session.location_country].filter(Boolean).join(', ');

  return (
    <div
      className="animate-fade-in-up"
      style={{
        animationDelay: `${Math.min(index * 80, 400)}ms`,
        animationFillMode: 'both',
      }}
    >
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full"
      padding="none"
      shadow="sm"
      border
    >
      <div className="p-4 sm:p-5">
        {/* Header row */}
        <div className="flex items-center gap-3">
          <div className={`relative w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
            <DeviceIcon className={`h-5 w-5 ${colors.icon}`} />
            <span className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ${colors.dot} border-2 border-white`} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-900 truncate">
              {session.session_name}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {session.browser_name} pe {session.os_name}
            </p>
          </div>

          <button
            onClick={() => onRevoke(session)}
            className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
            title="Revocă sesiune"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Detail grid */}
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-gray-400 shrink-0" />
            <span className="truncate">{session.last_used_at ? formatDate(session.last_used_at) : formatDate(session.created_at)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="h-3 w-3 text-gray-400 shrink-0" />
            <span className="truncate">{session.ip_address}</span>
          </div>
          {location && (
            <div className="flex items-center gap-1.5 col-span-2">
              <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
    </div>
  );
});

SessionCard.displayName = 'SessionCard';

// ─── Session Table ────────────────────────────────────────

const SessionTable = React.memo<{
  sessions: Session[];
  onRevoke: (session: Session) => void;
}>(({ sessions, onRevoke }) => {
  return (
    <div className="mt-4 animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
    <Card className="overflow-hidden" padding="none">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-600">
              <th className="px-4 py-3 font-medium">Dispozitiv</th>
              <th className="px-4 py-3 font-medium">IP</th>
              <th className="px-4 py-3 font-medium">Locație</th>
              <th className="px-4 py-3 font-medium">Ultima activitate</th>
              <th className="px-4 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.device_type);
              const activity = getActivityLevel(session);
              const colors = activityColors[activity];
              const location = [session.location_city, session.location_country].filter(Boolean).join(', ');

              return (
                <tr key={session.id} className={`border-l-[3px] ${colors.border} hover:bg-gray-50/50 transition-colors`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <DeviceIcon className={`h-5 w-5 ${colors.icon}`} />
                        <span className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${colors.dot}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{session.session_name}</div>
                        <div className="text-gray-500 truncate text-xs">{session.browser_name} pe {session.os_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{session.ip_address}</td>
                  <td className="px-4 py-3 text-gray-600">{location || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {session.last_used_at ? formatDate(session.last_used_at) : formatDate(session.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onRevoke(session)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Revocă sesiune"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
    </div>
  );
});

SessionTable.displayName = 'SessionTable';

// ─── Main Component ───────────────────────────────────────

const SessionsList: React.FC = () => {
  const { showToast } = useToast();
  const { data: sessions, isLoading, error } = useSessions();
  const { data: currentSession } = useCurrentSession();
  const revokeSessionMutation = useRevokeSession();
  const logoutOthersMutation = useLogoutOthers();

  const [viewMode, setViewMode] = useState<ViewMode>(getDefaultView);
  const [sessionToRevoke, setSessionToRevoke] = useState<Session | null>(null);
  const [showLogoutOthersModal, setShowLogoutOthersModal] = useState(false);

  // Split into current session + other sessions
  const currentSessionData = React.useMemo(() => {
    if (!sessions || !currentSession) return null;
    return sessions.find(s => s.id === currentSession.id) ?? null;
  }, [sessions, currentSession]);

  const otherSessions = React.useMemo(() => {
    if (!sessions || !currentSession) return [];
    return sessions
      .filter(s => s.id !== currentSession.id)
      .sort((a, b) =>
        new Date(b.last_used_at || b.created_at).getTime() -
        new Date(a.last_used_at || a.created_at).getTime()
      );
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
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
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
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <AdminPageHeader
        title="Sesiuni Active"
        subtitle="Gestionează dispozitivele conectate la contul tău"
      />

      {/* Current Session Hero */}
      {currentSessionData && (
        <CurrentSessionHero session={currentSessionData} />
      )}

      {/* Other Sessions Section */}
      {otherSessions.length > 0 && (
        <>
          {/* Section header */}
          <div
            className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-up"
            style={{ animationDelay: '200ms', animationFillMode: 'both' } as React.CSSProperties}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">
                Alte sesiuni
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {otherSessions.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* View toggle — md+ only */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
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

              {/* Logout others button */}
              <Button
                variant="outline"
                size="sm"
                icon={LogOut}
                onClick={() => setShowLogoutOthersModal(true)}
                disabled={logoutOthersMutation.isPending}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <span className="hidden sm:inline">Deconectează celelalte dispozitive</span>
                <span className="sm:hidden">Deconectează celelalte dispozitive</span>
              </Button>
            </div>
          </div>

          {/* Card grid — always on mobile, toggleable on md+ */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 ${viewMode === 'list' ? 'md:hidden' : ''}`}>
            {otherSessions.map((session, index) => (
              <SessionCard
                key={session.id}
                session={session}
                onRevoke={setSessionToRevoke}
                index={index}
              />
            ))}
          </div>

          {/* Table — md+ only when list mode */}
          {viewMode === 'list' && (
            <div className="hidden md:block">
              <SessionTable
                sessions={otherSessions}
                onRevoke={setSessionToRevoke}
              />
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!currentSessionData && otherSessions.length === 0 && (
        <Alert
          type="info"
          message="Nu există sesiuni active."
          className="mt-6"
        />
      )}

      {/* Compact security footer */}
      <p
        className="mt-8 text-xs text-gray-400 text-center animate-fade-in-up"
        style={{ animationDelay: '500ms', animationFillMode: 'both' } as React.CSSProperties}
      >
        <ShieldCheck className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
        Sesiunile inactive sunt șterse automat după 7 zile.
      </p>

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
              variant="danger"
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
