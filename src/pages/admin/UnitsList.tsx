import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useUnits, useDeleteUnit } from '@/hooks/useUnits';
import { Unit } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';

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
        console.error('Failed to delete unit:', error);
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
        <Loading text="Loading units..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Error loading units"
        message="Failed to load units. Please try again."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Units</h1>
          <p className="text-gray-600">Manage your product measurement units</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/admin/units/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Unit
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search units..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

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
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(unit)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
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
              <h3 className="text-lg font-medium text-gray-900">No units found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first unit.'}
              </p>
            </div>
            {!searchTerm && (
              <Button
                variant="primary"
                onClick={() => navigate('/admin/units/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Unit
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        title="Delete Unit"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{unitToDelete?.denumire}"? This action cannot be undone.
          </p>
          <p className="text-sm text-red-600">
            Warning: This will permanently delete the unit. Make sure no products are using this unit.
          </p>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              loading={deleteUnitMutation.isPending}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UnitsList; 