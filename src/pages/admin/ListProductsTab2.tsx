import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Package, Trash2 } from 'lucide-react';
import { useList } from '@/hooks/useLists';
import { useListProducts, useAddProductToList, useAddProductsToList, useRemoveProductFromList } from '@/hooks/useLists';
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
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
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
  const { data: listProducts, isLoading: isLoadingListProducts } = useListProducts(listId);
  const { data: allProducts, isLoading: isLoadingProducts } = useProducts();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: units, isLoading: isLoadingUnits } = useUnits();

  // Mutations
  const addProductMutation = useAddProductToList();
  const addProductsMutation = useAddProductsToList();
  const removeProductMutation = useRemoveProductFromList();

  // Filter available products (products not already in the list)
  const availableProducts = useMemo(() => {
    if (!allProducts || !listProducts) return [];
    
    const listProductIds = listProducts.map((lp: ListProduct) => lp.id);
    return allProducts.filter(product => !listProductIds.includes(product.id));
  }, [allProducts, listProducts]);

  // Get category name
  const getCategoryName = (categoryId: number) => {
    return categories?.find(cat => cat.id === categoryId)?.name || 'Unknown';
  };

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
  };

  // Filter products based on search and category
  const filteredAvailableProducts = useMemo(() => {
    if (!availableProducts) return [];
    
    return availableProducts.filter(product => {
      const matchesSearch = product.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = categoryFilter === '' || product.category_id === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [availableProducts, searchTerm, categoryFilter]);

  // Group and sort products by category
  const groupedAndSortedProducts = useMemo(() => {
    if (!listProducts) return [];
    
    // Group products by category
    const groupedProducts = listProducts.reduce((acc: Record<string, ListProduct[]>, product: ListProduct) => {
      const categoryName = getCategoryName(product.category_id);
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(product);
      return acc;
    }, {});

    // Get unique categories and sort them
    const uniqueCategories = Object.keys(groupedProducts);
    const sortedCategories = categoryOrder.length > 0 
      ? categoryOrder.filter(cat => uniqueCategories.includes(cat))
      : uniqueCategories.sort();

    return sortedCategories.map((categoryName) => {
      const products = groupedProducts[categoryName];
      
      // Sort products within category if custom order exists
      const sortedProducts = productOrder[categoryName] 
        ? productOrder[categoryName]
            .map(productId => products.find(p => p.id === productId))
            .filter(Boolean) as ListProduct[]
        : products.sort((a, b) => a.nume.localeCompare(b.nume));
      
      return {
        categoryName,
        products: sortedProducts
      };
    });
  }, [listProducts, categoryOrder, productOrder]);

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
              {groupedAndSortedProducts.map(({ categoryName, products }) => (
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
            
            <Select
              label="Filtrează după Categorie"
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value)}
              options={[
                { value: '', label: 'Toate Categoriile' },
                ...(categories?.map(cat => ({
                  value: cat.id,
                  label: cat.name
                })) || [])
              ]}
            />
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
              // Get unique categories from list products
              const uniqueCategories = listProducts ? 
                [...new Set(listProducts.map(product => getCategoryName(product.category_id)))] : [];
              
              // Use current order or default to alphabetical
              const currentOrder = categoryOrder.length > 0 
                ? categoryOrder.filter(cat => uniqueCategories.includes(cat))
                : uniqueCategories.sort();
              
                             return currentOrder.map((categoryName, index) => (
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
                         onClick={() => {
                           const newOrder = [...currentOrder];
                           [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                           setCategoryOrder(newOrder);
                         }}
                       >
                         ↑
                       </Button>
                     )}
                     {index < currentOrder.length - 1 && (
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => {
                           const newOrder = [...currentOrder];
                           [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                           setCategoryOrder(newOrder);
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
              onClick={() => setShowCategoryOrderModal(false)}
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
              const categoryProducts = groupedAndSortedProducts.find(
                item => item.categoryName === currentCategoryForProductOrder
              )?.products || [];
              
              // Use current order or default to alphabetical
              const currentOrder = productOrder[currentCategoryForProductOrder] || 
                categoryProducts.map(p => p.id);
              
                             return currentOrder.map((productId, index) => {
                 const product = categoryProducts.find(p => p.id === productId);
                 if (!product) return null;
                 
                 return (
                   <div
                     key={productId}
                     draggable
                     onDragStart={(e) => handleDragStart(e, productId.toString())}
                     onDragOver={handleDragOver}
                     onDrop={(e) => handleDrop(
                       e, 
                       productId.toString(), 
                       currentOrder.map(id => id.toString()), 
                       (newOrder) => setProductOrder(prev => ({
                         ...prev,
                         [currentCategoryForProductOrder]: newOrder.map(id => parseInt(id))
                       }))
                     )}
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
                           onClick={() => {
                             const newOrder = [...currentOrder];
                             [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                             setProductOrder(prev => ({
                               ...prev,
                               [currentCategoryForProductOrder]: newOrder
                             }));
                           }}
                         >
                           ↑
                         </Button>
                       )}
                       {index < currentOrder.length - 1 && (
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => {
                             const newOrder = [...currentOrder];
                             [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                             setProductOrder(prev => ({
                               ...prev,
                               [currentCategoryForProductOrder]: newOrder
                             }));
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
              onClick={() => setShowProductOrderModal(false)}
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