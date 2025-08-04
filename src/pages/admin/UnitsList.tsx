import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useUnits, useDeleteUnit } from '@/hooks/useUnits';
import { Unit } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import AdminPageHeader from '@/components/layout/AdminPageHeader';

const UnitsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

  // Fetch all units
  const { data: units, isLoading, error } = useUnits();

  // Filter units based on search term
  const filteredUnits = useMemo(() => {
    if (!units || !searchTerm.trim()) {
      return units;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return units.filter(unit => 
      unit.denumire.toLowerCase().includes(searchLower)
    );
  }, [units, searchTerm]);

  // Delete unit mutation
  const deleteUnitMutation = useDeleteUnit();

  const handleDeleteClick = (unit: Unit) => {
    setUnitToDelete(unit);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (unitToDelete) {
      try {
        await deleteUnitMutation.mutateAsync(unitToDelete.id);
        setDeleteModalOpen(false);
        setUnitToDelete(null);
      } catch (error) {
        console.error('Nu s-a putut șterge unitatea:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setUnitToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă unitățile..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Eroare la încărcarea unităților"
        message="Nu s-au putut încărca unitățile. Vă rugăm să încercați din nou."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader 
        title="Unități" 
        subtitle="Gestionează unitățile de măsură pentru produse"
        searchBox={
          <Input
            placeholder="Caută unități..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        }
      >
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/admin/units/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Unitate
        </Button>
      </AdminPageHeader>

      {/* Units Grid */}
      {filteredUnits && filteredUnits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => (
            <Card key={unit.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Unit Info */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {unit.denumire}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ID: {unit.id}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/units/${unit.id}/edit`)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editează
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(unit)}
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
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Nu s-au găsit unități</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Încercați să ajustați termenii de căutare.' : 'Începeți prin crearea primei unități.'}
              </p>
            </div>
            {!searchTerm && (
              <Button
                variant="primary"
                onClick={() => navigate('/admin/units/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Creează Unitate
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        title="Șterge Unitate"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Sunteți sigur că doriți să ștergeți "{unitToDelete?.denumire}"? Această acțiune nu poate fi anulată.
          </p>
          <p className="text-sm text-red-600">
            Avertisment: Aceasta va șterge definitiv unitatea. Asigurați-vă că nicio unitate nu folosește această unitate.
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
              loading={deleteUnitMutation.isPending}
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

export default UnitsList; 