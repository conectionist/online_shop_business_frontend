import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Clock } from 'lucide-react';
import { useDeliverySchedules, useDeleteDeliverySchedule } from '@/hooks/useDeliverySchedules';
import { DeliverySchedule } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';

const DeliverySchedulesList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<DeliverySchedule | null>(null);

  // Fetch all delivery schedules
  const { data: schedules, isLoading, error } = useDeliverySchedules();

  // Filter schedules based on search term
  const filteredSchedules = useMemo(() => {
    if (!schedules || !searchTerm.trim()) {
      return schedules;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return schedules.filter(schedule => 
      schedule.orar_livrari.toLowerCase().includes(searchLower)
    );
  }, [schedules, searchTerm]);

  // Delete schedule mutation
  const deleteScheduleMutation = useDeleteDeliverySchedule();

  const handleDeleteClick = (schedule: DeliverySchedule) => {
    setScheduleToDelete(schedule);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (scheduleToDelete) {
      try {
        await deleteScheduleMutation.mutateAsync(scheduleToDelete.id);
        setDeleteModalOpen(false);
        setScheduleToDelete(null);
      } catch (error) {
        console.error('Nu s-a putut șterge programul de livrare:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setScheduleToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă programele de livrare..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Eroare la încărcarea programelor de livrare"
        message="Nu s-au putut încărca programele de livrare. Vă rugăm să încercați din nou."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programe de Livrare</h1>
          <p className="text-gray-600">Gestionează programele de livrare pentru clienți</p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/admin/delivery-schedules/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Program
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Caută programe de livrare..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Schedules Grid */}
      {filteredSchedules && filteredSchedules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchedules.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Schedule Info */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Program #{schedule.id}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {schedule.orar_livrari}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/delivery-schedules/${schedule.id}/edit`)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editează
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(schedule)}
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
              <Clock className="w-12 h-12 mx-auto" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Nu s-au găsit programe de livrare</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Încercați să ajustați termenii de căutare.' : 'Începeți prin crearea primului program de livrare.'}
              </p>
            </div>
            {!searchTerm && (
              <Button
                variant="primary"
                onClick={() => navigate('/admin/delivery-schedules/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Creează Program
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        title="Șterge Program de Livrare"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Sunteți sigur că doriți să ștergeți programul "{scheduleToDelete?.orar_livrari}"? Această acțiune nu poate fi anulată.
          </p>
          <p className="text-sm text-red-600">
            Avertisment: Aceasta va șterge definitiv programul. Asigurați-vă că nicio listă nu folosește acest program.
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
              loading={deleteScheduleMutation.isPending}
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

export default DeliverySchedulesList; 