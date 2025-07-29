import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X } from 'lucide-react';
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
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nume.trim()) {
      newErrors.nume = 'Product name is required';
    }

    if (formData.cantitate < 0) {
      newErrors.cantitate = 'Quantity must be 0 or greater';
    }

    if (formData.pret <= 0) {
      newErrors.pret = 'Price must be greater than 0';
    }

    if (formData.unitati_id <= 0) {
      newErrors.unitati_id = 'Unit is required';
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

  // Handle input changes
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
              placeholder="Enter product name"
              error={errors.nume}
              required
            />
          </div>

          {/* Price and Quantity Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Price"
                type="number"
                step="0.01"
                min="0"
                value={formData.pret}
                onChange={(e) => handleInputChange('pret', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                error={errors.pret}
                required
              />
            </div>
            <div>
              <Input
                label="Quantity"
                type="number"
                min="0"
                value={formData.cantitate}
                onChange={(e) => handleInputChange('cantitate', parseInt(e.target.value) || 0)}
                placeholder="0"
                error={errors.cantitate}
                required
              />
            </div>
          </div>

          {/* Category and Unit Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              {isLoadingCategories ? (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                  Loading categories...
                </div>
              ) : (
                <Select
                  options={categoryOptions}
                  value={formData.category_id?.toString()}
                  onChange={(value) => handleInputChange('category_id', parseInt(value))}
                  placeholder="Select a category"
                />
              )}
            </div>
            <div>
              <Input
                label="Unit ID"
                type="number"
                min="1"
                value={formData.unitati_id}
                onChange={(e) => handleInputChange('unitati_id', parseInt(e.target.value) || 1)}
                placeholder="1"
                error={errors.unitati_id}
                required
              />
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter product description (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
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
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Click the X to remove the image
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload a product image (optional)
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
                  Choose Image
                </label>
              </div>
            )}
          </div>

          {/* Error Display */}
          {(createProductMutation.error || updateProductMutation.error || errors.submit) && (
            <Alert
              type="error"
              title="Error"
              message={errors.submit || "Failed to save product. Please try again."}
            />
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