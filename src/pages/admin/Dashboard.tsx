import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderOpen, Package, List, Building2, CreditCard, Truck, Clock, Ruler, Wrench, ShoppingCart, Copy, Shield, Monitor, BarChart3 } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useLists, useCloneList, useUpdateList } from '@/hooks/useLists';
import { useToast } from '@/components/ui/ToastContainer';
import { useNextDeliveryDate } from '@/hooks/useSystem';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Get all lists to find the latest one
  const { data: lists } = useLists();
  const cloneListMutation = useCloneList();
  const updateListMutation = useUpdateList();
  const { showToast } = useToast();
  const { data: nextDelivery } = useNextDeliveryDate();
  
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
      // Determine weekday of next delivery date, if provided
      const nextDateStr = nextDelivery?.next_delivery_date?.split('T')[0];
      const targetWeekday = nextDateStr ? new Date(nextDateStr).getDay() : null; // 0=Sun..6=Sat

      // Choose source list: most recent list with same weekday (by list.data), fallback to latest by created_at
      let sourceList = null as (typeof lists)[number] | null;
      if (targetWeekday !== null) {
        const sameWeekdayLists = lists
          .filter(l => !l.is_deleted && l.data)
          .filter(l => {
            const d = new Date(l.data);
            return !isNaN(d.getTime()) && d.getDay() === targetWeekday;
          })
          .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        sourceList = sameWeekdayLists[0] || null;
      }
      if (!sourceList) {
        const sortedByCreated = [...lists].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        sourceList = sortedByCreated[0];
      }

      try {
        const clonedList = await cloneListMutation.mutateAsync(sourceList.id);

        // Preset cloned list date/expiration to next delivery date (19:00)
        if (nextDateStr) {
          const expirationDateTime = `${nextDateStr}T19:00`;
          try {
            await updateListMutation.mutateAsync({
              id: clonedList.id,
              data: { data: nextDateStr, expiration_date: expirationDateTime },
            });
          } catch (e) {
            console.warn('Could not preset cloned list dates:', e);
          }
        }

        // Show success message
        showToast({
          type: 'success',
          title: 'Listă clonată cu succes!',
          message: `Lista "${sourceList.mesaj_introducere || 'fără titlu'}" a fost clonată. Noua listă are ID-ul ${clonedList.id}.`
        });

        // Navigate to the newly cloned list
        navigate(`/admin/lists/${clonedList.id}/manage`);
      } catch (error) {
        console.error('Failed to clone list:', error);
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
                    <h3 className="text-lg font-semibold text-gray-900">Clonare listă</h3>
                    <p className="text-gray-600 text-sm">Alege automat lista pentru clonare</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Link to="/admin/statistics" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-8 w-8 text-amber-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Statistici</h3>
                    <p className="text-gray-600 text-sm">Vânzări, produse și clienți</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Setări</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/business-details" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-8 w-8 text-indigo-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Detalii Afacere</h3>
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

          <Link to="/admin/security" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Securitate</h3>
                    <p className="text-gray-600 text-sm">Setări de securitate</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/sessions" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Monitor className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Sesiuni Active</h3>
                    <p className="text-gray-600 text-sm">Gestionează dispozitivele conectate</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/admin/advanced" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <Wrench className="h-8 w-8 text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Operațiuni avansate</h3>
                    <p className="text-gray-600 text-sm">Operațiuni avansate ale sistemului</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 