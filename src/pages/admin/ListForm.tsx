import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Loader2, Eye, EyeOff, Truck, CreditCard, Package } from 'lucide-react';
import { useList, useListProducts } from '@/hooks/useLists';
import { useCreateList, useUpdateList } from '@/hooks/useLists';
import { useDeliverySchedules } from '@/hooks/useDeliverySchedules';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useDeliveryTypes } from '@/hooks/useDeliveryTypes';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';
import { ListCreate, ListUpdate } from '@/types/api';
import { getImageUrl, getProductImageUrl } from '@/services/api';
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
}

const ListForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const listId = id ? parseInt(id) : 0;
  const [showPreview, setShowPreview] = useState(false);

  // Fetch list data if editing
  const { data: list, isLoading: isLoadingList, error: listError } = useList(listId);

  // Fetch delivery schedules for dropdown
  const { data: deliverySchedules, isLoading: isLoadingSchedules } = useDeliverySchedules();
  
  // Fetch payment methods for preview
  const { data: paymentMethods, isLoading: isLoadingPaymentMethods } = usePaymentMethods();
  
  // Fetch delivery types for preview
  const { data: deliveryTypes, isLoading: isLoadingDeliveryTypes } = useDeliveryTypes();

  // Fetch list products for preview (only when editing)
  const { data: listProducts, isLoading: isLoadingListProducts } = useListProducts(listId);

  // Fetch categories and units for product display
  const { data: categories } = useCategories();
  const { data: units } = useUnits();

  // Form mutations
  const createListMutation = useCreateList();
  const updateListMutation = useUpdateList();

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
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
    },
  });

  // Set form data when list is loaded (for editing)
  useEffect(() => {
          if (list && isEditing) {
        setValue('data', list.data);
        setValue('is_current', list.is_current);
        setValue('is_published', list.is_published);
        setValue('mesaj_introducere', list.mesaj_introducere || '');
        setValue('alte_detalii', list.alte_detalii || '');
        setValue('orare_livrari_id', list.orare_livrari_id);
      }
  }, [list, isEditing, setValue]);

  const onSubmit = async (data: ListFormData) => {
    try {
      if (isEditing) {
        const updateData: ListUpdate = {
          data: data.data,
          is_current: data.is_current,
          is_published: data.is_published,
          mesaj_introducere: data.mesaj_introducere || undefined,
          alte_detalii: data.alte_detalii || undefined,
          orare_livrari_id: data.orare_livrari_id,
        };
        
        await updateListMutation.mutateAsync({ id: listId, data: updateData });
      } else {
        const createData: ListCreate = {
          data: data.data,
          is_current: data.is_current,
          is_published: data.is_published,
          mesaj_introducere: data.mesaj_introducere || undefined,
          alte_detalii: data.alte_detalii || undefined,
          orare_livrari_id: data.orare_livrari_id,
        };
        
        await createListMutation.mutateAsync(createData);
      }
      
      navigate('/admin/lists');
    } catch (error) {
      console.error('Eroare la salvarea listei:', error);
    }
  };

  const handleCancel = () => {
    navigate('/admin/lists');
  };

  // Helper function to format date for title
  const formatDateForTitle = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long'
    });
  };

  // Helper function to generate list title
  const getListTitle = (date: string, introMessage?: string) => {
    const dateFormatted = formatDateForTitle(date);
    return introMessage ? `Lista ${dateFormatted} - ${introMessage}` : `Lista ${dateFormatted}`;
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

            {/* Delivery Schedule */}
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

          {/* Status Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_current"
                {...register('is_current')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_current" className="text-sm font-medium text-gray-700">
                Listă Curentă
              </label>
            </div>
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
                maxLength: { value: 45, message: 'Mesajul nu poate depăși 45 de caractere' }
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
              disabled={isSubmitting || isLoadingSchedules}
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
                  <h3 className="text-lg font-semibold text-gray-900">Produse în Listă</h3>
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
                        <h4 className="font-medium text-gray-800 border-b border-gray-200 pb-2">
                          {categoryName}
                        </h4>
                        <div className="space-y-3">
                          {products.map((product: any) => (
                            <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start space-x-4">
                                {/* Product Image */}
                                <div className="flex-shrink-0">
                                  {(() => {
                                    if (product.images && product.images.length > 0) {
                                      // Use the same approach as ProductsList - construct the image URL manually
                                      const imagePath = product.images[0].image_versions?.thumbnail;
                                      const imageUrl = imagePath ? `${import.meta.env.VITE_API_BASE_URL}/api/v1/static/uploads/${imagePath}` : null;
                                      console.log('Generated image URL for', product.nume, ':', imageUrl);
                                    }
                                    return null;
                                  })()}
                                  {product.images && product.images.length > 0 ? (
                                    <img
                                      src={`${import.meta.env.VITE_API_BASE_URL}/api/v1/static/uploads/${product.images[0].image_versions?.thumbnail}`}
                                      alt={product.nume}
                                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                      onError={(e) => {
                                        console.log('Image failed to load for:', product.nume);
                                        console.log('Image URL was:', e.target.src);
                                        // Fallback to package icon if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.classList.remove('hidden');
                                      }}
                                      onLoad={() => {
                                        console.log('Image loaded successfully for:', product.nume);
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
                                    <p className="text-sm font-medium text-green-600">
                                      Stoc: {product.stoc_produs} {getUnitName(product.unitati_id)}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Detalii Suplimentare</h3>
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
                  <Truck className="h-6 w-6 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">Orar Livrări</h4>
                    <div className="text-sm text-gray-600 whitespace-pre-line">
                      {deliverySchedules?.find(s => s.id === watch('orare_livrari_id'))?.orar_livrari || 'Orar nedefinit'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Methods */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Truck className="h-6 w-6 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">Metode de Livrare</h4>
                    <div className="text-sm text-gray-600">
                      {deliveryTypes && deliveryTypes.length > 0 
                        ? deliveryTypes.map(dt => (
                            <div key={dt.id} className="mb-1 last:mb-0">
                              {dt.denumire}
                            </div>
                          ))
                        : 'Metode de livrare nedefinite'
                      }
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
              {watch('is_current') && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Listă Curentă
                </span>
              )}
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

export default ListForm; 