import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreatePaymentMethod, useUpdatePaymentMethod, usePaymentMethod } from '@/hooks/usePaymentMethods';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { PaymentMethodCreate, PaymentMethodUpdate } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import ErrorDetailsModal from '@/components/ui/ErrorDetailsModal';

const PaymentMethodForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  // Form state
  const [formData, setFormData] = useState<PaymentMethodCreate>({
    name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Queries and mutations
  const { data: paymentMethod, isLoading: isLoadingPaymentMethod } = usePaymentMethod(Number(id));
  const createPaymentMethodMutation = useCreatePaymentMethod();
  const updatePaymentMethodMutation = useUpdatePaymentMethod();
  
  // Error handling
  const { handleError, errorDetails, showErrorModal, hideErrorModal } = useErrorHandler();

  // Load payment method data when editing
  useEffect(() => {
    if (paymentMethod && isEditing) {
      setFormData({
        name: paymentMethod.name,
        description: paymentMethod.description,
      });
    }
  }, [paymentMethod, isEditing]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Numele este obligatoriu';
    }

    if (formData.name.length > 20) {
      newErrors.name = 'Numele trebuie să aibă mai puțin de 20 de caractere';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrierea metodei de plată este obligatorie';
    }

    if (formData.description.length > 100) {
      newErrors.description = 'Descrierea metodei de plată trebuie să aibă mai puțin de 100 de caractere';
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
        await updatePaymentMethodMutation.mutateAsync({
          id: Number(id),
          data: formData,
        });
      } else {
        await createPaymentMethodMutation.mutateAsync(formData);
      }

      // Navigate back to payment methods list
      navigate('/admin/payment-methods');
    } catch (error) {
      // Check if this is a friendly error (409 conflict or 400 duplicate)
      const isFriendlyError = error?.response?.status === 409 || error?.response?.status === 400;
      
      if (isFriendlyError) {
        // For friendly errors, show the specific message in the form
        const errorMessage = error?.response?.data?.detail || 'Această metodă de plată există deja. Vă rugăm să folosiți o denumire diferită.';
        setErrors(prev => ({ ...prev, submit: errorMessage }));
      } else {
        // For other errors, use the error handler
        handleError(error, `Salvarea metodei de plată: ${isEditing ? 'actualizare' : 'creare'}`);
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

  if (isEditing && isLoadingPaymentMethod) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă metoda de plată..." />
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
          onClick={() => navigate('/admin/payment-methods')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Înapoi la Metode de Plată
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editează Metodă de Plată' : 'Creează Metodă de Plată'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Actualizează informațiile metodei de plată' : 'Adaugă o metodă de plată nouă'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Internal Name Field */}
          <div>
            <Input
              label="Nume"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: cash, card, transfer, paypal"
              error={errors.name}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Numele pentru identificare programatică (max 20 caractere, lowercase recomandat)
            </p>
          </div>

          {/* Description Field */}
          <div>
            <Input
              label="Descriere Afișată"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Ex: Cash, Card, Transfer Bancar, PayPal"
              error={errors.description}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Descrierea afișată clienților (max 100 caractere)
            </p>
          </div>

          {/* Error Display */}
          {(createPaymentMethodMutation.error || updatePaymentMethodMutation.error || errors.submit) && (
            <Alert
              type="error"
              title="Eroare"
              message={errors.submit || "Nu s-a putut salva metoda de plată. Vă rugăm să încercați din nou."}
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
              onClick={() => navigate('/admin/payment-methods')}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createPaymentMethodMutation.isPending || updatePaymentMethodMutation.isPending}
            >
              {isEditing ? 'Actualizează Metoda de Plată' : 'Creează Metoda de Plată'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PaymentMethodForm; 