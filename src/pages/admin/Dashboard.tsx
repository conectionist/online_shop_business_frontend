import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderOpen, Package, List, Building2, CreditCard, Truck, Clock, Ruler, Wrench, ShoppingCart, Copy, Bell } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useLists, useCloneList } from '@/hooks/useLists';
import { useToast } from '@/components/ui/ToastContainer';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Get all lists to find the latest one
  const { data: lists } = useLists();
  const cloneListMutation = useCloneList();
  const { showToast } = useToast();
  
  const handleRecentOrdersClick = () => {
    if (lists && lists.length > 0) {
      // Sort by created_at in descending order to get the newest list
      const sortedLists = [...lists].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const latestList = sortedLists[0];
      navigate(`/admin/lists/${latestList.id}/manage?tab=orders`);
    }
  };

  const handleCloneLatestList = async () => {
    if (lists && lists.length > 0) {
      // Sort by created_at in descending order to get the newest list
      const sortedLists = [...lists].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const latestList = sortedLists[0];
      
      try {
        const clonedList = await cloneListMutation.mutateAsync(latestList.id);
        
        // Show success message
        showToast({
          type: 'success',
          title: 'Listă clonată cu succes!',
          message: `Lista "${latestList.mesaj_introducere || 'fără titlu'}" a fost clonată. Noua listă are ID-ul ${clonedList.id}.`
        });
        
        // Navigate to the newly cloned list
        navigate(`/admin/lists/${clonedList.id}/manage`);
      } catch (error) {
        console.error('Failed to clone list:', error);
        
        // Show error message
        showToast({
          type: 'error',
          title: 'Eroare la clonarea listei',
          message: 'Nu s-a putut clona lista. Vă rugăm să încercați din nou.'
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Bun venit la Panoul de Administrare</h2>
        <p className="mt-1 text-sm text-gray-500">
          Gestionează-ți afacerea online de aici.
        </p>
      </div>

      {/* Shortcuts Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Scurtături</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleRecentOrdersClick}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="h-8 w-8 text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Comenzi recente</h3>
                    <p className="text-gray-600 text-sm">Vezi comenzile recente</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={handleCloneLatestList}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Copy className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Clonează ultima lista</h3>
                    <p className="text-gray-600 text-sm">Clonează cea mai recentă listă</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Catalog Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Catalog</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/categories" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <FolderOpen className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Categorii</h3>
                    <p className="text-gray-600 text-sm">Gestionează categoriile de produse</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/products" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Package className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Produse</h3>
                    <p className="text-gray-600 text-sm">Gestionează catalogul de produse</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/lists" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <List className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Liste</h3>
                    <p className="text-gray-600 text-sm">Creează și gestionează listele de produse</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Settings Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Setări Afacere</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/business-details" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-8 w-8 text-indigo-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Informațiile Firmei</h3>
                    <p className="text-gray-600 text-sm">Gestionează informațiile companiei</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/payment-methods" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-8 w-8 text-emerald-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Metode de Plată</h3>
                    <p className="text-gray-600 text-sm">Configurează opțiunile de plată</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/delivery-types" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Truck className="h-8 w-8 text-orange-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Metode de Livrare</h3>
                    <p className="text-gray-600 text-sm">Configurează opțiunile de livrare</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/delivery-schedules" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Clock className="h-8 w-8 text-cyan-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Programe de Livrare</h3>
                    <p className="text-gray-600 text-sm">Setează intervalele de livrare</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/units" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Ruler className="h-8 w-8 text-orange-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Unități</h3>
                    <p className="text-gray-600 text-sm">Gestionează unitățile de măsură</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

        </div>
      </div>

      {/* System Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sistem</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="opacity-60 cursor-not-allowed">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <Bell className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Notificări</h3>
                  <p className="text-gray-600 text-sm">Configurează notificările sistemului</p>
                  <p className="text-xs text-gray-500 mt-1">În curând</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="opacity-60 cursor-not-allowed">
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <Wrench className="h-8 w-8 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Operațiuni</h3>
                  <p className="text-gray-600 text-sm">Operațiuni avansate ale sistemului</p>
                  <p className="text-xs text-gray-500 mt-1">În curând</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 