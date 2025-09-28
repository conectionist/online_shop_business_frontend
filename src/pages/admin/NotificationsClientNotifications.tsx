import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const NotificationsClientNotifications: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to="/admin/notifications"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Înapoi la Notificări
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notificări Clienți</h1>
        <p className="text-gray-600">
          Clienții vor fi notificați automat atunci când:
        </p>
      </div>

      <Card>
        <div className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            {/* New List Published */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg opacity-60">
              <div className="flex-1 pr-3">
                <h3 className="text-sm font-medium text-gray-900 leading-tight">o listă nouă este publicată</h3>
              </div>
              <button
                type="button"
                className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full bg-gray-200 cursor-not-allowed"
                disabled
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
              </button>
            </div>

            {/* New Announcement */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg opacity-60">
              <div className="flex-1 pr-3">
                <h3 className="text-sm font-medium text-gray-900 leading-tight">un anunț nou este publicat</h3>
              </div>
              <button
                type="button"
                className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full bg-gray-200 cursor-not-allowed"
                disabled
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <Button
              variant="primary"
              size="sm"
              disabled
              className="w-full sm:w-auto"
            >
              Salvează preferințele
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationsClientNotifications;
