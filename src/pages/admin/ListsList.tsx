import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, MessageSquare, Copy, MoreVertical } from 'lucide-react';
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
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Fetch all lists
  const { data: lists, isLoading, error } = useLists({ limit: 1000 });

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

  const toggleDropdown = (listId: number) => {
    setOpenDropdownId(openDropdownId === listId ? null : listId);
  };

  const closeDropdown = () => {
    setOpenDropdownId(null);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId !== null) {
        // Check if the click is outside the dropdown
        const target = event.target as Element;
        const dropdownElement = document.querySelector(`[data-dropdown-id="${openDropdownId}"]`);
        
        if (dropdownElement && !dropdownElement.contains(target)) {
          closeDropdown();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
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
              className="pl-10 w-full"
            />
          </div>
        }
      >
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/admin/lists/new')}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adaugă Listă
        </Button>
      </AdminPageHeader>

      {/* Lists Grid */}
      {filteredLists && filteredLists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredLists.map((list) => (
            <Card key={list.id} className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words pr-2">
                      {`Lista ${formatDate(list.data)}`}
                    </h3>
                    {/* Published Status - moved to second row */}
                    {list.is_published && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                          Publicată
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Hamburger Menu Button */}
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(list.id)}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdownId === list.id && (
                      <div 
                        className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                        data-dropdown-id={list.id}
                      >
                        {/* Manage Option */}
                        <button
                          onClick={() => {
                            closeDropdown();
                            navigate(`/admin/lists/${list.id}/manage`);
                          }}
                          className="w-full flex items-center px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4 mr-2 sm:mr-3 text-gray-400" />
                          Gestionează
                        </button>

                        {/* Clone Option */}
                        <button
                          onClick={() => {
                            closeDropdown();
                            handleCloneClick(list);
                          }}
                          disabled={cloneListMutation.isPending}
                          className="w-full flex items-center px-3 sm:px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          <Copy className="w-4 h-4 mr-2 sm:mr-3 text-gray-400" />
                          {cloneListMutation.isPending ? 'Se clonează...' : 'Clonează'}
                        </button>

                        {/* Delete Option */}
                        <button
                          onClick={() => {
                            closeDropdown();
                            handleDeleteClick(list);
                          }}
                          className="w-full flex items-center px-3 sm:px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4 mr-2 sm:mr-3 text-red-400" />
                          Șterge
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12 px-4">
          <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 break-words">
            {searchTerm ? 'Nu s-au găsit liste' : 'Nu există liste'}
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6 break-words">
            {searchTerm 
              ? 'Încearcă să modifici termenii de căutare'
              : 'Creează prima listă de produse pentru a începe'
            }
          </p>
          {!searchTerm && (
            <Button
              variant="primary"
              onClick={() => navigate('/admin/lists/new')}
              className="w-full sm:w-auto"
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
          <p className="text-sm sm:text-base text-gray-600 break-words">
            Ești sigur că vrei să ștergi lista "{listToDelete?.mesaj_introducere || 'fără titlu'}"?
          </p>
          <p className="text-xs sm:text-sm text-gray-500 break-words">
            Această acțiune nu poate fi anulată. Toate produsele asociate cu această listă vor fi eliminate.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            <Button
              variant="secondary"
              onClick={handleDeleteCancel}
              disabled={deleteListMutation.isPending}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Anulează
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={deleteListMutation.isPending}
              className="w-full sm:w-auto order-1 sm:order-2"
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