import React, { useState } from 'react';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import { Button } from './Button';
import { useToast } from './ToastContainer';

export interface ErrorDetails {
  title: string;
  message: string;
  technicalDetails?: string;
  timestamp: string;
  userAction: string;
  url: string;
}

interface ErrorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: ErrorDetails;
}

const ErrorDetailsModal: React.FC<ErrorDetailsModalProps> = ({
  isOpen,
  onClose,
  error
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const errorReport = `Raport de Eroare
================

Titlu: ${error.title}
Mesaj: ${error.message}
Timestamp: ${error.timestamp}
Acțiunea Utilizatorului: ${error.userAction}
URL: ${error.url}
${error.technicalDetails ? `Detalii Tehnice: ${error.technicalDetails}` : ''}

Vă rugăm să includeți această informație când raportați problema.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(errorReport);
      setCopied(true);
      showToast({
        type: 'success',
        title: 'Copiat!',
        message: 'Raportul de eroare a fost copiat în clipboard',
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Nu s-a putut copia în clipboard:', err);
      // Fallback for older browsers or when clipboard API fails
      const textArea = document.createElement('textarea');
      textArea.value = errorReport;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      showToast({
        type: 'success',
        title: 'Copiat!',
        message: 'Raportul de eroare a fost copiat în clipboard',
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalii Eroare"
      size="lg"
    >
      <div className="space-y-4">
        {/* Error Summary */}
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">{error.title}</h3>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          </div>
        </div>

        {/* Technical Details */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Raport de Eroare pentru Dezvoltatori</h4>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
              {errorReport}
            </pre>
          </div>
        </div>

        {/* Copy Button */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Copiați această informație pentru a o trimite echipei de dezvoltare
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            icon={copied ? Check : Copy}
            iconPosition="left"
          >
            {copied ? 'Copiat!' : 'Copiază Raportul de Eroare'}
          </Button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Închide
          </Button>
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            Reîncarcă Pagina
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ErrorDetailsModal; 