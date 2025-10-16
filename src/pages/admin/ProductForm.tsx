import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, AlertCircle } from 'lucide-react';
import { useProduct, useCreateProduct, useUpdateProduct, useUploadProductImage, useDeleteProductImage, useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';
import { ProductCreate, ProductUpdate } from '@/types/api';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import Image from '@/components/ui/Image';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { getProductImageUrl } from '@/services/api';
import { IMAGE_UPLOAD, VALIDATION } from '@/utils/constants';
import ProductImagesManager from '@/pages/admin/ProductImagesManager';

// Helper function to check if product has a real image (not placeholder)
const hasRealImage = (product: any): boolean => {
  return !!(product.image_versions && 
    product.image_versions.thumbnail && 
    !product.image_versions.thumbnail.includes('placeholder'));
};

// Validation rule types
interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
}

// Validation rules
const VALIDATION_RULES: Record<string, ValidationRule> = {
  nume: {
    required: true,
    minLength: 1,
    maxLength: VALIDATION.PRODUCT_NAME_MAX_LENGTH,
  },
  pret: {
    required: true,
    min: 0.01,
    max: VALIDATION.PRODUCT_PRICE_MAX
  },
  cantitate: {
    required: true,
    min: 0,
    max: VALIDATION.PRODUCT_QUANTITY_MAX
  },
  description: {
    maxLength: VALIDATION.PRODUCT_DESCRIPTION_MAX_LENGTH
  },
  category_id: {
    required: true,
    min: 1
  },
  unitati_id: {
    required: true,
    min: 1
  }
} as const;

// Validation message types
interface ValidationMessages {
  required?: string;
  minLength?: string;
  maxLength?: string;
  pattern?: string;
  min?: string;
  max?: string;
}

