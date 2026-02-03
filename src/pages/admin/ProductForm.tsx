import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react';
import { useProduct, useCreateProduct, useUpdateProduct, useUploadProductImage, useDeleteProductImage, useProducts, useUploadImageToStaging } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';
import { ProductCreate, ProductUpdate } from '@/types/api';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
// import Image from '@/components/ui/Image';
import { useErrorHandler } from '@/hooks/useErrorHandler';
// import { getProductImageUrl } from '@/services/api';
import { IMAGE_UPLOAD, VALIDATION } from '@/utils/constants';
import ProductImagesManager from '@/pages/admin/ProductImagesManager';

// Single uploader preview helpers removed

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

  // Single uploader removed
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  // Multi-upload state for product creation
  const [createImages, setCreateImages] = useState<File[]>([]);
  const [createImagesErrors, setCreateImagesErrors] = useState<string[]>([]);
  const [createStagedFiles, setCreateStagedFiles] = useState<Array<{ file: File; previewUrl: string }>>([]);

  // Fetch product data if editing
  const { data: product, isLoading: isLoadingProduct } = useProduct(Number(id));
  const { data: allProducts } = useProducts();

  // Mutations and queries
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const uploadProductImageMutation = useUploadProductImage();
  const deleteProductImageMutation = useDeleteProductImage();
  const uploadImageToStagingMutation = useUploadImageToStaging();
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
      // Single uploader preview removed
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

  // Single uploader removed — keep state for backwards compatibility (no UI)

  // Handle multi-file selection for product creation
  const handleCreateImagesChange = (files: FileList | null) => {
    if (!files) return;
    const errs: string[] = [];
    const nextStaged: Array<{ file: File; previewUrl: string }>= [];
    Array.from(files).forEach((file) => {
      if (!IMAGE_UPLOAD.ACCEPTED_TYPES.includes(file.type as any)) {
        errs.push(IMAGE_UPLOAD.ERROR_MESSAGES.INVALID_FILE_TYPE(IMAGE_UPLOAD.ACCEPTED_EXTENSIONS));
        return;
      }
      if (file.size > IMAGE_UPLOAD.MAX_SIZE_BYTES) {
        errs.push(IMAGE_UPLOAD.ERROR_MESSAGES.FILE_TOO_LARGE(IMAGE_UPLOAD.MAX_SIZE_MB));
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      nextStaged.push({ file, previewUrl });
    });
    setCreateStagedFiles(prev => [...prev, ...nextStaged]);
    setCreateImages(prev => [...prev, ...nextStaged.map(s => s.file)]);
    setCreateImagesErrors(errs);
  };

  const removeCreateStagedAt = (index: number) => {
    setCreateStagedFiles(prev => {
      const copy = [...prev];
      const removed = copy.splice(index, 1)[0];
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
        setCreateImages(files => files.filter(f => f !== removed.file));
      }
      return copy;
    });
  };

  useEffect(() => {
    return () => {
      createStagedFiles.forEach(it => URL.revokeObjectURL(it.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // For creation with images, upload the primary image to staging first
    let primaryImageUploadId: string | undefined;
    let galleryFiles: File[] = [];

    if (!isEditing) {
      if (createImages.length > 0) {
        const [primaryFile, ...rest] = createImages;
        galleryFiles = rest;

        try {
          primaryImageUploadId = await uploadImageToStagingMutation.mutateAsync(primaryFile);
        } catch (error: any) {
          // Surface staging-specific errors and stop before creating product
          const backendDetail = error?.response?.data?.detail;
          const errorMessage =
            typeof backendDetail === 'string'
              ? backendDetail
              : 'Imaginea principală nu a putut fi încărcată. Vă rugăm să verificați formatul și dimensiunea.';
          setErrors(prev => ({ ...prev, submit: errorMessage }));
          return;
        }
      } else {
        galleryFiles = createImages;
      }
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

        // Single uploader behavior removed in edit mode
      } else {
        // For creation, send all required fields
        const createPayload: ProductCreate = {
          ...formData,
          ...(primaryImageUploadId ? { primary_image_upload_id: primaryImageUploadId } : {}),
        };

        const createdProduct = await createProductMutation.mutateAsync(createPayload);

        // Single uploader removed in create mode (use multi-upload previews instead)
        // Upload multiple images selected via multi-upload (creation)
        if (galleryFiles.length > 0) {
          for (const file of galleryFiles) {
            await uploadProductImageMutation.mutateAsync({
              productId: createdProduct.id,
              image: file,
            });
          }
        }
      }

      // Navigate back to products list
      navigate('/admin/products');
    } catch (error: any) {
      // Check if this is a friendly error (409 conflict or 400 duplicate)
      const status = error?.response?.status;
      const isFriendlyError = status === 409;
      
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

          {/* Single uploader removed — use multi-upload below */}

          {/* Multi-upload on creation */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Imagini produs (opțional)</label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                createImagesErrors.length > 0 ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <Upload className={`w-8 h-8 mx-auto mb-2 ${createImagesErrors.length > 0 ? 'text-red-400' : 'text-gray-400'}`} />
                <p className="text-sm text-gray-600 mb-2">Adăugați imagini pentru produs (opțional)</p>
                <p className="text-xs text-gray-500 mb-3">
                  {IMAGE_UPLOAD.UI_TEXT.FORMATS_ACCEPTED}: {IMAGE_UPLOAD.ACCEPTED_EXTENSIONS.join(', ')} ({IMAGE_UPLOAD.UI_TEXT.MAX_SIZE} {IMAGE_UPLOAD.MAX_SIZE_MB}MB)
                </p>
                <input
                  id="create-product-images-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleCreateImagesChange(e.target.files)}
                />
                <label
                  htmlFor="create-product-images-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  Alege Imagini
                </label>
              </div>
              {createStagedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                  {createStagedFiles.map((item, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded overflow-hidden border bg-gray-50">
                      <img src={item.previewUrl} alt="preview" className="w-full h-full object-cover" />
                      {/* primary badge on first staged */}
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Principală</span>
                      )}
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 leading-none flex items-center justify-center"
                        onClick={() => removeCreateStagedAt(idx)}
                        aria-label="Elimină"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  </div>
                </div>
              )}
              {createImagesErrors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {createImagesErrors.map((e, i) => (
                    <p key={i} className="text-sm text-red-600">{e}</p>
                  ))}
                </div>
              )}
            </div>
          )}

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