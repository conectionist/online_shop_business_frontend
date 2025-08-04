import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';
import { Product } from '@/types/api';
import { getProductImageUrl } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Image from '@/components/ui/Image';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import { useErrorHandler } from '@/hooks/useErrorHandler';

// Memoized product card component for better performance
const ProductCard = React.memo<{
  product: Product;
  getCategoryName: (categoryId: number) => string;
  getUnitName: (unitId: number) => string;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}>(({ product, getCategoryName, getUnitName, onEdit, onDelete }) => (
  <Card className="overflow-hidden">
    {/* Product Image */}
    <div className="aspect-square bg-gray-100 relative">
      {product.image_versions?.thumbnail ? (
        <Image
          src={getProductImageUrl(product, 'thumbnail')}
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
    <div className="p-4">
      <h3 className="font-semibold text-lg text-gray-900 mb-2">
        {product.nume}
      </h3>
      
      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium">Categorie:</span> {getCategoryName(product.category_id)}
        </p>
        <p>
          <span className="font-medium">Preț:</span> {product.pret} RON
        </p>
        <p>
          <span className="font-medium">Cantitate:</span> {product.cantitate} {getUnitName(product.unitati_id)}
        </p>
        {product.description && (
          <p className="text-gray-500 text-xs line-clamp-2">
            {product.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(product)}
          className="flex-1"
        >
          <Edit className="w-4 h-4 mr-1" />
          Editează
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(product)}
          className="flex-1"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Șterge
        </Button>
      </div>
    </div>
  </Card>
));

ProductCard.displayName = 'ProductCard';

// Memoized pagination component
const Pagination = React.memo<{
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}>(({ currentPage, totalPages, totalProducts, startIndex, endIndex, onPageChange, hasNextPage, hasPrevPage }) => {
  const getPageNumbers = useCallback(() => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      for (let i = 1; i <= maxVisible; i++) {
        pages.push(i);
      }
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Mobile: Stacked layout */}
      <div className="md:hidden space-y-3">
        <div className="text-sm text-gray-600 text-center">
          Afișez {startIndex + 1} până la {Math.min(endIndex, totalProducts)} din {totalProducts} produse
        </div>
        
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>
          
          <div className="flex items-center gap-1">
            {getPageNumbers().map(pageNum => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
          >
            <span className="hidden sm:inline">Următor</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Desktop: Side-by-side layout */}
      <div className="hidden md:flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Afișez {startIndex + 1} până la {Math.min(endIndex, totalProducts)} din {totalProducts} produse
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>
          
          <div className="flex items-center gap-1">
            {getPageNumbers().map(pageNum => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="w-8 h-8 p-0"
              >
                {pageNum}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
          >
            Următor
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

Pagination.displayName = 'Pagination';

const ProductsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch all products
  const { data: products, isLoading, error } = useProducts();
  
  // Fetch categories for display and filtering
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  
  // Fetch units for display
  const { data: units, isLoading: isLoadingUnits } = useUnits();
  
  // Delete product mutation
  const deleteProductMutation = useDeleteProduct();
  const { handleError } = useErrorHandler();

  // Memoized helper function to get category name by ID
  const getCategoryName = useCallback((categoryId: number) => {
    const category = categories?.find(cat => cat.id === categoryId);
    return category?.name || 'Categorie Necunoscută';
  }, [categories]);

  // Memoized helper function to get unit name by ID
  const getUnitName = useCallback((unitId: number) => {
    const unit = units?.find(unit => unit.id === unitId);
    return unit?.denumire || 'Unitate Necunoscută';
  }, [units]);

  // Memoized category options for filter dropdown
  const categoryFilterOptions = useMemo(() => [
    { value: '', label: 'Toate Categoriile' },
    ...(categories?.map(category => ({
      value: category.id.toString(),
      label: category.name,
    })) || [])
  ], [categories]);

  // Memoized filtered products for better performance
  const filteredProducts = useMemo(() => {
    if (!products) return products;
    
    let filtered = products;
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category_id.toString() === selectedCategory
      );
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.nume.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [products, searchTerm, selectedCategory]);

  // Memoized pagination calculations
  const paginationData = useMemo(() => {
    const totalProducts = filteredProducts?.length || 0;
    const totalPages = Math.ceil(totalProducts / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filteredProducts?.slice(startIndex, endIndex) || [];
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    return {
      totalProducts,
      totalPages,
      startIndex,
      endIndex,
      paginatedProducts,
      hasNextPage,
      hasPrevPage
    };
  }, [filteredProducts, currentPage, pageSize]);

  // Memoized event handlers
  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when search changes
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page
  }, []);

  const handleDeleteClick = useCallback((product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  }, []);

  const handleEditClick = useCallback((product: Product) => {
    navigate(`/admin/products/${product.id}/edit`);
  }, [navigate]);

  const handleDeleteConfirm = useCallback(async () => {
    if (productToDelete) {
      try {
        await deleteProductMutation.mutateAsync({ id: productToDelete.id });
        setDeleteModalOpen(false);
        setProductToDelete(null);
      } catch (error) {
        handleError(error, `Ștergerea produsului: ${productToDelete.nume}`);
      }
    }
  }, [productToDelete, deleteProductMutation, handleError]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă produsele..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="error" title="Eroare la încărcarea produselor">
          Nu s-au putut încărca produsele. Vă rugăm să încercați din nou.
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Produse</h1>
        <Button onClick={() => navigate('/admin/products/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Produs
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Caută produse..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            options={categoryFilterOptions}
            placeholder="Filtrează după categorie"
          />

          {/* Page Size */}
          <Select
            value={pageSize.toString()}
            onChange={(value) => handlePageSizeChange(parseInt(value))}
            options={[
              { value: '5', label: '5 pe pagină' },
              { value: '10', label: '10 pe pagină' },
              { value: '20', label: '20 pe pagină' },
              { value: '50', label: '50 pe pagină' },
            ]}
            placeholder="Elemente pe pagină"
          />
        </div>
      </div>

      {/* Products Grid */}
      {paginationData.paginatedProducts && paginationData.paginatedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {paginationData.paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                getCategoryName={getCategoryName}
                getUnitName={getUnitName}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>

          {/* Pagination */}
          {paginationData.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={paginationData.totalPages}
              totalProducts={paginationData.totalProducts}
              startIndex={paginationData.startIndex}
              endIndex={paginationData.endIndex}
              onPageChange={handlePageChange}
              hasNextPage={paginationData.hasNextPage}
              hasPrevPage={paginationData.hasPrevPage}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchTerm || selectedCategory ? 'Nu s-au găsit produse care să corespundă filtrelor.' : 'Nu s-au găsit produse.'}
          </div>
          {(searchTerm || selectedCategory) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setCurrentPage(1);
              }}
            >
              Șterge filtrele
            </Button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        title="Șterge Produs"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Sunteți sigur că doriți să ștergeți "{productToDelete?.nume}"? Această acțiune nu poate fi anulată.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleDeleteCancel}>
              Anulează
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Șterge
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsList; 