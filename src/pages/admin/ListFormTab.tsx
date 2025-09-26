import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Loader2, Eye, EyeOff, Clock, Truck, CreditCard, Package, Check } from 'lucide-react';
import { useList } from '@/hooks/useLists';
import { useCreateList, useUpdateList, useListProductsOrdered, useListDeliveryTypes, useReplaceListDeliveryTypes } from '@/hooks/useLists';
import { useDeliverySchedules } from '@/hooks/useDeliverySchedules';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useDeliveryTypes } from '@/hooks/useDeliveryTypes';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';
import { ListCreate, ListUpdate } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import { getProductImageUrl } from '@/services/api';

interface ListFormData {
  data: string;
  is_current: boolean;
  is_published: boolean;
  mesaj_introducere: string;
  alte_detalii: string;
  orare_livrari_id: number;
  expiration_date?: string | null;
}

interface ListFormTabProps {
  listId: number;
  onSaveSuccess?: () => void;
}

const ListFormTab: React.FC<ListFormTabProps> = ({ listId, onSaveSuccess }) => {
  const isEditing = !!listId;
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

  // Fetch list products for preview (only when editing)
  const { data: listProductsData, isLoading: isLoadingListProducts } = useListProductsOrdered(listId);

  // Fetch categories and units for product display
  const { data: categories } = useCategories();
  const { data: units } = useUnits();

  // Form mutations
  const createListMutation = useCreateList();
  const updateListMutation = useUpdateList();
  const replaceListDeliveryTypesMutation = useReplaceListDeliveryTypes();

  // Extract products from the new ordered structure
  const listProducts = React.useMemo(() => {
    if (!listProductsData?.categories) return [];
    
    // Flatten all products from all categories
    return listProductsData.categories.flatMap((category: any) => 
      category.products.map((product: any) => ({
        ...product,
        category_id: category.id // Ensure category_id is set
      }))
    );
  }, [listProductsData]);

  // Form setup
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ListFormData>({
    defaultValues: {
      data: new Date().toISOString().split('T')[0], // Today's date
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
      setValue('data', list.data);
      setValue('is_current', list.is_current);
      setValue('is_published', list.is_published);
      setValue('mesaj_introducere', list.mesaj_introducere || '');
      setValue('alte_detalii', list.alte_detalii || '');
      setValue('orare_livrari_id', list.orare_livrari_id);
      const exp = (list as any).expiration_date as string | null | undefined;
      if (exp) {
        const d = new Date(exp);
        setValue('expiration_date', formatForDateTimeLocal(d));
      } else {
        setValue('expiration_date', null);
      }
    }
  }, [list, isEditing, setValue]);

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
      
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error('Eroare la salvarea listei:', error);
    }
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

  // Helper functions for product display
  const getCategoryName = (categoryId: number) => {
    return categories?.find(cat => cat.id === categoryId)?.name || `Categorie ${categoryId}`;
  };

  const getUnitName = (unitId: number) => {
    return units?.find(unit => unit.id === unitId)?.denumire || `Unitate ${unitId}`;
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
      {/* Preview Toggle */}
      <div className="flex justify-end">
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
            {/* <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_current"
                {...register('is_current')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_current" className="text-sm font-medium text-gray-700">
                Listă Curentă
              </label>
            </div> */}
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
            <p className="text-xs text-gray-500 mt-1">
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
                  {isEditing ? 'Actualizează' : 'Creează'} Lista
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Preview Section */}
      {showPreview && (
        <Card className="p-6 mt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Listă Publicată</h3>
            <p className="text-sm text-gray-600">Cum va arăta lista pentru clienți</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl">
            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {watch('mesaj_introducere') || 'Listă de produse'}
              </h2>
            </div>

            {/* Products Section */}
            <div className="mb-6">
              {isEditing && isLoadingListProducts ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-2">Se încarcă produsele...</p>
                </div>
              ) : isEditing && listProducts && listProducts.length > 0 ? (
                <div className="space-y-6">
                  {(() => {
                    // Group products by category
                    const productsByCategory = listProducts.reduce((acc: any, product: any) => {
                      const categoryName = getCategoryName(product.category_id);
                      if (!acc[categoryName]) {
                        acc[categoryName] = [];
                      }
                      acc[categoryName].push(product);
                      return acc;
                    }, {});

                    return Object.entries(productsByCategory).map(([categoryName, products]: [string, any]) => (
                      <div key={categoryName} className="space-y-3">
                        <h4 className="text-lg font-semibold text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-center">
                          {categoryName}
                        </h4>
                        <div className="space-y-3">
                          {products.map((product: any) => (
                            <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start space-x-4">
                                {/* Product Image */}
                                <div className="flex-shrink-0">
                                  {product.images && product.images.length > 0 ? (
                                    <img
                                      src={getProductImageUrl(product, 'thumbnail')}
                                      alt={product.nume}
                                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                      onError={(e) => {
                                        // Fallback to package icon if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                  ) : null}
                                  {/* Fallback icon - hidden by default, shown if image fails or doesn't exist */}
                                  <div className={`w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                                    <Package className="w-6 h-6 text-gray-400" />
                                  </div>
                                </div>
                                
                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-gray-900 truncate">{product.nume}</h5>
                                  {product.description && (
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                                  )}
                                  <div className="mt-3 space-y-1">
                                    <p className="text-sm text-gray-600">
                                      Preț: {product.pret} RON / {getUnitName(product.unitati_id)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-2">
                    {isEditing ? 'Nu există produse în această listă' : 'Produse vor fi afișate aici'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {isEditing 
                      ? 'Adaugă produse în secțiunea de gestionare a listei'
                      : 'Produsele vor fi adăugate în secțiunea de gestionare a listei'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Additional Details */}
            {watch('alte_detalii') && (
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">{watch('alte_detalii')}</p>
                </div>
              </div>
            )}

            {/* Delivery Schedule, Delivery Methods, and Payment Methods */}
            <div className="space-y-4">
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

            {/* Status Indicators */}
            <div className="flex justify-center space-x-4 mt-6">
              {/* {watch('is_current') && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Listă Curentă
                </span>
              )} */}
              {watch('is_published') && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Publicată
                </span>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ListFormTab; 