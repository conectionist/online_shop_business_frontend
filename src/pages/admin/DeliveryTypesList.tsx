import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Truck } from 'lucide-react';
import { useDeliveryTypes, useDeleteDeliveryType } from '@/hooks/useDeliveryTypes';
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

  // Filter delivery types based on search term
  const filteredDeliveryTypes = useMemo(() => {
    if (!deliveryTypes || !searchTerm.trim()) {
      return deliveryTypes;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return deliveryTypes.filter(type => 
      type.denumire.toLowerCase().includes(searchLower) ||
      (type.description ? type.description.toLowerCase().includes(searchLower) : false) ||
      String(type.order_index).includes(searchLower)
    );
  }, [deliveryTypes, searchTerm]);

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

      {/* Delivery Types Grid */}
      {filteredDeliveryTypes && filteredDeliveryTypes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeliveryTypes.map((type) => (
            <Card key={type.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Delivery Type Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {type.denumire}
                      </h3>
                    </div>
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      #{type.order_index}
                    </span>
                  </div>
                  {type.description && (
                    <p className="text-sm text-gray-600">{type.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/delivery-types/${type.id}/edit`)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editează
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(type)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Șterge
                  </Button>
                </div>
              </div>
            </Card>
          ))}
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