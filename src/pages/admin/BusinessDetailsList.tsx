import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Search, Edit, Trash2, MapPin, Phone, FileText } from 'lucide-react';
import { useBusinessDetails, useDeleteBusinessDetails } from '@/hooks/useBusinessDetails';
import { BusinessDetails } from '@/types/api';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import Modal from '@/components/ui/Modal';
import ErrorDetailsModal from '@/components/ui/ErrorDetailsModal';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import AdminPageHeader from '@/components/layout/AdminPageHeader';

export default function BusinessDetailsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [businessDetailsToDelete, setBusinessDetailsToDelete] = useState<BusinessDetails | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    title: string;
    message: string;
    technicalDetails?: string;
    timestamp: string;
    userAction: string;
    url: string;
  } | null>(null);

  const { data: businessDetails, isLoading, error } = useBusinessDetails();
  const deleteMutation = useDeleteBusinessDetails();
  const { handleError } = useErrorHandler();

  // Handle the case where businessDetails might be null or undefined
  const filteredBusinessDetails = businessDetails || [];
  
  // Filter based on search term if provided
  const filteredResults = searchTerm.trim() ? filteredBusinessDetails.filter((details: BusinessDetails) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      details.adresa?.toLowerCase().includes(searchLower) ||
      details.telefon?.toLowerCase().includes(searchLower) ||
      details.motto?.toLowerCase().includes(searchLower) ||
      details.alte_detalii?.toLowerCase().includes(searchLower)
    );
  }) : filteredBusinessDetails;

  const handleDelete = async () => {
    if (!businessDetailsToDelete || !businessDetailsToDelete.id) return;

    try {
      await deleteMutation.mutateAsync(businessDetailsToDelete.id);
      setDeleteModalOpen(false);
      setBusinessDetailsToDelete(null);
    } catch (error) {
      handleError(error, 'Încercare de ștergere a detaliilor business');
      setErrorDetails({
        title: 'Eroare la ștergerea detaliilor business',
        message: 'A apărut o eroare la ștergerea detaliilor business',
        technicalDetails: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        userAction: 'Încercare de ștergere a detaliilor business',
        url: window.location.href,
      });
      setErrorModalOpen(true);
    }
  };

  const openDeleteModal = (details: BusinessDetails) => {
    if (!details.id) {
      console.error('Cannot delete business details without ID');
      return;
    }
    setBusinessDetailsToDelete(details);
    setDeleteModalOpen(true);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Alert 
        type="error"
        message={`Eroare la încărcarea detaliilor de business: ${error.message}`}
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Detalii Business" 
        subtitle="Gestionează informațiile despre business"
        searchBox={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Caută în detalii business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        }
      >
        <Link to="/admin/business-details/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adaugă Detalii
          </Button>
        </Link>
      </AdminPageHeader>

      {filteredResults.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nu s-au găsit detalii business' : 'Nu există detalii business'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Încearcă să modifici termenii de căutare'
                : 'Adaugă primele detalii business pentru a începe'
              }
            </p>
            {!searchTerm && (
              <Link to="/admin/business-details/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Adaugă Primele Detalii
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredResults.map((details: BusinessDetails) => (
            <Card key={details.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Detalii Business #{details.id}
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {details.adresa && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Adresă:</span>
                          <p className="text-sm text-gray-600">{details.adresa}</p>
                        </div>
                      </div>
                    )}
                    
                    {details.telefon && (
                      <div className="flex items-start space-x-2">
                        <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Telefon:</span>
                          <p className="text-sm text-gray-600">{details.telefon}</p>
                        </div>
                      </div>
                    )}
                    
                    {details.motto && (
                      <div className="flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Motto:</span>
                          <p className="text-sm text-gray-600">{details.motto}</p>
                        </div>
                      </div>
                    )}
                    
                    {details.alte_detalii && (
                      <div className="flex items-start space-x-2">
                        <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Alte detalii:</span>
                          <p className="text-sm text-gray-600">{details.alte_detalii}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {details.id && (
                    <Link to={`/admin/business-details/${details.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editează
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openDeleteModal(details)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Șterge
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmă ștergerea"
      >
        <div className="space-y-4">
          <p>
            Ești sigur că vrei să ștergi aceste detalii business? Această acțiune nu poate fi anulată.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Anulează
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Se șterge...' : 'Șterge'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Error Details Modal */}
      {errorDetails && (
        <ErrorDetailsModal
          isOpen={errorModalOpen}
          onClose={() => setErrorModalOpen(false)}
          error={errorDetails}
        />
      )}
    </div>
  );
} 