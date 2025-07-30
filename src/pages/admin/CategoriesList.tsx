import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useDeleteCategory } from '@/hooks/useCategories';
import { Category } from '@/types/api';
import { getCategoryImageUrl } from '@/services/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import Image from '@/components/ui/Image';

const CategoriesList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Fetch all categories
  const { data: categories, isLoading, error } = useCategories();

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!categories || !searchTerm.trim()) {
      return categories;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchLower)
    );
  }, [categories, searchTerm]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorii</h1>
          <p className="text-gray-600">Gestionează categoriile de produse</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/admin/categories/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Categorie
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Caută categorii..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Categories Grid */}
      {filteredCategories && filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Category Image */}
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {category.image_versions?.thumbnail ? (
                    <Image
                      src={getCategoryImageUrl(category, 'thumbnail')}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Eye className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Category Info */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/categories/${category.id}/edit`)}
                    className="flex-1"
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
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Șterge
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
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