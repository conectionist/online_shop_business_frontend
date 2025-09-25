import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Info } from 'lucide-react';
import { useBusinessDetails, useCreateBusinessDetails, useUpdateBusinessDetails } from '@/hooks/useBusinessDetails';
import { BusinessDetailsCreate } from '@/types/api';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import ErrorDetailsModal from '@/components/ui/ErrorDetailsModal';
import { useErrorHandler } from '@/hooks/useErrorHandler';

// Simple Tooltip component
const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center"
      >
        {children}
        <Info className="h-4 w-4 ml-1 text-gray-400 hover:text-gray-600 cursor-help" />
      </div>
      {isVisible && (
        <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-full ml-2 w-48">
          {content}
          <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default function BusinessDetailsForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const businessDetailsId = id ? parseInt(id) : 0;

  const [formData, setFormData] = useState<BusinessDetailsCreate>({
    adresa: '',
    telefon: '',
    motto: '',
    list_not_available_msg: '',
    alte_detalii: '',
    delivery_tax: undefined,
    business_name: '',
    registration_number: '',
    CUI: '',
    email: '',
    operating_hours: '',
    representative: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    title: string;
    message: string;
    technicalDetails?: string;
    timestamp: string;
    userAction: string;
    url: string;
  } | null>(null);

  const { data: businessDetailsList, isLoading: isLoadingDetails, error: loadError } = useBusinessDetails();
  const createMutation = useCreateBusinessDetails();
  const updateMutation = useUpdateBusinessDetails();
  const { handleError } = useErrorHandler();

  // Find the specific business details to edit
  const existingDetails = businessDetailsList?.find(details => details.id === businessDetailsId);

  useEffect(() => {
    if (existingDetails) {
      setFormData({
        adresa: existingDetails.adresa || '',
        telefon: existingDetails.telefon || '',
        motto: existingDetails.motto || '',
        list_not_available_msg: existingDetails.list_not_available_msg || '',
        alte_detalii: existingDetails.alte_detalii || '',
        delivery_tax: existingDetails.delivery_tax ?? undefined,
        business_name: existingDetails.business_name || '',
        registration_number: existingDetails.registration_number || '',
        CUI: existingDetails.CUI || '',
        email: existingDetails.email || '',
        operating_hours: existingDetails.operating_hours || '',
        representative: existingDetails.representative || '',
      });
    }
  }, [existingDetails]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.adresa?.trim()) {
      newErrors.adresa = 'Adresa este obligatorie';
    }

    if (!formData.telefon?.trim()) {
      newErrors.telefon = 'Telefonul este obligatoriu';
    }

    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email invalid';
    }

    // Validate CUI format if provided (Romanian format)
    if (formData.CUI && !/^RO\d{2,10}$/.test(formData.CUI)) {
      newErrors.CUI = 'Format CUI invalid (ex: RO12345678)';
    }

    // Validate registration number format if provided
    if (formData.registration_number && !/^[A-Z]\d{1,2}\/\d{1,4}\/\d{1,4}$/.test(formData.registration_number)) {
      newErrors.registration_number = 'Format număr de înregistrare invalid (ex: J12/1234/2023)';
    }

    if (formData.delivery_tax !== undefined && formData.delivery_tax !== null) {
      const value = Number(formData.delivery_tax);
      if (Number.isNaN(value)) {
        newErrors.delivery_tax = 'Valoare invalidă pentru taxă de livrare';
      } else if (value < 0) {
        newErrors.delivery_tax = 'Taxa de livrare trebuie să fie >= 0';
      } else if (!Number.isInteger(value)) {
        newErrors.delivery_tax = 'Taxa de livrare trebuie să fie un număr întreg';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof BusinessDetailsCreate, value: string) => {
    if (field === 'delivery_tax') {
      const trimmed = value.trim();
      let parsed: number | undefined = undefined;
      if (trimmed !== '') {
        const num = Number(trimmed);
        if (Number.isFinite(num)) parsed = Math.floor(num);
      }
      setFormData(prev => ({ ...prev, delivery_tax: parsed }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: businessDetailsId, data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      navigate('/admin/business-details');
    } catch (error) {
      handleError(error, isEditing ? 'Încercare de actualizare a detaliilor business' : 'Încercare de creare a detaliilor business');
      setErrorDetails({
        title: isEditing ? 'Eroare la actualizarea detaliilor business' : 'Eroare la crearea detaliilor business',
        message: isEditing ? 'A apărut o eroare la actualizarea detaliilor business' : 'A apărut o eroare la crearea detaliilor business',
        technicalDetails: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        userAction: isEditing ? 'Încercare de actualizare a detaliilor business' : 'Încercare de creare a detaliilor business',
        url: window.location.href,
      });
      setErrorModalOpen(true);
    }
  };

  if (isLoadingDetails) {
    return <Loading />;
  }

  if (loadError) {
    return (
      <Alert 
        type="error"
        message={`Eroare la încărcarea detaliilor: ${loadError.message}`}
      />
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/business-details')}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Înapoi
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editează Detalii Business' : 'Adaugă Detalii Business'}
        </h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informații de identificare comerciant */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informații de identificare comerciant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tooltip content="Numele oficial al firmei">
                    Nume business
                  </Tooltip>
                </label>
                <Input
                  value={formData.business_name}
                  onChange={(e) => handleInputChange('business_name', e.target.value)}
                  placeholder="Ex: PCMA SRL"
                  maxLength={100}
                />

              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tooltip content="Numărul de înregistrare la Registrul Comerțului">
                    Număr de înregistrare
                  </Tooltip>
                </label>
                <Input
                  value={formData.registration_number}
                  onChange={(e) => handleInputChange('registration_number', e.target.value)}
                  placeholder="Ex: J12/1234/2023"
                  maxLength={20}
                />

                {errors.registration_number && (
                  <p className="text-sm text-red-600 mt-1">{errors.registration_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tooltip content="Codul Unic de Identificare fiscală">
                    CUI
                  </Tooltip>
                </label>
                <Input
                  value={formData.CUI}
                  onChange={(e) => handleInputChange('CUI', e.target.value)}
                  placeholder="Ex: RO12345678"
                  maxLength={16}
                />

                {errors.CUI && (
                  <p className="text-sm text-red-600 mt-1">{errors.CUI}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tooltip content="Email-ul oficial al firmei">
                    Email
                  </Tooltip>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Ex: contact@firma.ro"
                  maxLength={100}
                />

                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tooltip content="Adresa oficială a firmei">
                    Adresă <span className="text-red-500">*</span>
                  </Tooltip>
                </label>
                <Input
                  value={formData.adresa}
                  onChange={(e) => handleInputChange('adresa', e.target.value)}
                  placeholder="Ex: Strada Test 123, București"
                  className={errors.adresa ? 'border-red-300' : ''}
                  required
                />
                {errors.adresa && (
                  <p className="text-sm text-red-600 mt-1">{errors.adresa}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tooltip content="Numărul de telefon oficial al firmei">
                    Telefon <span className="text-red-500">*</span>
                  </Tooltip>
                </label>
                <Input
                  value={formData.telefon}
                  onChange={(e) => handleInputChange('telefon', e.target.value)}
                  placeholder="Ex: +40712345678"
                  className={errors.telefon ? 'border-red-300' : ''}
                  required
                />
                {errors.telefon && (
                  <p className="text-sm text-red-600 mt-1">{errors.telefon}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tooltip content="Numele reprezentantului legal">
                    Reprezentant
                  </Tooltip>
                </label>
                <Input
                  value={formData.representative}
                  onChange={(e) => handleInputChange('representative', e.target.value)}
                  placeholder="Ex: Popescu Ion"
                  maxLength={100}
                />

              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tooltip content="Programul de funcționare al firmei">
                  Program de funcționare
                </Tooltip>
              </label>
              <textarea
                value={formData.operating_hours}
                onChange={(e) => handleInputChange('operating_hours', e.target.value)}
                placeholder="Ex: Luni-Vineri: 8:00 - 18:00&#10;Sâmbătă: 8:00 - 14:00&#10;Duminică: Închis"
                maxLength={150}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
            </div>
          </div>

          {/* Informații business generale */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informații business generale</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tooltip content="Mesaj afișat când nu există liste active. Acceptă macro-ul {urmatoarea_zi_de_livrari}">
                    Mesaj când lista nu este disponibilă
                  </Tooltip>
                </label>
                <textarea
                  value={formData.list_not_available_msg}
                  onChange={(e) => handleInputChange('list_not_available_msg', e.target.value)}
                  placeholder="Ex: Lista va fi disponibilă din nou in curand"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  maxLength={1000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tooltip content="Opțional. Se aplică pentru livrare la domiciliu. Lasă gol pentru a nu aplica.">
                    Taxă livrare (RON)
                  </Tooltip>
                </label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  value={formData.delivery_tax ?? ''}
                  onChange={(e) => handleInputChange('delivery_tax', e.target.value)}
                  placeholder="Ex: 10"
                  className={errors.delivery_tax ? 'border-red-300' : ''}
                />
                {errors.delivery_tax && (
                  <p className="text-sm text-red-600 mt-1">{errors.delivery_tax}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tooltip content="Sloganul sau motto-ul business-ului">
                    Motto
                  </Tooltip>
                </label>
                <Input
                  value={formData.motto}
                  onChange={(e) => handleInputChange('motto', e.target.value)}
                  placeholder="Ex: Calitate și preț bun"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tooltip content="Informații suplimentare despre business">
                  Alte detalii
                </Tooltip>
              </label>
              <textarea
                value={formData.alte_detalii}
                onChange={(e) => handleInputChange('alte_detalii', e.target.value)}
                placeholder="Ex: Livrare gratuită pentru comenzi peste 100 lei"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/business-details')}
              disabled={isSubmitting}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Se salvează...' : (isEditing ? 'Actualizează' : 'Salvează')}
            </Button>
          </div>
        </form>
      </Card>

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