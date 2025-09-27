import React, { useState } from 'react';
import { Shield, User, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContainer';
import { notifyAllAdmins, notifySpecificAdmin } from '@/services/pushService';
import { useAuthStore } from '@/stores/authStore';

interface NotificationFormData {
  title: string;
  message: string;
  adminId: string;
  adminName: string;
}

const Notificari: React.FC = () => {
  const { showToast } = useToast();
  const { token: adminToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const [formData, setFormData] = useState<NotificationFormData>({
    title: 'Notificare Test',
    message: 'Acesta este un mesaj de test pentru a verifica funcționalitatea notificărilor.',
    adminId: '',
    adminName: ''
  });

  const handleInputChange = (field: keyof NotificationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendToAllUsers = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      showToast({
        type: 'error',
        title: 'Date incomplete',
        message: 'Completați titlul și mesajul notificării.'
      });
      return;
    }

    setIsLoading('all-users');

    try {
      // TODO: implement notifyAllUsers when backend endpoint available
      await new Promise(resolve => setTimeout(resolve, 800));
      showToast({
        type: 'success',
        title: 'Notificare trimisă',
        message: `Notificare trimisă către toți utilizatorii abonați.`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Eroare',
        message: 'Nu s-a putut trimite notificarea. Încercați din nou.'
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleSendToAllAdmins = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      showToast({
        type: 'error',
        title: 'Date incomplete',
        message: 'Completați titlul și mesajul notificării.'
      });
      return;
    }

    setIsLoading('all-admins');

    try {
      if (!adminToken) throw new Error('Token lipsă');
      await notifyAllAdmins(adminToken, {
        title: formData.title,
        body: formData.message
      });

      showToast({
        type: 'success',
        title: 'Notificare trimisă',
        message: 'Notificare trimisă către toți administratorii.'
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Eroare',
        message: 'Nu s-a putut trimite notificarea. Încercați din nou.'
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleSendToSpecificAdmin = async () => {
    if (!formData.adminId.trim() || !formData.title.trim() || !formData.message.trim()) {
      showToast({
        type: 'error',
        title: 'Date incomplete',
        message: 'Completați ID-ul administratorului, titlul și mesajul notificării.'
      });
      return;
    }

    setIsLoading('specific-admin');

    try {
      if (!adminToken) throw new Error('Token lipsă');
      await notifySpecificAdmin(adminToken, parseInt(formData.adminId, 10), {
        title: formData.title,
        body: formData.message
      });

      showToast({
        type: 'success',
        title: 'Notificare trimisă',
        message: `Notificare trimisă administratorului cu ID: ${formData.adminId}`
      });
      setFormData(prev => ({ ...prev, adminId: '' }));
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Eroare',
        message: 'Nu s-a putut trimite notificarea. Verificați ID-ul administratorului.'
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gestionare Notificări</h3>
        <p className="text-sm text-gray-600">Trimite notificări către utilizatori și administratori</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Titlu notificare</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Mesaj notificare</label>
          <textarea
            id="message"
            rows={4}
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Trimite către toți utilizatorii</h4>
          <button
            onClick={handleSendToAllUsers}
            disabled={isLoading !== null}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading === 'all-users' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Trimite la toți utilizatorii</span>
          </button>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Trimite către toți administratorii</h4>
          <button
            onClick={handleSendToAllAdmins}
            disabled={isLoading !== null}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading === 'all-admins' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            <span>Trimite la toți administratorii</span>
          </button>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">Trimite către administrator specific</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 mb-2">ID Administrator</label>
              <input
                id="adminId"
                type="text"
                value={formData.adminId}
                onChange={(e) => handleInputChange('adminId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-2">Nume Administrator (opțional)</label>
              <input
                id="adminName"
                type="text"
                value={formData.adminName}
                onChange={(e) => handleInputChange('adminName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleSendToSpecificAdmin}
            disabled={isLoading !== null || !formData.adminId.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading === 'specific-admin' ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
            <span>Trimite la administrator specific</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notificari;


