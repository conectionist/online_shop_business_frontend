import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateDeliverySchedule, useUpdateDeliverySchedule, useDeliverySchedule } from '@/hooks/useDeliverySchedules';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { DeliveryScheduleCreate } from '@/types/api';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import ErrorDetailsModal from '@/components/ui/ErrorDetailsModal';

const DeliveryScheduleForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  // Form state
  const [formData, setFormData] = useState<DeliveryScheduleCreate>({
    orar_livrari: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Queries and mutations
  const { data: schedule, isLoading: isLoadingSchedule } = useDeliverySchedule(Number(id));
  const createScheduleMutation = useCreateDeliverySchedule();
  const updateScheduleMutation = useUpdateDeliverySchedule();
  
  // Error handling
  const { handleError, errorDetails, showErrorModal, hideErrorModal } = useErrorHandler();

  // Load schedule data when editing
  useEffect(() => {
    if (schedule && isEditing) {
      setFormData({
        orar_livrari: schedule.orar_livrari,
      });
    }
  }, [schedule, isEditing]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.orar_livrari.trim()) {
      newErrors.orar_livrari = 'Programul de livrare este obligatoriu';
    }

    if (formData.orar_livrari.length > 200) {
      newErrors.orar_livrari = 'Programul de livrare trebuie să aibă mai puțin de 200 de caractere';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        await updateScheduleMutation.mutateAsync({
          id: Number(id),
          data: formData,
        });
      } else {
        await createScheduleMutation.mutateAsync(formData);
      }

      // Navigate back to schedules list
      navigate('/admin/delivery-schedules');
    } catch (error: any) {
      // Check if this is a friendly error (409 conflict)
      const isFriendlyError = error?.response?.status === 409;
      
      if (isFriendlyError) {
        // For friendly errors, show the specific message in the form
        const errorMessage = error?.response?.data?.detail || 'Acest program de livrare există deja. Vă rugăm să folosiți un nume diferit.';
        setErrors(prev => ({ ...prev, submit: errorMessage }));
      } else {
        // For other errors, use the error handler
        handleError(error, `Salvarea programului de livrare: ${isEditing ? 'actualizare' : 'creare'}`);
      }
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isEditing && isLoadingSchedule) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă programul de livrare..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/delivery-schedules')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Înapoi la Programe de Livrare
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editează Program de Livrare' : 'Creează Program de Livrare'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Actualizează informațiile programului de livrare' : 'Adaugă un program de livrare nou'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Schedule Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Programul de Livrare <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.orar_livrari}
              onChange={(e) => handleInputChange('orar_livrari', e.target.value)}
              placeholder="Ex: Luni-Vineri: 9:00-18:00&#10;Sâmbătă: 9:00-14:00&#10;Duminică: Închis"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.orar_livrari ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={4}
              required
            />
            {errors.orar_livrari && (
              <p className="text-sm text-red-600 mt-1">{errors.orar_livrari}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Exemple: "Luni-Vineri: 9:00-18:00", "Sâmbătă: 9:00-14:00", "Duminică: Închis"
            </p>
          </div>

          {/* Error Display */}
          {(createScheduleMutation.error || updateScheduleMutation.error || errors.submit) && (
            <Alert
              type="error"
              title="Eroare"
              message={errors.submit || "Nu s-a putut salva programul de livrare. Vă rugăm să încercați din nou."}
            />
          )}

          {/* Error Details Modal */}
          {errorDetails && (
            <ErrorDetailsModal
              isOpen={showErrorModal}
              onClose={hideErrorModal}
              error={errorDetails}
            />
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/delivery-schedules')}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createScheduleMutation.isPending || updateScheduleMutation.isPending}
            >
              {isEditing ? 'Actualizează Programul' : 'Creează Programul'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DeliveryScheduleForm; 