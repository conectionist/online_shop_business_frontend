import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, CreditCard } from 'lucide-react';
import { usePaymentMethods, useDeletePaymentMethod } from '@/hooks/usePaymentMethods';
import { PaymentMethod } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';

const PaymentMethodsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);

  // Fetch all payment methods
  const { data: paymentMethods, isLoading, error } = usePaymentMethods();

  // Filter payment methods based on search term
  const filteredPaymentMethods = useMemo(() => {
    if (!paymentMethods || !searchTerm.trim()) {
      return paymentMethods;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return paymentMethods.filter(method => 
      method.name.toLowerCase().includes(searchLower)
    );
  }, [paymentMethods, searchTerm]);

  // Delete payment method mutation
  const deletePaymentMethodMutation = useDeletePaymentMethod();

  const handleDeleteClick = (method: PaymentMethod) => {
    setMethodToDelete(method);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (methodToDelete) {
      try {
        await deletePaymentMethodMutation.mutateAsync(methodToDelete.id);
        setDeleteModalOpen(false);
        setMethodToDelete(null);
      } catch (error) {
        console.error('Nu s-a putut șterge metoda de plată:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setMethodToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă metodele de plată..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Eroare la încărcarea metodelor de plată"
        message="Nu s-au putut încărca metodele de plată. Vă rugăm să încercați din nou."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Metode de Plată</h1>
          <p className="text-gray-600">Gestionează metodele de plată pentru clienți</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/admin/payment-methods/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Metodă de Plată
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Caută metode de plată..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Payment Methods Grid */}
      {filteredPaymentMethods && filteredPaymentMethods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPaymentMethods.map((method) => (
            <Card key={method.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Payment Method Info */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {method.name}
                    </h3>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/payment-methods/${method.id}/edit`)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editează
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(method)}
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
              <CreditCard className="w-12 h-12 mx-auto" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Nu s-au găsit metode de plată</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Încercați să ajustați termenii de căutare.' : 'Începeți prin crearea primei metode de plată.'}
              </p>
            </div>
            {!searchTerm && (
              <Button
                variant="primary"
                onClick={() => navigate('/admin/payment-methods/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Creează Metodă de Plată
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        title="Șterge Metodă de Plată"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Sunteți sigur că doriți să ștergeți "{methodToDelete?.name}"? Această acțiune nu poate fi anulată.
          </p>
          <p className="text-sm text-red-600">
            Avertisment: Aceasta va șterge definitiv metoda de plată. Asigurați-vă că nicio listă nu folosește această metodă de plată.
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
              loading={deletePaymentMethodMutation.isPending}
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

export default PaymentMethodsList; 