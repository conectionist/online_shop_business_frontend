import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Calendar, MessageSquare, Copy } from 'lucide-react';
import { useLists } from '@/hooks/useLists';
import { useDeleteList, useCloneList } from '@/hooks/useLists';
import { List } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { useToast } from '@/components/ui/ToastContainer';

const ListsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<List | null>(null);

  // Fetch all lists
  const { data: lists, isLoading, error } = useLists();

  // Filter lists based on search term
  const filteredLists = useMemo(() => {
    if (!lists || !searchTerm.trim()) {
      return lists;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return lists.filter(list => 
      list.mesaj_introducere?.toLowerCase().includes(searchLower) ||
      list.alte_detalii?.toLowerCase().includes(searchLower) ||
      list.data.includes(searchTerm)
    );
  }, [lists, searchTerm]);

  // Delete list mutation
  const deleteListMutation = useDeleteList();
  
  // Clone list mutation
  const cloneListMutation = useCloneList();
  
  // Toast hook
  const { showToast } = useToast();

  const handleDeleteClick = (list: List) => {
    setListToDelete(list);
    setDeleteModalOpen(true);
  };

  const handleCloneClick = async (list: List) => {
    try {
      const clonedList = await cloneListMutation.mutateAsync(list.id);
      showToast({
        type: 'success',
        title: 'Listă clonată cu succes!',
        message: `Lista "${list.mesaj_introducere || 'fără titlu'}" a fost clonată. Noua listă are ID-ul ${clonedList.id}.`
      });
      
      // Navigate to the new cloned list for editing
      navigate(`/admin/lists/${clonedList.id}/manage`);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Eroare la clonarea listei',
        message: 'Nu s-a putut clona lista. Vă rugăm să încercați din nou.'
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (listToDelete) {
      try {
        await deleteListMutation.mutateAsync({ id: listToDelete.id });
        setDeleteModalOpen(false);
        setListToDelete(null);
      } catch (error) {
        console.error('Nu s-a putut șterge lista:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setListToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă listele..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Eroare la încărcarea listelor"
        message="Nu s-au putut încărca listele. Vă rugăm să încercați din nou."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader 
        title="Liste de Produse" 
        subtitle="Gestionează listele de produse disponibile"
        searchBox={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Caută în liste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        }
      >
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/admin/lists/new')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Listă
        </Button>
      </AdminPageHeader>

      {/* Lists Grid */}
      {filteredLists && filteredLists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLists.map((list) => (
            <Card key={list.id} className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {`Lista ${formatDate(list.data)}`}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(list.data)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* {list.is_current && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Curentă
                      </span>
                    )} */}
                    {list.is_published && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Publicată
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  {list.alte_detalii && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {list.alte_detalii}
                    </p>
                  )}
                  
                  
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/admin/lists/${list.id}/manage`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Gestionează
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCloneClick(list)}
                      disabled={cloneListMutation.isPending}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      {cloneListMutation.isPending ? 'Se clonează...' : 'Clonează'}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(list)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Nu s-au găsit liste' : 'Nu există liste'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Încearcă să modifici termenii de căutare'
              : 'Creează prima listă de produse pentru a începe'
            }
          </p>
          {!searchTerm && (
            <Button
              variant="primary"
              onClick={() => navigate('/admin/lists/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Creează Prima Listă
            </Button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        title="Confirmă ștergerea"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Ești sigur că vrei să ștergi lista "{listToDelete?.mesaj_introducere || 'fără titlu'}"?
          </p>
          <p className="text-sm text-gray-500">
            Această acțiune nu poate fi anulată. Toate produsele asociate cu această listă vor fi eliminate.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={handleDeleteCancel}
              disabled={deleteListMutation.isPending}
            >
              Anulează
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={deleteListMutation.isPending}
            >
              {deleteListMutation.isPending ? 'Se șterge...' : 'Șterge'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ListsList; 