import React, { useState, useMemo } from 'react';
import { ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Search, Package } from 'lucide-react';
import { useListProductsOrdered } from '@/hooks/useLists';
import { useProducts } from '@/hooks/useProducts';
import { useAddProductToList, useRemoveProductFromList } from '@/hooks/useLists';
import { useToast } from '@/components/ui/ToastContainer';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import { Product, ListProduct } from '@/types/api';

interface ListProductsTab3Props {
  listId: number;
}

const ListProductsTab3: React.FC<ListProductsTab3Props> = ({ listId }) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  // Queries
  const { data: listProductsData, isLoading: isLoadingListProducts } = useListProductsOrdered(listId);
  const { data: allProducts, isLoading: isLoadingProducts } = useProducts();

  // Mutations
  const addProductMutation = useAddProductToList();
  const removeProductMutation = useRemoveProductFromList();
  const { showToast } = useToast();

  // Extract products from the ordered structure
  const listProducts = useMemo(() => {
    if (!listProductsData?.categories) return [];
    
    // Flatten all products from all categories
    return listProductsData.categories.flatMap((category: { id: number; name: string; products: ListProduct[] }) => 
      category.products.map((product: ListProduct) => ({
        ...product,
        category_id: category.id
      }))
    );
  }, [listProductsData]);

  // Get list of product IDs that are already in the list
  const listProductIds = useMemo(() => {
    return new Set(listProducts.map((p: ListProduct) => p.id));
  }, [listProducts]);

  // Filter available products (products not already in the list)
  const availableProducts = useMemo(() => {
    if (!allProducts) return [];
    
    return allProducts
      .filter((product: Product) => !listProductIds.has(product.id))
      .filter((product: Product) => 
        product.nume.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a: Product, b: Product) => a.nume.localeCompare(b.nume, 'ro-RO'));
  }, [allProducts, listProductIds, searchTerm]);

  // Filter list products
  const listProductsFiltered = useMemo(() => {
    return listProducts
      .filter((product: ListProduct) => 
        product.nume.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a: ListProduct, b: ListProduct) => a.nume.localeCompare(b.nume, 'ro-RO'));
  }, [listProducts, searchTerm]);

  // Determine arrow direction and visibility
  const getArrowDirection = () => {
    if (!selectedProduct) return null;
    
    const isInList = listProductIds.has(selectedProduct);
    return isInList ? 'left' : 'right';
  };

  const handleProductSelect = (productId: number) => {
    setSelectedProduct(productId);
  };

  const handleMoveProduct = async () => {
    if (!selectedProduct || isMoving) return;

    const isInList = listProductIds.has(selectedProduct);
    setIsMoving(true);

    try {
      if (isInList) {
        // Remove from list
        await removeProductMutation.mutateAsync({
          listId,
          productId: selectedProduct
        });
        showToast({
          type: 'success',
          title: 'Produs eliminat din listă',
          message: 'Produsul a fost eliminat cu succes din listă.'
        });
      } else {
        // Add to list
        await addProductMutation.mutateAsync({
          listId,
          productId: selectedProduct
        });
        showToast({
          type: 'success',
          title: 'Produs adăugat în listă',
          message: 'Produsul a fost adăugat cu succes în listă.'
        });
      }
      
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error moving product:', error);
      showToast({
        type: 'error',
        title: 'Eroare la mutarea produsului',
        message: 'A apărut o eroare la mutarea produsului. Vă rugăm să încercați din nou.'
      });
    } finally {
      setIsMoving(false);
    }
  };

  const renderProductList = (products: (Product | ListProduct)[], title: string) => {
    return (
      <Card className="h-full" padding="sm">
        <div className="p-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">
            {products.length} {products.length === 1 ? 'produs' : 'produse'}
          </p>
        </div>
        
        <div className="p-2">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Caută produse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Product List */}
          <div className="space-y-2 max-h-[60vh] md:max-h-96 overflow-y-auto">
            {products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>Nu există produse</p>
              </div>
            ) : (
              products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedProduct === product.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {product.nume}
                      </h4>
                      {product.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedProduct === product.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedProduct === product.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderArrow = () => {
    const direction = getArrowDirection();
    // Default to right if no selection or no direction determined
    const isRight = direction === 'right' || !direction;
    const ArrowIcon = isRight ? ArrowRight : ArrowLeft;
    const ArrowIconMobile = isRight ? ArrowDown : ArrowUp;

    return (
      <div className="flex flex-col items-center justify-center">
        {/* Desktop Arrow */}
        <div className="hidden md:block">
          <Button
            onClick={handleMoveProduct}
            disabled={isMoving || !selectedProduct}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow"
          >
            <ArrowIcon className="h-6 w-6 text-white" />
          </Button>
        </div>

        {/* Mobile Arrow */}
        <div className="block md:hidden">
          <Button
            onClick={handleMoveProduct}
            disabled={isMoving || !selectedProduct}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow"
          >
            <ArrowIconMobile className="h-6 w-6 text-white" />
          </Button>
        </div>

        {isMoving && (
          <div className="text-xs text-gray-500 text-center mt-2">
            Se mută...
          </div>
        )}
      </div>
    );
  };

  // Loading states
  if (isLoadingListProducts || isLoadingProducts) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă produsele..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Gestionează Produsele
        </h2>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">Cum funcționează:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Selectează un produs din oricare listă</li>
            <li>• Săgeata va indica direcția în care va fi mutat produsul</li>
            <li>• Apasă pe săgeată pentru a muta produsul</li>
            <li>• Folosește căutarea pentru a găsi rapid produsele</li>
          </ul>
        </div>
      </Card>

      {/* Dual List Selector */}
      <div className="grid grid-cols-1 md:grid-cols-[45%_10%_45%] gap-1 md:gap-2 mb-6">
        {/* Available Products */}
        <div className="md:col-span-1">
          {renderProductList(availableProducts, 'Produse Disponibile')}
        </div>

        {/* Arrow - always visible, centered */}
        <div className="md:col-span-1 flex items-center justify-center py-2">
          {renderArrow()}
        </div>

        {/* List Products */}
        <div className="md:col-span-1">
          {renderProductList(listProductsFiltered, 'Produse în Listă')}
        </div>
      </div>
    </div>
  );
};

export default ListProductsTab3;
