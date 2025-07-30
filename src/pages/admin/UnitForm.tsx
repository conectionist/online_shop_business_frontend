import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCreateUnit, useUpdateUnit, useUnit } from '@/hooks/useUnits';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import ErrorDetailsModal from '@/components/ui/ErrorDetailsModal';

const UnitForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  // Form state
  const [formData, setFormData] = useState({
    denumire: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Queries and mutations
  const { data: unit, isLoading: isLoadingUnit } = useUnit(Number(id));
  const createUnitMutation = useCreateUnit();
  const updateUnitMutation = useUpdateUnit();
  
  // Error handling
  const { handleError, errorDetails, showErrorModal, hideErrorModal } = useErrorHandler();

  // Load unit data when editing
  useEffect(() => {
    if (unit && isEditing) {
      setFormData({
        denumire: unit.denumire,
      });
    }
  }, [unit, isEditing]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.denumire.trim()) {
      newErrors.denumire = 'Unit name is required';
    }

    if (formData.denumire.length > 50) {
      newErrors.denumire = 'Unit name must be less than 50 characters';
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
        await updateUnitMutation.mutateAsync({
          id: Number(id),
          data: { denumire: formData.denumire },
        });
      } else {
        await createUnitMutation.mutateAsync({
          denumire: formData.denumire,
        });
      }

      // Navigate back to units list
      navigate('/admin/units');
    } catch (error) {
      // Check if this is a friendly error (409 conflict)
      const isFriendlyError = error?.response?.status === 409;
      
      if (isFriendlyError) {
        // For friendly errors, show the specific message in the form
        const errorMessage = error?.response?.data?.detail || 'This unit already exists. Please use a different name.';
        setErrors(prev => ({ ...prev, submit: errorMessage }));
      } else {
        // For other errors, use the error handler
        handleError(error, `Saving unit: ${isEditing ? 'update' : 'create'}`);
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

  if (isEditing && isLoadingUnit) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Loading unit..." />
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
          onClick={() => navigate('/admin/units')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Units
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Unit' : 'Create Unit'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Update unit information' : 'Add a new measurement unit to your shop'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <Input
              label="Unit Name"
              value={formData.denumire}
              onChange={(e) => handleInputChange('denumire', e.target.value)}
              placeholder="Enter unit name (e.g., kg, l, buc, pachet)"
              error={errors.denumire}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Examples: kg, l, buc, pachet, portii, g, ml
            </p>
          </div>

          {/* Error Display */}
          {(createUnitMutation.error || updateUnitMutation.error || errors.submit) && (
            <Alert
              type="error"
              title="Error"
              message={errors.submit || "Failed to save unit. Please try again."}
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
              onClick={() => navigate('/admin/units')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createUnitMutation.isPending || updateUnitMutation.isPending}
            >
              {isEditing ? 'Update Unit' : 'Create Unit'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UnitForm; 