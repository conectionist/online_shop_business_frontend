import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { useCategories, useDeleteCategory, useReorderCategories } from '@/hooks/useCategories';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Category } from '@/types/api';
import { getCategoryImageUrl, getApiBaseUrl } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import Image from '@/components/ui/Image';
import AdminPageHeader from '@/components/layout/AdminPageHeader';

const CategoriesList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Fetch all categories
  const { data: categories, isLoading, error } = useCategories();

  // Local ordered list for reordering UI
  const [orderedCategories, setOrderedCategories] = useState<Category[] | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    if (categories) {
      setOrderedCategories(categories);
    }
  }, [categories]);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    const source = orderedCategories || categories;
    if (!source || !searchTerm.trim()) {
      return source;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return source.filter(category => 
      category.name.toLowerCase().includes(searchLower) ||
      String(category.order_index).includes(searchLower)
    );
  }, [orderedCategories, categories, searchTerm]);

  // Bulk reorder mutation
  const reorderCategories = useReorderCategories();
  const { handleError } = useErrorHandler();

  const moveItem = async (id: number, direction: 'up' | 'down') => {
    if (isSavingOrder || !categories || !orderedCategories) return;

    const currentIndex = orderedCategories.findIndex(c => c.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= orderedCategories.length) return;

    // 1. Reorder the 2 affected cards in the UI immediately
    const newOrder = [...orderedCategories];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    
    setOrderedCategories(newOrder);
    setIsSavingOrder(true);

    try {
      // 2. Send the complete ordered array of IDs to the backend
      const categoryIds = newOrder.map(item => item.id);
      await reorderCategories.mutateAsync(categoryIds);
      
      // The mutation's onSuccess will automatically update the cache with the server response
    } catch (error: any) {
      // 3. If request fails, revert the order back to the way it was
      setOrderedCategories(categories || null);
      handleError(error, 'Reordonare categorii');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Delete category mutation
  const deleteCategoryMutation = useDeleteCategory();

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategoryMutation.mutateAsync(categoryToDelete.id);
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
      } catch (error) {
        console.error('Nu s-a putut șterge categoria:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă categoriile..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Eroare la încărcarea categoriilor"
        message="Nu s-au putut încărca categoriile. Vă rugăm să încercați din nou."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader 
        title="Categorii" 
        subtitle="Gestionează categoriile de produse"
        searchBox={
          <Input
            placeholder="Caută categorii..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        }
      >
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/admin/categories/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Categorie
        </Button>
      </AdminPageHeader>

      {/* Categories Reorderable List */}
      {filteredCategories && filteredCategories.length > 0 ? (
        <div className="space-y-3">
          {filteredCategories.map((category, idx) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <div className="p-4">
                {/* Top row: info on left, arrows on right */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-2 min-w-0 flex-1">
                    {/* Category Image */}
                    <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {category.image_versions?.medium ? (
                        <Image
                          src={getCategoryImageUrl(category, 'medium')}
                          alt={category.name}
                          fallback={`${getApiBaseUrl()}/api/v1/static/placeholders/category_placeholder.jpg`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Eye className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Category Info */}
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 whitespace-normal break-words">
                        {category.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveItem(category.id, 'up')}
                      disabled={isSavingOrder || !!searchTerm || idx === 0}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveItem(category.id, 'down')}
                      disabled={isSavingOrder || !!searchTerm || idx === filteredCategories.length - 1}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2 pt-2 mt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/categories/${category.id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editează
                  </Button>
                  {/* Only show delete button if category is not "Uncategorized" */}
                  {category.name !== 'Uncategorized' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(category)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Șterge
                    </Button>
                  )}
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 ml-auto">
                    #{category.order_index}
                  </span>
                </div>
              </div>
            </Card>
          ))}
          {searchTerm && (
            <p className="text-xs text-gray-500 px-1">Reordonarea este dezactivată în modul de căutare.</p>
          )}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="space-y-4">
            <div className="text-gray-400">
              <Eye className="w-12 h-12 mx-auto" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Nu s-au găsit categorii</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Încercați să ajustați termenii de căutare.' : 'Începeți prin crearea primei categorii.'}
              </p>
            </div>
            {!searchTerm && (
              <Button
                variant="primary"
                onClick={() => navigate('/admin/categories/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Creează Categorie
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        title="Șterge Categorie"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Sunteți sigur că doriți să ștergeți "{categoryToDelete?.name}"? Această acțiune nu poate fi anulată.
          </p>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              className="flex-1"
            >
              Anulează
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              loading={deleteCategoryMutation.isPending}
              className="flex-1"
            >
              Șterge
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CategoriesList; 