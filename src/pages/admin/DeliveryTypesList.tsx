import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Truck, ArrowUp, ArrowDown } from 'lucide-react';
import { useDeliveryTypes, useDeleteDeliveryType, useReorderDeliveryTypes } from '@/hooks/useDeliveryTypes';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { DeliveryType } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import AdminPageHeader from '@/components/layout/AdminPageHeader';

const DeliveryTypesList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<DeliveryType | null>(null);

  // Fetch all delivery types
  const { data: deliveryTypes, isLoading, error } = useDeliveryTypes();

  // Local ordered list for reordering UI
  const [orderedTypes, setOrderedTypes] = useState<DeliveryType[] | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    if (deliveryTypes) {
      setOrderedTypes(deliveryTypes);
    }
  }, [deliveryTypes]);

  // Filter delivery types based on search term
  const filteredDeliveryTypes = useMemo(() => {
    const source = orderedTypes || deliveryTypes;
    if (!source || !searchTerm.trim()) {
      return source;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return source.filter(type => 
      type.denumire.toLowerCase().includes(searchLower) ||
      (type.description ? type.description.toLowerCase().includes(searchLower) : false) ||
      String(type.order_index).includes(searchLower)
    );
  }, [orderedTypes, deliveryTypes, searchTerm]);

  // Bulk reorder mutation
  const reorderDeliveryTypes = useReorderDeliveryTypes();
  const { handleError } = useErrorHandler();


  const moveItem = async (id: number, direction: 'up' | 'down') => {
    if (isSavingOrder || !deliveryTypes || !orderedTypes) return;

    const currentIndex = orderedTypes.findIndex(t => t.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= orderedTypes.length) return;

    // 1. Reorder the 2 affected cards in the UI immediately
    const newOrder = [...orderedTypes];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];
    
    setOrderedTypes(newOrder);
    setIsSavingOrder(true);

    try {
      // 2. Send the complete ordered array of IDs to the backend
      const deliveryTypeIds = newOrder.map(item => item.id);
      await reorderDeliveryTypes.mutateAsync(deliveryTypeIds);
      
      // The mutation's onSuccess will automatically update the cache with the server response
    } catch (error: any) {
      // 3. If request fails, revert the order back to the way it was
      setOrderedTypes(deliveryTypes || null);
      handleError(error, 'Reordonare tipuri de livrare');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Delete delivery type mutation
  const deleteDeliveryTypeMutation = useDeleteDeliveryType();

  const handleDeleteClick = (type: DeliveryType) => {
    setTypeToDelete(type);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (typeToDelete) {
      try {
        await deleteDeliveryTypeMutation.mutateAsync(typeToDelete.id);
        setDeleteModalOpen(false);
        setTypeToDelete(null);
      } catch (error) {
        console.error('Nu s-a putut șterge tipul de livrare:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setTypeToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă tipurile de livrare..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Eroare la încărcarea tipurilor de livrare"
        message="Nu s-au putut încărca tipurile de livrare. Vă rugăm să încercați din nou."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader 
        title="Tipuri de Livrare" 
        subtitle="Gestionează tipurile de livrare pentru clienți"
        searchBox={
          <Input
            placeholder="Caută tipuri de livrare..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        }
      >
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/admin/delivery-types/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Tip de Livrare
        </Button>
      </AdminPageHeader>

      {/* Delivery Types Reorderable List */}
      {filteredDeliveryTypes && filteredDeliveryTypes.length > 0 ? (
        <div className="space-y-3">
          {filteredDeliveryTypes.map((type, idx) => (
            <Card key={type.id} className="hover:shadow-lg transition-shadow">
              <div className="p-4">
                {/* Top row: info on left, arrows on right */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Truck className="h-5 w-5 text-blue-600 shrink-0" />
                      <h3 className="text-base font-semibold text-gray-900 whitespace-normal break-words">
                        {type.denumire}
                      </h3>
                    </div>
                    {type.description && (
                      <p className="text-sm text-gray-600 truncate">
                        {type.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveItem(type.id, 'up')}
                      disabled={isSavingOrder || !!searchTerm || idx === 0}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveItem(type.id, 'down')}
                      disabled={isSavingOrder || !!searchTerm || idx === filteredDeliveryTypes.length - 1}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Actions row (same style as before) */}
                <div className="flex items-center gap-2 pt-2 mt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/delivery-types/${type.id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editează
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(type)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Șterge
                  </Button>
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 ml-auto">
                    #{type.order_index}
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
              <Truck className="w-12 h-12 mx-auto" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Nu s-au găsit tipuri de livrare</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Încercați să ajustați termenii de căutare.' : 'Începeți prin crearea primului tip de livrare.'}
              </p>
            </div>
            {!searchTerm && (
              <Button
                variant="primary"
                onClick={() => navigate('/admin/delivery-types/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Creează Tip de Livrare
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        title="Șterge Tip de Livrare"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Sunteți sigur că doriți să ștergeți "{typeToDelete?.denumire}"? Această acțiune nu poate fi anulată.
          </p>
          <p className="text-sm text-red-600">
            Avertisment: Aceasta va șterge definitiv tipul de livrare. Asigurați-vă că nicio listă nu folosește acest tip de livrare.
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
              loading={deleteDeliveryTypeMutation.isPending}
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

export default DeliveryTypesList; 