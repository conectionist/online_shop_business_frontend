import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import { useBusinessDetailsById, useCreateBusinessDetails, useUpdateBusinessDetails } from '@/hooks/useBusinessDetails';
import { BusinessDetailsCreate, BusinessDetailsUpdate } from '@/types/api';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import ErrorDetailsModal from '@/components/ui/ErrorDetailsModal';
import { useErrorHandler } from '@/hooks/useErrorHandler';

export default function BusinessDetailsForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const businessDetailsId = id ? parseInt(id) : 0;

  const [formData, setFormData] = useState<BusinessDetailsCreate>({
    adresa: '',
    telefon: '',
    motto: '',
    list_not_available_msg: '',
    alte_detalii: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    title: string;
    message: string;
    technicalDetails?: string;
    timestamp: string;
    userAction: string;
    url: string;
  } | null>(null);

  const { data: existingDetails, isLoading: isLoadingDetails, error: loadError } = useBusinessDetailsById(businessDetailsId);
  const createMutation = useCreateBusinessDetails();
  const updateMutation = useUpdateBusinessDetails();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    if (existingDetails) {
      setFormData({
        adresa: existingDetails.adresa || '',
        telefon: existingDetails.telefon || '',
        motto: existingDetails.motto || '',
        list_not_available_msg: existingDetails.list_not_available_msg || '',
        alte_detalii: existingDetails.alte_detalii || '',
      });
    }
  }, [existingDetails]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.adresa?.trim()) {
      newErrors.adresa = 'Adresa este obligatorie';
    }

    if (!formData.telefon?.trim()) {
      newErrors.telefon = 'Telefonul este obligatoriu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof BusinessDetailsCreate, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: businessDetailsId, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      navigate('/admin/business-details');
    } catch (error) {
      const errorMessage = handleError(error);
      setErrorDetails({
        title: isEditing ? 'Eroare la actualizarea detaliilor business' : 'Eroare la crearea detaliilor business',
        message: errorMessage,
        technicalDetails: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        userAction: isEditing ? 'Încercare de actualizare a detaliilor business' : 'Încercare de creare a detaliilor business',
        url: window.location.href,
      });
      setErrorModalOpen(true);
    }
  };

  if (isLoadingDetails) {
    return <Loading />;
  }

  if (loadError) {
    return (
      <Alert type="error">
        Eroare la încărcarea detaliilor: {loadError.message}
      </Alert>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/business-details')}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Înapoi
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editează Detalii Business' : 'Adaugă Detalii Business'}
        </h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresă <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.adresa}
                onChange={(e) => handleInputChange('adresa', e.target.value)}
                placeholder="Ex: Strada Test 123, București"
                className={errors.adresa ? 'border-red-300' : ''}
                required
              />
              {errors.adresa && (
                <p className="text-sm text-red-600 mt-1">{errors.adresa}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.telefon}
                onChange={(e) => handleInputChange('telefon', e.target.value)}
                placeholder="Ex: +40712345678"
                className={errors.telefon ? 'border-red-300' : ''}
                required
              />
              {errors.telefon && (
                <p className="text-sm text-red-600 mt-1">{errors.telefon}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motto
              </label>
              <Input
                value={formData.motto}
                onChange={(e) => handleInputChange('motto', e.target.value)}
                placeholder="Ex: Calitate și preț bun"
              />
              <p className="text-sm text-gray-500 mt-1">
                Sloganul sau motto-ul business-ului
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mesaj când lista nu este disponibilă
              </label>
              <Input
                value={formData.list_not_available_msg}
                onChange={(e) => handleInputChange('list_not_available_msg', e.target.value)}
                placeholder="Ex: Lista va fi disponibilă mâine"
              />
              <p className="text-sm text-gray-500 mt-1">
                Mesaj afișat când nu există liste active
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alte detalii
            </label>
            <textarea
              value={formData.alte_detalii}
              onChange={(e) => handleInputChange('alte_detalii', e.target.value)}
              placeholder="Ex: Livrare gratuită pentru comenzi peste 100 lei"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.alte_detalii ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              Informații suplimentare despre business
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/business-details')}
              disabled={isSubmitting}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Se salvează...' : (isEditing ? 'Actualizează' : 'Salvează')}
            </Button>
          </div>
        </form>
      </Card>

      {/* Error Details Modal */}
      {errorDetails && (
        <ErrorDetailsModal
          isOpen={errorModalOpen}
          onClose={() => setErrorModalOpen(false)}
          error={errorDetails}
        />
      )}
    </div>
  );
} 