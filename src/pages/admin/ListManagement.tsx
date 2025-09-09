import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useList } from '@/hooks/useLists';
import { Button } from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import TabNavigation from '@/components/ui/TabNavigation';
import ListFormTab from './ListFormTab';
import ListProductsTab2 from './ListProductsTab2';
import ListProductsTab3 from './ListProductsTab3';
import ListOrdersTab from './ListOrdersTab';
import ListTextTab from './ListTextTab';

const ListManagement: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const listId = id ? parseInt(id) : 0;
  const [activeTab, setActiveTab] = useState<'edit' | 'products2' | 'products3' | 'orders' | 'text'>('edit');

  // Fetch list data for header
  const { data: list, isLoading: isLoadingList, error: listError } = useList(listId);

  // Handle successful save from edit tab
  const handleSaveSuccess = () => {
    // Optionally show a success message or update UI
    console.log('List saved successfully');
  };

  // Loading state
  if (isLoadingList) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă lista..." />
      </div>
    );
  }

  // Error state
  if (listError) {
    return (
      <div className="space-y-6">
        <Alert
          type="error"
          title="Eroare la încărcarea listei"
          message="Nu s-a putut încărca lista. Vă rugăm să încercați din nou."
        />
        <Button onClick={() => navigate('/admin/lists')}>
          Înapoi la Liste
        </Button>
      </div>
    );
  }

  // List not found
  if (!list) {
    return (
      <div className="space-y-6">
        <Alert
          type="error"
          title="Lista nu a fost găsită"
          message="Lista pe care o căutați nu există sau a fost ștearsă."
        />
        <Button onClick={() => navigate('/admin/lists')}>
          Înapoi la Liste
        </Button>
      </div>
    );
  }

  const getTabDescription = () => {
    switch (activeTab) {
      case 'edit':
        return 'Modifică detaliile listei';
      case 'products2':
        return 'Gestionează produsele';
      case 'products3':
        return 'Gestionează produsele cu selector dual';
      case 'orders':
        return 'Vezi comenzile pentru această listă';
      case 'text':
        return 'Format text pentru partajare';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/lists')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la Liste
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {list.data ? `Lista ${list.data}` : 'Lista'}
            </h1>
            <p className="text-gray-600">
              {getTabDescription()}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'edit' && (
        <ListFormTab listId={listId} onSaveSuccess={handleSaveSuccess} />
      )}
      {activeTab === 'products2' && (
        <ListProductsTab2 listId={listId} />
      )}
      {activeTab === 'products3' && (
        <ListProductsTab3 listId={listId} />
      )}
      {activeTab === 'orders' && (
        <ListOrdersTab listId={listId} />
      )}
      {activeTab === 'text' && (
        <ListTextTab listId={listId} />
      )}
    </div>
  );
};

export default ListManagement; 