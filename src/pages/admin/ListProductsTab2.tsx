import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Trash2 } from 'lucide-react';
import { useList } from '@/hooks/useLists';
import { useListProductsOrdered, useAddProductsToList, useRemoveProductFromList, useBulkUpdatePositions } from '@/hooks/useLists';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';
import { ListProduct } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import Modal from '@/components/ui/Modal';

interface ListProductsTab2Props {
  listId: number;
}

const ListProductsTab2: React.FC<ListProductsTab2Props> = ({ listId }) => {
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [productToRemove, setProductToRemove] = useState<ListProduct | null>(null);
  const [showCategoryOrderModal, setShowCategoryOrderModal] = useState(false);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [showProductOrderModal, setShowProductOrderModal] = useState(false);
  const [productOrder, setProductOrder] = useState<Record<string, number[]>>({});
  const [currentCategoryForProductOrder, setCurrentCategoryForProductOrder] = useState<string>('');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Queries
  const { data: list, isLoading: isLoadingList } = useList(listId);
  const { data: listProductsData, isLoading: isLoadingListProducts } = useListProductsOrdered(listId);
  const { data: allProducts, isLoading: isLoadingProducts } = useProducts();
  const { data: categories } = useCategories();
  const { data: units } = useUnits();

  // Mutations
  const addProductsMutation = useAddProductsToList();
  const removeProductMutation = useRemoveProductFromList();
  const bulkUpdatePositionsMutation = useBulkUpdatePositions();

  // Extract products from the new ordered structure
  const listProducts = useMemo(() => {
    if (!listProductsData?.categories) return [];
    
    // Flatten all products from all categories
    return listProductsData.categories.flatMap((category: { id: number; name: string; products: ListProduct[] }) => 
      category.products.map((product: ListProduct) => ({
        ...product,
        category_id: category.id // Ensure category_id is set
      }))
    );
  }, [listProductsData]);



  // Filter available products (products not already in the list)
  const availableProducts = useMemo(() => {
    if (!allProducts || !listProducts) return [];
    
    const listProductIds = listProducts.map((lp: ListProduct) => lp.id);
    return allProducts.filter(product => !listProductIds.includes(product.id));
  }, [allProducts, listProducts]);



  // Get unit name
  const getUnitName = (unitId: number) => {
    return units?.find(unit => unit.id === unitId)?.denumire || 'Unknown';
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string, currentOrder: string[], updateOrder: (newOrder: string[]) => void) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = currentOrder.indexOf(draggedItem);
    const targetIndex = currentOrder.indexOf(targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    
    updateOrder(newOrder);
    setDraggedItem(null);
    
    // Auto-save category order changes
    if (currentOrder.length > 0 && typeof currentOrder[0] === 'string') {
      // This is a category order change
      saveCategoryOrder(newOrder);
    }
  };

  // Filter products based on search and category
  const filteredAvailableProducts = useMemo(() => {
    if (!availableProducts) return [];
    
    return availableProducts.filter(product => {
      const matchesSearch = product.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === '' || product.category_id.toString() === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [availableProducts, searchTerm, categoryFilter]);

  // Group and sort products by category using the new ordered structure
  const groupedAndSortedProducts = useMemo(() => {
    if (!listProductsData?.categories) return [];
    
    return listProductsData.categories.map((category: { id: number; name: string; products: ListProduct[] }) => {
      const categoryName = category.name;
      const products = category.products;
      
      // Use custom order if exists, otherwise use the order from backend
      const sortedProducts = productOrder[categoryName] 
        ? productOrder[categoryName]
            .map(productId => products.find((p: ListProduct) => p.id === productId))
            .filter(Boolean) as ListProduct[]
        : products; // Use backend order by default
      
      return {
        categoryName,
        products: sortedProducts
      };
    });
  }, [listProductsData, productOrder]);

  // Handle add products in batch
  const handleAddProducts = async () => {
    if (selectedProducts.size === 0) return;
    
    try {
      const productIds = Array.from(selectedProducts);
      const result = await addProductsMutation.mutateAsync({
        listId,
        productIds
      });
      
      setShowAddProductModal(false);
      setSelectedProducts(new Set());
      
      // Show success message with count
      console.log(`Successfully added ${result.length} products to the list`);
    } catch (error) {
      console.error('Failed to add products:', error);
    }
  };

  // Toggle product selection
  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Handle remove product
  const handleRemoveProduct = async () => {
    if (!productToRemove) return;
    
    try {
      await removeProductMutation.mutateAsync({
        listId,
        productId: productToRemove.id
      });
      
      setProductToRemove(null);
    } catch (error) {
      console.error('Failed to remove product:', error);
    }
  };

  // Save category order to backend
  const saveCategoryOrder = async (newCategoryOrder: string[]) => {
    if (!listProductsData?.categories) return;
    
    try {
      // Prepare positions data for the API using the new structure
      const positions = newCategoryOrder.map(categoryName => {
        const category = listProductsData.categories.find((cat: { id: number; name: string; products: ListProduct[] }) => cat.name === categoryName);
        if (!category) return null;
        
        return {
          category_id: category.id,
          products: category.products.map((product: ListProduct) => product.id)
        };
      }).filter(Boolean);
      
      if (positions.length > 0) {
        await bulkUpdatePositionsMutation.mutateAsync({
          listId,
          positions: positions as Array<{ category_id: number; products: number[] }>
        });
        
        // Update local state to reflect the new order
        setCategoryOrder(newCategoryOrder);
      }
    } catch (error) {
      console.error('Failed to save category order:', error);
    }
  };

  // Save product order within a category to backend
  const saveProductOrder = async (categoryName: string, newProductOrder: number[]) => {
    if (!listProductsData?.categories) return;
    
    try {
      // Get all categories with their current product orders
      const allCategories = listProductsData.categories.map((category: { id: number; name: string; products: ListProduct[] }) => {
        const catName = category.name;
        
        // Use the new order for the current category, otherwise use the order from backend
        const currentProductOrder = catName === categoryName 
          ? newProductOrder 
          : category.products.map((p: ListProduct) => p.id);
        
        return {
          category_id: category.id,
          products: currentProductOrder
        };
      });
      
      if (allCategories.length > 0) {
        await bulkUpdatePositionsMutation.mutateAsync({
          listId,
          positions: allCategories
        });
        
        // Update local state to reflect the new order
        setProductOrder(prev => ({
          ...prev,
          [categoryName]: newProductOrder
        }));
      }
    } catch (error) {
      console.error('Failed to save product order:', error);
    }
  };

  if (isLoadingList) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă lista..." />
      </div>
    );
  }

  if (!list) {
    return (
      <div className="space-y-6">
        <Alert
          type="error"
          title="Eroare"
          message="Lista nu a fost găsită."
        />
        <Button onClick={() => navigate('/admin/lists')}>
          Înapoi la Liste
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Product Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowAddProductModal(true)}
          disabled={isLoadingListProducts}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Produs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Produse în Listă</p>
              <p className="text-2xl font-bold text-gray-900">
                {listProducts?.length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Produse Disponibile</p>
              <p className="text-2xl font-bold text-gray-900">
                {availableProducts?.length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* List Products Grouped by Category */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Produse în Listă (Grupate pe Categorii)</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCategoryOrderModal(true)}
            >
              Schimbă ordinea categoriilor
            </Button>
          </div>
          
          {isLoadingListProducts ? (
            <div className="flex justify-center items-center h-32">
              <Loading text="Se încarcă produsele..." />
            </div>
          ) : listProducts && listProducts.length > 0 ? (
            <div className="space-y-6">
              {groupedAndSortedProducts.map(({ categoryName, products }: { categoryName: string; products: ListProduct[] }) => (
                <div key={categoryName} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {categoryName} ({products.length} produs{products.length === 1 ? '' : 'e'})
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentCategoryForProductOrder(categoryName);
                        setShowProductOrderModal(true);
                      }}
                    >
                      Schimbă ordinea produselor
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product: ListProduct) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{product.nume}</h4>
                            {product.description && (
                              <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                            )}
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-600">
                                Preț: {product.pret} RON / {getUnitName(product.unitati_id)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setProductToRemove(product)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nu există produse în această listă</p>
              <Button
                onClick={() => setShowAddProductModal(true)}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adaugă Primul Produs
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Add Product Modal */}
      <Modal
        isOpen={showAddProductModal}
        onClose={() => {
          setShowAddProductModal(false);
          setSelectedProducts(new Set());
        }}
        title="Adaugă Produs în Listă"
      >
        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="space-y-4">
            <Input
              label="Caută Produse"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Caută după nume sau descriere..."
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrează după Categorie
              </label>
              <Select
                value={categoryFilter}
                onChange={(value) => setCategoryFilter(value)}
                options={[
                  { value: '', label: 'Toate Categoriile' },
                  ...(categories?.map(cat => ({
                    value: cat.id.toString(),
                    label: cat.name
                  })) || [])
                ]}
              />
            </div>
          </div>

          {/* Available Products */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {isLoadingProducts ? (
              <div className="flex justify-center items-center h-16">
                <Loading text="Se încarcă produsele..." />
              </div>
            ) : filteredAvailableProducts.length > 0 ? (
              filteredAvailableProducts.map(product => (
                <div
                  key={product.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedProducts.has(product.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => toggleProductSelection(product.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{product.nume}</h4>
                      {product.description && (
                        <p className="text-sm text-gray-600">{product.description}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {product.pret} RON / {getUnitName(product.unitati_id)}
                      </p>
                    </div>
                    {selectedProducts.has(product.id) && (
                      <div className="text-blue-600">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 py-4">
                Nu există produse disponibile pentru adăugare
              </p>
            )}
          </div>

          {/* Selection Summary */}
          {selectedProducts.size > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {selectedProducts.size} produs{selectedProducts.size === 1 ? '' : 'e'} selectat{selectedProducts.size === 1 ? '' : 'e'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddProductModal(false);
                setSelectedProducts(new Set());
              }}
            >
              Anulează
            </Button>
            <Button
              onClick={handleAddProducts}
              disabled={selectedProducts.size === 0 || addProductsMutation.isPending}
              loading={addProductsMutation.isPending}
            >
              Adaugă {selectedProducts.size > 0 ? `(${selectedProducts.size})` : ''} Produs{selectedProducts.size === 1 ? '' : 'e'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Product Confirmation Modal */}
      <Modal
        isOpen={!!productToRemove}
        onClose={() => setProductToRemove(null)}
        title="Șterge Produs din Listă"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Ești sigur că vrei să ștergi produsul "{productToRemove?.nume}" din această listă?
          </p>
          <p className="text-sm text-red-600">
            Această acțiune nu poate fi anulată.
          </p>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setProductToRemove(null)}
            >
              Anulează
            </Button>
            <Button
              variant="danger"
              onClick={handleRemoveProduct}
              disabled={removeProductMutation.isPending}
              loading={removeProductMutation.isPending}
            >
              Șterge Produs
            </Button>
          </div>
        </div>
      </Modal>

      {/* Category Order Modal */}
      <Modal
        isOpen={showCategoryOrderModal}
        onClose={() => setShowCategoryOrderModal(false)}
        title="Schimbă Ordinea Categoriilor"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Trage și plasează categoriile în ordinea dorită. Categoriile vor fi afișate în această ordine.
          </p>
          
          <div className="space-y-2">
            {(() => {
              // Get categories from the new ordered structure
              const uniqueCategories = listProductsData?.categories?.map((cat: { name: string }) => cat.name) || [];
              
              // Use current order or default to the order from the API
              const currentOrder = categoryOrder.length > 0 
                ? categoryOrder.filter(cat => uniqueCategories.includes(cat))
                : uniqueCategories;
              
                             return currentOrder.map((categoryName: string, index: number) => (
                 <div
                   key={categoryName}
                   draggable
                   onDragStart={(e) => handleDragStart(e, categoryName)}
                   onDragOver={handleDragOver}
                   onDrop={(e) => handleDrop(e, categoryName, currentOrder, setCategoryOrder)}
                   className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-move transition-colors ${
                     draggedItem === categoryName ? 'bg-blue-100 border-blue-300' : 'bg-gray-50'
                   }`}
                 >
                   <div className="flex items-center space-x-3">
                     <div className="text-sm text-gray-500 w-8 text-center">
                       {index + 1}
                     </div>
                     <span className="font-medium text-gray-900">{categoryName}</span>
                   </div>
                   <div className="flex space-x-2">
                     {index > 0 && (
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={async () => {
                           const newOrder = [...currentOrder];
                           [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                           setCategoryOrder(newOrder);
                           await saveCategoryOrder(newOrder);
                         }}
                       >
                         ↑
                       </Button>
                     )}
                     {index < currentOrder.length - 1 && (
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={async () => {
                           const newOrder = [...currentOrder];
                           [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                           setCategoryOrder(newOrder);
                           await saveCategoryOrder(newOrder);
                         }}
                       >
                         ↓
                       </Button>
                     )}
                   </div>
                 </div>
               ));
            })()}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setCategoryOrder([]);
                setShowCategoryOrderModal(false);
              }}
            >
              Resetează la Ordinea Alfabetică
            </Button>
            <Button
              onClick={async () => {
                await saveCategoryOrder(categoryOrder);
                setShowCategoryOrderModal(false);
              }}
              disabled={bulkUpdatePositionsMutation.isPending}
              loading={bulkUpdatePositionsMutation.isPending}
            >
              Salvează Ordinea
            </Button>
          </div>
        </div>
      </Modal>

      {/* Product Order Modal */}
      <Modal
        isOpen={showProductOrderModal}
        onClose={() => setShowProductOrderModal(false)}
        title={`Schimbă Ordinea Produselor - ${currentCategoryForProductOrder}`}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Trage și plasează produsele în ordinea dorită. Produsele vor fi afișate în această ordine.
          </p>
          
          <div className="space-y-2">
            {(() => {
              const category = listProductsData?.categories?.find(
                (cat: { name: string; products: ListProduct[] }) => cat.name === currentCategoryForProductOrder
              );
              const categoryProducts = category?.products || [];
              
              // Use current order or default to the order from the API
              const currentOrder = productOrder[currentCategoryForProductOrder] || 
                categoryProducts.map((p: ListProduct) => p.id);
              
                             return currentOrder.map((productId, index) => {
                 const product = categoryProducts.find((p: ListProduct) => p.id === productId);
                 if (!product) return null;
                 
                 return (
                   <div
                     key={productId}
                     draggable
                     onDragStart={(e) => handleDragStart(e, productId.toString())}
                     onDragOver={handleDragOver}
                     onDrop={() => {
                       const newOrder = [...currentOrder];
                       const draggedIndex = newOrder.indexOf(parseInt(draggedItem!));
                       const targetIndex = newOrder.indexOf(productId);
                       
                       if (draggedIndex !== -1 && targetIndex !== -1) {
                         newOrder.splice(draggedIndex, 1);
                         newOrder.splice(targetIndex, 0, parseInt(draggedItem!));
                         
                         setProductOrder(prev => ({
                           ...prev,
                           [currentCategoryForProductOrder]: newOrder
                         }));
                         
                         // Auto-save product order changes
                         saveProductOrder(currentCategoryForProductOrder, newOrder);
                       }
                       setDraggedItem(null);
                     }}
                     className={`flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-move transition-colors ${
                       draggedItem === productId.toString() ? 'bg-blue-100 border-blue-300' : 'bg-gray-50'
                     }`}
                   >
                     <div className="flex items-center space-x-3">
                       <div className="text-sm text-gray-500 w-8 text-center">
                         {index + 1}
                       </div>
                       <div>
                         <span className="font-medium text-gray-900">{product.nume}</span>
                         {product.description && (
                           <p className="text-sm text-gray-600">{product.description}</p>
                         )}
                         <p className="text-sm text-gray-600">
                           {product.pret} RON / {getUnitName(product.unitati_id)}
                         </p>
                       </div>
                     </div>
                     <div className="flex space-x-2">
                       {index > 0 && (
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={async () => {
                             const newOrder = [...currentOrder];
                             [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                             setProductOrder(prev => ({
                               ...prev,
                               [currentCategoryForProductOrder]: newOrder
                             }));
                             await saveProductOrder(currentCategoryForProductOrder, newOrder);
                           }}
                         >
                           ↑
                         </Button>
                       )}
                       {index < currentOrder.length - 1 && (
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={async () => {
                             const newOrder = [...currentOrder];
                             [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                             setProductOrder(prev => ({
                               ...prev,
                               [currentCategoryForProductOrder]: newOrder
                             }));
                             await saveProductOrder(currentCategoryForProductOrder, newOrder);
                           }}
                         >
                           ↓
                         </Button>
                       )}
                     </div>
                   </div>
                 );
               });
            })()}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => {
                setProductOrder(prev => {
                  const newOrder = { ...prev };
                  delete newOrder[currentCategoryForProductOrder];
                  return newOrder;
                });
                setShowProductOrderModal(false);
              }}
            >
              Resetează la Ordinea Alfabetică
            </Button>
            <Button
              onClick={async () => {
                const currentProductOrder = productOrder[currentCategoryForProductOrder];
                if (currentProductOrder) {
                  await saveProductOrder(currentCategoryForProductOrder, currentProductOrder);
                }
                setShowProductOrderModal(false);
              }}
              disabled={bulkUpdatePositionsMutation.isPending}
              loading={bulkUpdatePositionsMutation.isPending}
            >
              Salvează Ordinea
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ListProductsTab2; 