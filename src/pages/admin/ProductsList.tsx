import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { Product } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Image from '@/components/ui/Image';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const ProductsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Fetch all products
  const { data: products, isLoading, error } = useProducts();
  
  // Delete product mutation
  const deleteProductMutation = useDeleteProduct();
  const { handleError } = useErrorHandler();

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!products || !searchTerm.trim()) {
      return products;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return products.filter(product => 
      product.nume.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower)
    );
  }, [products, searchTerm]);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        await deleteProductMutation.mutateAsync({ id: productToDelete.id });
        setDeleteModalOpen(false);
        setProductToDelete(null);
      } catch (error) {
        handleError(error, `Deleting product: ${productToDelete.nume}`);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Loading products..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Error loading products"
        message="Failed to load products. Please try again."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/admin/products/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Products Grid */}
      {filteredProducts && filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Product Image */}
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {product.image_versions?.thumbnail ? (
                    <Image
                      src={product.image_versions.thumbnail}
                      alt={product.nume}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Eye className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {product.nume}
                  </h3>
                  {product.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">
                      ${product.pret}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.cantitate}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(product)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Eye className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No products found' : 'No products yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Get started by adding your first product'
            }
          </p>
          {!searchTerm && (
            <Button
              variant="primary"
              onClick={() => navigate('/admin/products/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        title="Delete Product"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{productToDelete?.nume}"? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteConfirm}
              loading={deleteProductMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsList; 