// Validation messages
const VALIDATION_MESSAGES: Record<string, ValidationMessages> = {
  nume: {
    required: 'Numele produsului este obligatoriu',
    minLength: 'Numele produsului trebuie să aibă cel puțin 1 caracter',
    maxLength: 'Numele produsului nu poate depăși 100 de caractere'
  },
  pret: {
    required: 'Prețul este obligatoriu',
    min: 'Prețul trebuie să fie mai mare decât 0',
    max: 'Prețul nu poate depăși 999.999,99'
  },
  cantitate: {
    required: 'Cantitatea este obligatorie',
    min: 'Cantitatea trebuie să fie 0 sau mai mare',
    max: 'Cantitatea nu poate depăși 999.999'
  },
  description: {
    maxLength: 'Descrierea nu poate depăși 500 de caractere'
  },
  category_id: {
    required: 'Categoria este obligatorie',
    min: 'Vă rugăm să selectați o categorie validă'
  },
  unitati_id: {
    required: 'Unitatea este obligatorie',
    min: 'Vă rugăm să selectați o unitate validă'
  }
};

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  // Form state
  const [formData, setFormData] = useState<ProductCreate>({
    nume: '',
    cantitate: 0,
    pret: 0,
    description: '',
    category_id: 1, // Default to "Uncategorized"
    unitati_id: 1, // Default to first unit
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [shouldClearImage, setShouldClearImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Fetch product data if editing
  const { data: product, isLoading: isLoadingProduct } = useProduct(Number(id));
  const { data: allProducts } = useProducts();

  // Mutations and queries
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const uploadProductImageMutation = useUploadProductImage();
  const deleteProductImageMutation = useDeleteProductImage();
  const { handleError } = useErrorHandler();
  
  // Fetch categories for dropdown
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  
  // Fetch units for dropdown
  const { data: units, isLoading: isLoadingUnits } = useUnits();

  // Load product data when editing
  useEffect(() => {
    if (product && isEditing) {
      setFormData({
        nume: product.nume,
        cantitate: product.cantitate,
        pret: product.pret,
        description: product.description || '',
        category_id: product.category_id,
        unitati_id: product.unitati_id,
      });
      // Only show image preview if product has a real image (not placeholder)
      if (hasRealImage(product) && product.image_versions?.thumbnail) {
        setImagePreview(getProductImageUrl(product, 'thumbnail'));
      }
    }
  }, [product, isEditing]);

  // Set default unit when units are loaded (for new products)
  useEffect(() => {
    if (!isEditing && units && units.length > 0 && formData.unitati_id === 0) {
      setFormData((prev: ProductCreate) => ({ ...prev, unitati_id: units[0].id }));
    }
  }, [units, isEditing, formData.unitati_id]);

  // Validate a single field
  const validateField = (field: string, value: any): string => {
    const fieldRules = VALIDATION_RULES[field];
    const messages = VALIDATION_MESSAGES[field as keyof typeof VALIDATION_MESSAGES];
    
    if (!fieldRules) return '';

    // Type assertion to ensure we have the right type
    const rules = fieldRules as ValidationRule;

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return messages.required || '';
    }

    // Skip other validations if not required and empty
    if (!rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return '';
    }

    // String validations
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (rules.minLength && trimmed.length < rules.minLength) {
        return messages.minLength || '';
      }
      if (rules.maxLength && trimmed.length > rules.maxLength) {
        return messages.maxLength || '';
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        return messages.min || '';
      }
      if (rules.max !== undefined && value > rules.max) {
        return messages.max || '';
      }
    }

    return '';
  };

  const normalizeForUniqueness = (text: string): string =>
    (text || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const isDuplicateName = (name: string): boolean => {
    if (!allProducts || !Array.isArray(allProducts)) return false;
    const currentId = isEditing ? Number(id) : null;
    const target = normalizeForUniqueness(name);
    return allProducts.some((p: any) => {
      if (currentId && p.id === currentId) return false;
      return normalizeForUniqueness(p.nume || '') === target;
    });
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(VALIDATION_RULES).forEach(field => {
      const value = formData[field as keyof ProductCreate];
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field blur (mark as touched and validate)
  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = formData[field as keyof ProductCreate];
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Handle input changes with real-time validation
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation for touched fields
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // Handle file selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 25MB)
      if (file.size > IMAGE_UPLOAD.MAX_SIZE_BYTES) {
        setErrors(prev => ({ ...prev, image: IMAGE_UPLOAD.ERROR_MESSAGES.FILE_TOO_LARGE(IMAGE_UPLOAD.MAX_SIZE_MB) }));
        return;
      }

      // Validate file type
      if (!IMAGE_UPLOAD.ACCEPTED_TYPES.includes(file.type as any)) {
        setErrors(prev => ({ ...prev, image: IMAGE_UPLOAD.ERROR_MESSAGES.INVALID_FILE_TYPE(IMAGE_UPLOAD.ACCEPTED_EXTENSIONS) }));
        return;
      }

      setImageFile(file);
      setErrors(prev => ({ ...prev, image: '' }));
      
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
    setErrors(prev => ({ ...prev, image: '' }));
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Mark all fields as touched
    const allFields = Object.keys(VALIDATION_RULES);
    setTouched(prev => {
      const newTouched = { ...prev };
      allFields.forEach(field => {
        newTouched[field] = true;
      });
      return newTouched;
    });

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        // For updates, send only changed fields
        const updateData: ProductUpdate = {};
        if (formData.nume !== product?.nume) updateData.nume = formData.nume;
        if (formData.cantitate !== product?.cantitate) updateData.cantitate = formData.cantitate;
        if (formData.pret !== product?.pret) updateData.pret = formData.pret;
        if (formData.description !== product?.description) updateData.description = formData.description;
        if (formData.category_id !== product?.category_id) updateData.category_id = formData.category_id;
        if (formData.unitati_id !== product?.unitati_id) updateData.unitati_id = formData.unitati_id;

        await updateProductMutation.mutateAsync({
          id: Number(id),
          data: updateData,
        });

        // Handle image replacement
        if (shouldClearImage && !imageFile) {
          // User wants to remove the image - delete existing images
          if (product?.images && product.images.length > 0) {
            for (const image of product.images) {
              await deleteProductImageMutation.mutateAsync({
                productId: Number(id),
                imageId: image.id,
              });
            }
          }
        } else if (imageFile) {
          // User wants to upload a new image - delete old ones first if they exist
          if (product?.images && product.images.length > 0) {
            for (const image of product.images) {
              await deleteProductImageMutation.mutateAsync({
                productId: Number(id),
                imageId: image.id,
              });
            }
          }
          
          // Upload the new image
          await uploadProductImageMutation.mutateAsync({
            productId: Number(id),
            image: imageFile,
          });
        }
      } else {
        // For creation, send all required fields
        const createdProduct = await createProductMutation.mutateAsync(formData);

        // Upload image if selected
        if (imageFile) {
          await uploadProductImageMutation.mutateAsync({
            productId: createdProduct.id,
            image: imageFile,
          });
        }
      }

      // Navigate back to products list
      navigate('/admin/products');
    } catch (error: any) {
      // Check if this is a friendly error (409 conflict or 400 duplicate)
      const isFriendlyError = error?.response?.status === 409 || error?.response?.status === 400;
      
      if (isFriendlyError) {
        // For friendly errors, show the specific message in the form
        const errorMessage = 'Acest produs există deja. Vă rugăm să folosiți un nume diferit.';
        setErrors(prev => ({ ...prev, submit: errorMessage }));
      } else {
        // For other errors, use the error handler
        handleError(error, `Saving product: ${isEditing ? 'update' : 'create'}`);
      }
    }
  };

  // Prepare category options for dropdown
  const categoryOptions = categories?.map((category: any) => ({
    value: category.id.toString(),
    label: category.name,
  })) || [];

  if (isEditing && isLoadingProduct) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Loading product..." />
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
          onClick={() => navigate('/admin/products')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Înapoi la Produse
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editează Produs' : 'Creează Produs'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Actualizează informațiile produsului' : 'Adaugă un produs nou în catalog'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <Input
              label="Numele Produsului"
              value={formData.nume}
              onChange={(e) => handleInputChange('nume', e.target.value)}
              onBlur={() => handleFieldBlur('nume')}
              placeholder="Introduceți numele produsului"
              error={touched.nume && typeof errors.nume === 'string' ? errors.nume : ''}
              required
              maxLength={VALIDATION_RULES.nume.maxLength}
            />
            {touched.nume && !errors.nume && isDuplicateName(formData.nume) && (
              <p className="text-sm text-red-600 mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Acest nume pare deja folosit (verificare rapidă). Vă rugăm să verificați.
              </p>
            )}
            {touched.nume && !errors.nume && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Numele produsului este valid
              </p>
            )}
          </div>

          {/* Price and Quantity Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Preț"
                type="number"
                step="0.01"
                min={VALIDATION_RULES.pret.min}
                max={VALIDATION_RULES.pret.max}
                value={formData.pret}
                onChange={(e) => handleInputChange('pret', parseFloat(e.target.value) || 0)}
                onBlur={() => handleFieldBlur('pret')}
                placeholder="0.00"
                error={touched.pret && typeof errors.pret === 'string' ? errors.pret : ''}
                required
              />
            </div>
            <div>
              <Input
                label="Cantitate"
                type="number"
                min={VALIDATION_RULES.cantitate.min}
                max={VALIDATION_RULES.cantitate.max}
                value={formData.cantitate}
                onChange={(e) => handleInputChange('cantitate', parseInt(e.target.value) || 0)}
                onBlur={() => handleFieldBlur('cantitate')}
                placeholder="0"
                error={touched.cantitate && typeof errors.cantitate === 'string' ? errors.cantitate : ''}
                required
              />
            </div>
          </div>

          {/* Category and Unit Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorie <span className="text-red-500">*</span>
              </label>
              {isLoadingCategories ? (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                  Se încarcă categoriile...
                </div>
              ) : (
                <div>
                  <Select
                    options={categoryOptions}
                    value={formData.category_id?.toString()}
                    onChange={(value) => {
                      handleInputChange('category_id', parseInt(value));
                      handleFieldBlur('category_id');
                    }}
                    placeholder="Selectează o categorie"
                  />
                  {touched.category_id && errors.category_id && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.category_id}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit <span className="text-red-500">*</span>
              </label>
              {isLoadingUnits ? (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                  Loading units...
                </div>
              ) : (
                <div>
                  <Select
                    options={units?.map(unit => ({
                      value: unit.id.toString(),
                      label: unit.denumire
                    })) || []}
                    value={formData.unitati_id?.toString()}
                    onChange={(value) => {
                      handleInputChange('unitati_id', parseInt(value) || 1);
                      handleFieldBlur('unitati_id');
                    }}
                    placeholder="Select a unit"
                  />
                  {touched.unitati_id && errors.unitati_id && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.unitati_id}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Descriere <span className="text-gray-500">(opțional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onBlur={() => handleFieldBlur('description')}
                              placeholder="Introduceți descrierea produsului (opțional)"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.description && errors.description 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300'
              }`}
              rows={4}
              maxLength={VALIDATION_RULES.description.maxLength}
            />
            <div className="flex justify-between items-center mt-1">
              {touched.description && errors.description && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.description}
                </p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {(formData.description || '').length}/{VALIDATION_RULES.description.maxLength}
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Imaginea Produsului <span className="text-gray-500">(opțional)</span>
            </label>
            
            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <Image
                    src={imagePreview}
                    alt="Previzualizare produs"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Click the X to remove the image
                </p>
              </div>
            ) : (
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                errors.image ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <Upload className={`w-8 h-8 mx-auto mb-2 ${
                  errors.image ? 'text-red-400' : 'text-gray-400'
                }`} />
                <p className="text-sm text-gray-600 mb-2">
                  {IMAGE_UPLOAD.UI_TEXT.UPLOAD_IMAGE}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  {IMAGE_UPLOAD.UI_TEXT.FORMATS_ACCEPTED}: {IMAGE_UPLOAD.ACCEPTED_EXTENSIONS.join(', ')} ({IMAGE_UPLOAD.UI_TEXT.MAX_SIZE} {IMAGE_UPLOAD.MAX_SIZE_MB}MB)
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
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  {IMAGE_UPLOAD.UI_TEXT.CHOOSE_IMAGE}
                </label>
                {errors.image && (
                  <p className="text-sm text-red-600 mt-2 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.image}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Images Manager (only when editing existing product) */}
          {isEditing && product && (
            <div className="pt-6 border-t border-gray-200">
              <ProductImagesManager productId={product.id} images={product.images || []} />
            </div>
          )}

          {/* Error Display */}
          {(createProductMutation.error || updateProductMutation.error || errors.submit) && (
            <Alert
              type="error"
              title="Eroare"
              message={
                (typeof errors.submit === 'string' ? errors.submit : '') || 
                (typeof createProductMutation.error?.message === 'string' ? createProductMutation.error.message : '') ||
                (typeof updateProductMutation.error?.message === 'string' ? updateProductMutation.error.message : '') ||
                "Nu s-a putut salva produsul. Vă rugăm să încercați din nou."
              }
            />
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
            >
                              Anulează
            </Button>
                        <Button
              type="submit"
              variant="primary"
              loading={createProductMutation.isPending || updateProductMutation.isPending || uploadProductImageMutation.isPending || deleteProductImageMutation.isPending}
            >
              {isEditing ? 'Actualizează Produsul' : 'Creează Produsul'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProductForm; 