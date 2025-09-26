import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Loader2, Eye, EyeOff, Clock, Truck, CreditCard, Package, Check } from 'lucide-react';
import { useList } from '@/hooks/useLists';
import { useCreateList, useUpdateList, useListDeliveryTypes, useReplaceListDeliveryTypes } from '@/hooks/useLists';
import { useDeliverySchedules } from '@/hooks/useDeliverySchedules';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useDeliveryTypes } from '@/hooks/useDeliveryTypes';
import { useNextDeliveryDate } from '@/hooks/useSystem';
import { ListCreate, ListUpdate } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';

interface ListFormData {
  data: string;
  is_current: boolean;
  is_published: boolean;
  mesaj_introducere: string;
  alte_detalii: string;
  orare_livrari_id: number;
  expiration_date?: string | null;
}

const ListForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const listId = id ? parseInt(id) : 0;
  const [showPreview, setShowPreview] = useState(false);
  const [selectedDeliveryTypes, setSelectedDeliveryTypes] = useState<number[]>([]);

  // Fetch list data if editing
  const { data: list, isLoading: isLoadingList, error: listError } = useList(listId);

  // Fetch delivery schedules for dropdown
  const { data: deliverySchedules, isLoading: isLoadingSchedules } = useDeliverySchedules();
  
  // Fetch payment methods for preview
  const { data: paymentMethods } = usePaymentMethods();
  
  // Fetch delivery types for selection and preview
  const { data: deliveryTypes } = useDeliveryTypes();

  // Fetch list-specific delivery types if editing
  const { data: listDeliveryTypes } = useListDeliveryTypes(listId);

  // Get next delivery date for new lists
  const { data: nextDeliveryDate } = useNextDeliveryDate();

  // Form mutations
  const createListMutation = useCreateList();
  const updateListMutation = useUpdateList();
  const replaceListDeliveryTypesMutation = useReplaceListDeliveryTypes();

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ListFormData>({
    defaultValues: {
      data: nextDeliveryDate?.next_delivery_date?.split('T')[0] || new Date().toISOString().split('T')[0], // Next delivery date or today's date as fallback
      is_current: false,
      is_published: false,
      mesaj_introducere: '',
      alte_detalii: '',
      orare_livrari_id: 0,
      expiration_date: null,
    },
  });

  // Helper to format a Date to 'YYYY-MM-DDTHH:MM' for datetime-local inputs
  const formatForDateTimeLocal = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  // Set form data when list is loaded (for editing)
  useEffect(() => {
    if (list && isEditing) {
      // Check if this is a recently cloned list (created within last 5 minutes)
      const isRecentlyCreated = new Date().getTime() - new Date(list.created_at).getTime() < 5 * 60 * 1000;
      const isClonedList = isRecentlyCreated && nextDeliveryDate && list.data === nextDeliveryDate.next_delivery_date.split('T')[0];
      
      if (isClonedList) {
        // This is a cloned list - use next delivery date presets
        setValue('data', nextDeliveryDate.next_delivery_date.split('T')[0]);
        const expirationDateTime = `${nextDeliveryDate.next_delivery_date.split('T')[0]}T19:00`;
        setValue('expiration_date', expirationDateTime);
      } else {
        // This is an existing list being edited - preserve original data
        setValue('data', list.data);
        const exp = (list as any).expiration_date as string | null | undefined;
        if (exp) {
          const d = new Date(exp);
          setValue('expiration_date', formatForDateTimeLocal(d));
        } else {
          setValue('expiration_date', null);
        }
      }
      
      setValue('is_current', list.is_current);
      setValue('is_published', list.is_published);
      setValue('mesaj_introducere', list.mesaj_introducere || '');
      setValue('alte_detalii', list.alte_detalii || '');
      setValue('orare_livrari_id', list.orare_livrari_id);
    }
  }, [list, isEditing, setValue, nextDeliveryDate]);

  // Update form with next delivery date when it becomes available (for new lists)
  useEffect(() => {
    if (nextDeliveryDate && !isEditing) {
      setValue('data', nextDeliveryDate.next_delivery_date.split('T')[0]);
      // Set expiration date to same date but at 19:00
      const expirationDateTime = `${nextDeliveryDate.next_delivery_date.split('T')[0]}T19:00`;
      setValue('expiration_date', expirationDateTime);
    }
  }, [nextDeliveryDate, isEditing, setValue]);

  // Set selected delivery types when list delivery types are loaded (for editing)
  useEffect(() => {
    if (listDeliveryTypes && isEditing) {
      setSelectedDeliveryTypes(listDeliveryTypes.map(dt => dt.id));
    }
  }, [listDeliveryTypes, isEditing]);

  const onSubmit = async (data: ListFormData) => {
    try {
      // Keep expiration as local datetime string; backend will interpret appropriately
      const normalizedExpiration = data.expiration_date || null;

      if (isEditing) {
        const updateData: ListUpdate = {
          data: data.data,
          is_current: data.is_current,
          is_published: data.is_published,
          expiration_date: normalizedExpiration,
          mesaj_introducere: data.mesaj_introducere || undefined,
          alte_detalii: data.alte_detalii || undefined,
          orare_livrari_id: data.orare_livrari_id,
        };
        
        await updateListMutation.mutateAsync({ id: listId, data: updateData });
        
        // Update delivery types for existing list
        if (selectedDeliveryTypes.length > 0) {
          await replaceListDeliveryTypesMutation.mutateAsync({
            listId,
            deliveryTypeIds: selectedDeliveryTypes
          });
        }
      } else {
        const createData: ListCreate = {
          data: data.data,
          is_current: data.is_current,
          is_published: data.is_published,
          expiration_date: normalizedExpiration,
          mesaj_introducere: data.mesaj_introducere || undefined,
          alte_detalii: data.alte_detalii || undefined,
          orare_livrari_id: data.orare_livrari_id,
        };
        
        const createdList = await createListMutation.mutateAsync(createData);
        
        // Assign delivery types to newly created list
        if (selectedDeliveryTypes.length > 0) {
          await replaceListDeliveryTypesMutation.mutateAsync({
            listId: createdList.id,
            deliveryTypeIds: selectedDeliveryTypes
          });
        }
      }
      
      navigate('/admin/lists');
    } catch (error) {
      console.error('Eroare la salvarea listei:', error);
    }
  };

  const handleCancel = () => {
    navigate('/admin/lists');
  };

  const handleDeliveryTypeToggle = (deliveryTypeId: number) => {
    setSelectedDeliveryTypes(prev => {
      if (prev.includes(deliveryTypeId)) {
        return prev.filter(id => id !== deliveryTypeId);
      } else {
        return [...prev, deliveryTypeId];
      }
    });
  };

  // Loading states
  if (isEditing && isLoadingList) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Se încarcă lista..." />
      </div>
    );
  }

  if (isEditing && listError) {
    return (
      <Alert
        type="error"
        title="Eroare la încărcarea listei"
        message="Nu s-a putut încărca lista. Vă rugăm să încercați din nou."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCancel}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editează Lista' : 'Creează Listă Nouă'}
            </h1>
            <p className="text-gray-600">
              {isEditing 
                ? 'Modifică detaliile listei de produse'
                : 'Creează o nouă listă de produse disponibile'
              }
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Ascunde Preview
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Arată Preview
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-2">
                Data Listei *
              </label>
              <Input
                id="data"
                type="date"
                {...register('data', { required: 'Data este obligatorie' })}
                error={errors.data?.message}
              />
            </div>

            {/* Expiration Date (optional) */}
            <div>
              <label htmlFor="expiration_date" className="block text-sm font-medium text-gray-700 mb-2">
                Data Expirării (opțional)
              </label>
              <Input
                id="expiration_date"
                type="datetime-local"
                {...register('expiration_date', {
                  validate: (value) => {
                    if (!value) return true;
                    const exp = new Date(value);
                    const listDate = new Date(watch('data'));
                    // compare with list date at 00:00 to allow same-day times after midnight
                    listDate.setHours(0,0,0,0);
                    return exp.getTime() > listDate.getTime() || 'Data expirării trebuie să fie după data listei';
                  }
                })}
                error={errors.expiration_date?.message as string}
              />
              <p className="text-xs text-gray-500 mt-1">
                După această dată, lista este considerată expirată și nu va fi afișată clienților.
              </p>
            </div>
          </div>

          {/* Delivery Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="orare_livrari_id" className="block text-sm font-medium text-gray-700 mb-2">
                Orar Livrări *
              </label>
              {isLoadingSchedules ? (
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                  Se încarcă orarele...
                </div>
              ) : (
                <Select
                  options={deliverySchedules?.map(schedule => ({
                    value: schedule.id.toString(),
                    label: schedule.orar_livrari
                  })) || []}
                  value={watch('orare_livrari_id')?.toString() || ''}
                  onChange={(value) => setValue('orare_livrari_id', parseInt(value))}
                  placeholder="Selectează orarul"
                  disabled={isLoadingSchedules}
                />
              )}
              {errors.orare_livrari_id && (
                <p className="text-sm text-red-600 mt-1">{errors.orare_livrari_id.message}</p>
              )}
            </div>
          </div>

          {/* Delivery Types Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Metode de Livrare Disponibile *
            </label>
            <div className="text-sm text-gray-600 mb-3">
              Selectează metodele de livrare care vor fi disponibile pentru această listă
            </div>
            {deliveryTypes && deliveryTypes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {deliveryTypes.map((deliveryType) => (
                  <div
                    key={deliveryType.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDeliveryTypes.includes(deliveryType.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleDeliveryTypeToggle(deliveryType.id)}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 ${
                      selectedDeliveryTypes.includes(deliveryType.id)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedDeliveryTypes.includes(deliveryType.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {deliveryType.denumire}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                Nu există metode de livrare definite
              </div>
            )}
            {selectedDeliveryTypes.length === 0 && (
              <p className="text-sm text-red-600 mt-2">
                Trebuie să selectezi cel puțin o metodă de livrare
              </p>
            )}
          </div>

          {/* Status Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_published"
                {...register('is_published')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                Publicată
              </label>
            </div>
          </div>

          {/* Introduction Message */}
          <div>
            <label htmlFor="mesaj_introducere" className="block text-sm font-medium text-gray-700 mb-2">
              Mesaj de Introducere
            </label>
            <Input
              id="mesaj_introducere"
              type="text"
              placeholder="Ex: Produse proaspete disponibile astăzi!"
              {...register('mesaj_introducere', {
                maxLength: { value: 100, message: 'Mesajul nu poate depăși 100 de caractere' }
              })}
              error={errors.mesaj_introducere?.message}
            />
            <p className="xs text-gray-500 mt-1">
              Mesajul afișat clienților când vizualizează lista
            </p>
          </div>

          {/* Additional Details */}
          <div>
            <label htmlFor="alte_detalii" className="block text-sm font-medium text-gray-700 mb-2">
              Detalii Suplimentare
            </label>
            <textarea
              id="alte_detalii"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Livrare gratuită pentru comenzi peste 100 lei, Intarzii cu livrarile din cauza traficului..."
              {...register('alte_detalii', {
                maxLength: { value: 500, message: 'Detaliile nu pot depăși 500 de caractere' }
              })}
            />
            {errors.alte_detalii && (
              <p className="text-sm text-red-600 mt-1">{errors.alte_detalii.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Informații suplimentare pentru clienți (max 500 caractere)
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || isLoadingSchedules || selectedDeliveryTypes.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Se salvează...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Actualizează' : 'Creează'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Preview */}
      {showPreview && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Preview Listă</h3>
          </div>

          <div className="space-y-4">
            {/* List Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Package className="h-6 w-6 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Informații Listă</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Data:</strong> {watch('data')}</div>
                    <div><strong>Status:</strong> {watch('is_published') ? 'Publicată' : 'Draft'}</div>
                    {watch('mesaj_introducere') && (
                      <div><strong>Mesaj:</strong> {watch('mesaj_introducere')}</div>
                    )}
                    {watch('alte_detalii') && (
                      <div><strong>Detalii:</strong> {watch('alte_detalii')}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Schedule */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Orar Livrări</h4>
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {deliverySchedules?.find(s => s.id === watch('orare_livrari_id'))?.orar_livrari || 'Orar nedefinit'}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Delivery Methods */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Truck className="h-6 w-6 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Metode de Livrare Selectate</h4>
                  <div className="text-sm text-gray-600">
                    {selectedDeliveryTypes.length > 0 ? (
                      selectedDeliveryTypes.map(deliveryTypeId => {
                        const deliveryType = deliveryTypes?.find(dt => dt.id === deliveryTypeId);
                        return (
                          <div key={deliveryTypeId} className="mb-1 last:mb-0">
                            {deliveryType ? deliveryType.denumire : `Metodă ${deliveryTypeId}`}
                          </div>
                        );
                      })
                    ) : (
                      'Nu au fost selectate metode de livrare'
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CreditCard className="h-6 w-6 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Metode de Plată</h4>
                  <div className="text-sm text-gray-600">
                    {paymentMethods && paymentMethods.length > 0 
                      ? paymentMethods.map(pm => (
                          <div key={pm.id} className="mb-1 last:mb-0">
                            {pm.description}
                          </div>
                        ))
                      : 'Metode de plată nedefinite'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ListForm; 