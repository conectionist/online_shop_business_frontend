import React, { useState } from 'react';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { useToast } from '@/components/ui/ToastContainer';
import { authService } from '@/services/authService';
import { useFormWithAuth } from '@/hooks/useFormWithAuth';

const SecurityPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Securitate"
        subtitle="Setări de securitate pentru panoul de administrare"
      />

      <div className="bg-white rounded-lg border p-6 max-w-xl">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Schimbă parola</h2>

        <ChangePasswordForm />
      </div>
    </div>
  );
};

export default SecurityPage;


const ChangePasswordForm: React.FC = () => {
  const { showToast } = useToast();
  const { handleSubmitWithAuth } = useFormWithAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): string | null => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return 'Vă rugăm să completați toate câmpurile.';
    }
    if (newPassword.length < 8) {
      return 'Parola nouă trebuie să aibă cel puțin 8 caractere.';
    }
    if (newPassword !== confirmPassword) {
      return 'Parola nouă și confirmarea nu coincid.';
    }
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      showToast({ type: 'error', title: 'Eroare de validare', message: error });
      return;
    }
    setIsSubmitting(true);
    try {
      await handleSubmitWithAuth(authService.changePassword.bind(authService), currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast({ type: 'success', title: 'Parola a fost schimbată', message: 'Vă rugăm să folosiți noua parolă la următoarea autentificare.' });
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'A apărut o eroare la schimbarea parolei.';
      showToast({ type: 'error', title: 'Eroare', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Parola curentă</label>
        <input
          type="password"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Parola nouă</label>
        <input
          type="password"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmă parola nouă</label>
        <input
          type="password"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Se salvează...' : 'Schimbă parola'}
        </button>
      </div>
    </form>
  );
};

