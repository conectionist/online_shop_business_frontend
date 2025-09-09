import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateDeliveryType, useUpdateDeliveryType, useDeliveryType, useDeliveryTypes } from '@/hooks/useDeliveryTypes';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { DeliveryTypeCreate } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import ErrorDetailsModal from '@/components/ui/ErrorDetailsModal';

const DeliveryTypeForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  // Form state
  const [formData, setFormData] = useState<DeliveryTypeCreate>({
    denumire: '',
    description: '',
    order_index: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Queries and mutations
  const { data: deliveryType, isLoading: isLoadingDeliveryType } = useDeliveryType(Number(id));
  const createDeliveryTypeMutation = useCreateDeliveryType();
  const updateDeliveryTypeMutation = useUpdateDeliveryType();
  const { data: allDeliveryTypes } = useDeliveryTypes();
  
  // Error handling
  const { handleError, errorDetails, showErrorModal, hideErrorModal } = useErrorHandler();

  // Load delivery type data when editing
  useEffect(() => {
    if (deliveryType && isEditing) {
      setFormData({
        denumire: deliveryType.denumire,
        description: deliveryType.description || '',
        // Keep current order_index when editing; default to 1 if absent
        order_index: deliveryType.order_index ?? 1,
      });
    }
  }, [deliveryType, isEditing]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.denumire.trim()) {
      newErrors.denumire = 'Denumirea tipului de livrare este obligatorie';
    }

    if (formData.denumire.length > 100) {
      newErrors.denumire = 'Denumirea tipului de livrare trebuie să aibă mai puțin de 100 de caractere';
    }

    if (formData.description && formData.description.length > 150) {
      newErrors.description = 'Descrierea trebuie să aibă cel mult 150 de caractere';
    }

    // order_index is auto-assigned on create; no manual validation needed

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
        await updateDeliveryTypeMutation.mutateAsync({
          id: Number(id),
          data: formData,
        });
      } else {
        // Auto-assign next order_index based on current max
        const nextIndex = (allDeliveryTypes && allDeliveryTypes.length > 0)
          ? Math.min(127, Math.max(...allDeliveryTypes.map(t => t.order_index || 0)) + 1)
          : 1;
        await createDeliveryTypeMutation.mutateAsync({
          ...formData,
          order_index: nextIndex,
        });
      }

      // Navigate back to delivery types list
      navigate('/admin/delivery-types');
    } catch (error: any) {
      // Check if this is a friendly error (409 conflict or 400 duplicate)
      const isFriendlyError = error?.response?.status === 409 || error?.response?.status === 400;
      
      if (isFriendlyError) {
        // For friendly errors, show the specific message in the form
        const errorMessage = error?.response?.data?.detail || 'Numele sau indexul este deja folosit.';
        setErrors(prev => ({ ...prev, submit: errorMessage }));
      } else {
        // For other errors, use the error handler
        handleError(error, `Salvarea tipului de livrare: ${isEditing ? 'actualizare' : 'creare'}`);
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

  // order_index is computed automatically on create; no input handler needed

  if (isEditing && isLoadingDeliveryType) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă tipul de livrare..." />
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
          onClick={() => navigate('/admin/delivery-types')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Înapoi la Tipuri de Livrare
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editează Tip de Livrare' : 'Creează Tip de Livrare'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Actualizează informațiile tipului de livrare' : 'Adaugă un tip de livrare nou'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <Input
              label="Denumirea Tipului de Livrare"
              value={formData.denumire}
              onChange={(e) => handleInputChange('denumire', e.target.value)}
              placeholder="Ex: Livrare la domiciliu, Ridicare de la sediu, Curier"
              error={errors.denumire}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Exemple: "Livrare la domiciliu", "Ridicare de la sediu", "Curier", "Punct de ridicare"
            </p>
          </div>

          {/* Description Field */}
          <div>
            <Input
              label="Descriere (opțional)"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Ex: Ridicare de la sediu"
              error={errors.description}
            />
            <p className="text-sm text-gray-500 mt-1">Maxim 150 de caractere</p>
          </div>

          {/* Indexul de ordine este atribuit automat la creare */}

          {/* Error Display */}
          {(createDeliveryTypeMutation.error || updateDeliveryTypeMutation.error || errors.submit) && (
            <Alert
              type="error"
              title="Eroare"
              message={errors.submit || "Nu s-a putut salva tipul de livrare. Vă rugăm să încercați din nou."}
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
              onClick={() => navigate('/admin/delivery-types')}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createDeliveryTypeMutation.isPending || updateDeliveryTypeMutation.isPending}
            >
              {isEditing ? 'Actualizează Tipul de Livrare' : 'Creează Tipul de Livrare'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DeliveryTypeForm; 