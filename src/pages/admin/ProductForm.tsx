import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, AlertCircle } from 'lucide-react';
import { useProduct, useCreateProduct, useUpdateProduct, useUploadProductImage } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { ProductCreate, ProductUpdate } from '@/types/api';
import { productService } from '@/services/products';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import Image from '@/components/ui/Image';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { getProductImageUrl } from '@/services/api';

// Helper function to check if product has a real image (not placeholder)
const hasRealImage = (product: any): boolean => {
  return !!(product.image_versions && 
    product.image_versions.thumbnail && 
    !product.image_versions.thumbnail.includes('placeholder'));
};

// Validation rules
const VALIDATION_RULES = {
  nume: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-_.,()]+$/
  },
  pret: {
    required: true,
    min: 0.01,
    max: 999999.99
  },
  cantitate: {
    required: true,
    min: 0,
    max: 999999
  },
  description: {
    maxLength: 1500
  },
  category_id: {
    required: true,
    min: 1
  },
  unitati_id: {
    required: true,
    min: 1
  }
};

// Validation messages
const VALIDATION_MESSAGES = {
  nume: {
    required: 'Product name is required',
    minLength: 'Product name must be at least 2 characters',
    maxLength: 'Product name cannot exceed 100 characters',
    pattern: 'Product name contains invalid characters'
  },
  pret: {
    required: 'Price is required',
    min: 'Price must be greater than 0',
    max: 'Price cannot exceed 999,999.99'
  },
  cantitate: {
    required: 'Quantity is required',
    min: 'Quantity must be 0 or greater',
    max: 'Quantity cannot exceed 999,999'
  },
  description: {
    maxLength: 'Description cannot exceed 500 characters'
  },
  category_id: {
    required: 'Category is required',
    min: 'Please select a valid category'
  },
  unitati_id: {
    required: 'Unit is required',
    min: 'Please select a valid unit'
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Fetch product data if editing
  const { data: product, isLoading: isLoadingProduct } = useProduct(Number(id));

  // Mutations and queries
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const uploadProductImageMutation = useUploadProductImage();
  const { handleError } = useErrorHandler();
  
  // Fetch categories for dropdown
  const { data: categories, isLoading: isLoadingCategories } = useCategories();

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

  // Validate a single field
  const validateField = (field: string, value: any): string => {
    const rules = VALIDATION_RULES[field as keyof typeof VALIDATION_RULES];
    const messages = VALIDATION_MESSAGES[field as keyof typeof VALIDATION_MESSAGES];
    
    if (!rules) return '';

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return messages.required;
    }

    // Skip other validations if not required and empty
    if (!rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return '';
    }

    // String validations
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return messages.minLength;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        return messages.maxLength;
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        return messages.pattern;
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        return messages.min;
      }
      if (rules.max !== undefined && value > rules.max) {
        return messages.max;
      }
    }

    return '';
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
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file (JPG, PNG, WebP)' }));
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

        const updatedProduct = await updateProductMutation.mutateAsync({
          id: Number(id),
          data: updateData,
        });

        // Upload image if selected
        if (imageFile) {
          await uploadProductImageMutation.mutateAsync({
            productId: Number(id),
            image: imageFile,
            position: 0, // Primary image
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
            position: 0, // Primary image
          });
        }
      }

      // Navigate back to products list
      navigate('/admin/products');
    } catch (error) {
      handleError(error, `Saving product: ${isEditing ? 'update' : 'create'}`);
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
          Back to Products
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Create Product'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Update product information' : 'Add a new product to your catalog'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <Input
              label="Product Name"
              value={formData.nume}
              onChange={(e) => handleInputChange('nume', e.target.value)}
              onBlur={() => handleFieldBlur('nume')}
              placeholder="Enter product name"
              error={touched.nume ? errors.nume : ''}
              required
              maxLength={VALIDATION_RULES.nume.maxLength}
            />
            {touched.nume && !errors.nume && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Valid product name
              </p>
            )}
          </div>

          {/* Price and Quantity Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Price"
                type="number"
                step="0.01"
                min={VALIDATION_RULES.pret.min}
                max={VALIDATION_RULES.pret.max}
                value={formData.pret}
                onChange={(e) => handleInputChange('pret', parseFloat(e.target.value) || 0)}
                onBlur={() => handleFieldBlur('pret')}
                placeholder="0.00"
                error={touched.pret ? errors.pret : ''}
                required
              />
            </div>
            <div>
              <Input
                label="Quantity"
                type="number"
                min={VALIDATION_RULES.cantitate.min}
                max={VALIDATION_RULES.cantitate.max}
                value={formData.cantitate}
                onChange={(e) => handleInputChange('cantitate', parseInt(e.target.value) || 0)}
                onBlur={() => handleFieldBlur('cantitate')}
                placeholder="0"
                error={touched.cantitate ? errors.cantitate : ''}
                required
              />
            </div>
          </div>

          {/* Category and Unit Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              {isLoadingCategories ? (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                  Loading categories...
                </div>
              ) : (
                <div>
                  <Select
                    options={categoryOptions}
                    value={formData.category_id?.toString()}
                    onChange={(value) => handleInputChange('category_id', parseInt(value))}
                    onBlur={() => handleFieldBlur('category_id')}
                    placeholder="Select a category"
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
              <Input
                label="Unit ID"
                type="number"
                min={VALIDATION_RULES.unitati_id.min}
                value={formData.unitati_id}
                onChange={(e) => handleInputChange('unitati_id', parseInt(e.target.value) || 1)}
                onBlur={() => handleFieldBlur('unitati_id')}
                placeholder="1"
                error={touched.unitati_id ? errors.unitati_id : ''}
                required
              />
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-gray-500">(optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onBlur={() => handleFieldBlur('description')}
              placeholder="Enter product description (optional)"
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
                {formData.description.length}/{VALIDATION_RULES.description.maxLength} characters
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image <span className="text-gray-500">(optional)</span>
            </label>
            
            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <Image
                    src={imagePreview}
                    alt="Product preview"
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
                  Upload a product image (optional)
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Supported formats: JPG, PNG, WebP (max 5MB)
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
                  Choose Image
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

          {/* Error Display */}
          {(createProductMutation.error || updateProductMutation.error || errors.submit) && (
            <Alert
              variant="error"
              title="Error"
            >
              {errors.submit || "Failed to save product. Please try again."}
            </Alert>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createProductMutation.isPending || updateProductMutation.isPending || uploadProductImageMutation.isPending}
            >
              {isEditing ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProductForm; 