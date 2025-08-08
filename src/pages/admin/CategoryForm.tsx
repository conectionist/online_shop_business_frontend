import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { useCreateCategory, useUpdateCategory, useCategory, useUploadCategoryImage } from '@/hooks/useCategories';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { getCategoryImageUrl } from '@/services/api';

// Helper function to check if category has a real image (not placeholder)
const hasRealImage = (category: any): boolean => {
  return !!(category.image_path && category.image_path !== 'categories/placeholder');
};
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import Image from '@/components/ui/Image';
import ErrorDetailsModal from '@/components/ui/ErrorDetailsModal';

const CategoryForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [shouldClearImage, setShouldClearImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Queries and mutations
  const { data: category, isLoading: isLoadingCategory } = useCategory(Number(id));
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const uploadCategoryImageMutation = useUploadCategoryImage();
  
  // Error handling
  const { handleError, errorDetails, showErrorModal, hideErrorModal } = useErrorHandler();

  // Load category data when editing
  useEffect(() => {
    if (category && isEditing) {
      setFormData({
        name: category.name,
      });
      // Only show image preview if category has a real image (not placeholder)
      if (hasRealImage(category) && category.image_versions?.thumbnail) {
        setImagePreview(getCategoryImageUrl(category, 'thumbnail'));
      }
    }
  }, [category, isEditing]);

  // Handle file selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setShouldClearImage(true);
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Numele categoriei este obligatoriu';
    }

    if (formData.name.length > 100) {
      newErrors.name = 'Numele categoriei trebuie să aibă mai puțin de 100 de caractere';
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
        // For updates, send name and clear_image flag if needed
        await updateCategoryMutation.mutateAsync({
          id: Number(id),
          name: formData.name,
          // Only clear image if we're not uploading a new one
          ...(shouldClearImage && !imageFile && { clear_image: true }),
        });
        
        // Only upload new image if user selected a new file
        if (imageFile) {
          await uploadCategoryImageMutation.mutateAsync({
            id: Number(id),
            image: imageFile,
          });
        }
        // If no new image file and not clearing, the existing image stays untouched
      } else {
        // For creation, send name and image together
        const submitData = {
          name: formData.name,
          ...(imageFile && { primary_image: imageFile }),
        };
        await createCategoryMutation.mutateAsync(submitData);
      }

      // Navigate back to categories list
      navigate('/admin/categories');
    } catch (error: any) {
      // Check if this is a friendly error (409 conflict)
      const isFriendlyError = error?.response?.status === 409;
      
      if (isFriendlyError) {
        // For friendly errors, show the specific message in the form
        const errorMessage = error?.response?.data?.detail || 'Acest element există deja. Vă rugăm să folosiți un nume diferit.';
        setErrors(prev => ({ ...prev, submit: errorMessage }));
      } else {
        // For other errors, use the error handler
        handleError(error, `Salvarea categoriei: ${isEditing ? 'actualizare' : 'creare'}`);
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

  if (isEditing && isLoadingCategory) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă categoria..." />
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
          onClick={() => navigate('/admin/categories')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Înapoi la Categorii
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editează Categorie' : 'Creează Categorie'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Actualizează informațiile categoriei' : 'Adaugă o categorie nouă în magazin'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <Input
              label="Numele Categoriei"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Introduceți numele categoriei"
              error={errors.name}
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imaginea Categoriei
            </label>
            
            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <Image
                    src={imagePreview}
                    alt="Previzualizare categorie"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Apăsați X pentru a elimina imaginea
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Încărcați o imagine pentru categorie (opțional)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Alegeți Imaginea
                </label>
              </div>
            )}
          </div>

          {/* Error Display */}
          {(createCategoryMutation.error || updateCategoryMutation.error || errors.submit) && (
            <Alert
              type="error"
              title="Eroare"
              message={errors.submit || "Nu s-a putut salva categoria. Vă rugăm să încercați din nou."}
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
              onClick={() => navigate('/admin/categories')}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
            >
              {isEditing ? 'Actualizează Categoria' : 'Creează Categoria'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CategoryForm; 