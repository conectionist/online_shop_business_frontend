import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessDetailsSingle } from '@/hooks/useBusinessDetails';
import { useCategories } from '@/hooks/useCategories';
import { Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getAppName, getLogoPath } from '@/utils/appConfig';
import { getCategoryImageUrl } from '@/services/api';
import { generateOrganizationSchema, injectSchemaMarkup, removeSchemaMarkup } from '@/utils/schema';
import { components } from '@/utils/theme';
import SEO from '@/components/SEO';

const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: businessDetails } = useBusinessDetailsSingle();
  const { data: categories, isLoading: isLoadingCategories, error: categoriesError } = useCategories();
  const handleCategorySelect = (categoryId: number) => {
    navigate(`/catalog/category/${categoryId}`);
  };

  // Inject schema markup for SEO
  useEffect(() => {
    try {
      const organizationSchema = generateOrganizationSchema(businessDetails);
      injectSchemaMarkup(organizationSchema, 'organization');
    } catch (error) {
      console.warn('Failed to inject organization schema:', error);
    }

    return () => {
      removeSchemaMarkup('organization');
    };
  }, [businessDetails]);

  const isLoading = isLoadingCategories;
  const error = categoriesError;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto px-6 sm:px-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <Package className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Eroare la încărcarea catalogului
          </h1>
          <p className="text-gray-600 mb-6">
            A apărut o eroare la încărcarea catalogului de produse. Vă rugăm să încercați din nou.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/')}
            className={components.button.primary()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Înapoi la Pagina Principală
          </Button>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    const emptyMessage = 'Nu există categorii disponibile momentan.';
    return (
      <>
        <SEO
          title="Catalog Produse"
          description={emptyMessage}
          robots="index, follow"
        />
        <div className="text-center py-12">
          <div className="max-w-md mx-auto px-6 sm:px-6">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              {emptyMessage}
            </h1>
            <p className="text-gray-600 mb-6">
              Vă rugăm să reveniți mai târziu sau să contactați administratorul.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/')}
              className={components.button.primary()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Pagina Principală
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Catalog Produse"
        description="Explorează categoriile și alege produsele preferate."
        robots="index, follow"
      />

      {/* Header */}
      <div className={`${components.backgrounds.header} border-b ${components.borders.primary} mb-8`}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                <img
                  src={getLogoPath()}
                  alt="Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                  {getAppName()}
                </h1>
                <p className="text-amber-700 font-medium text-sm md:text-base">Catalog Produse</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-px bg-amber-300"></div>
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <div className="w-8 h-px bg-amber-300"></div>
            </div>

            <div className={`${components.backgrounds.card} rounded-xl p-6 shadow-sm border ${components.borders.primary}`}>
              <p className="text-gray-700 text-lg font-semibold text-center">
                Alege o categorie pentru a vedea produsele disponibile.
              </p>
            </div>

            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => navigate('/')}
                className={components.button.primary()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi la Pagina Principală
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-4xl mx-auto px-6 mb-10">
        {!categories || categories.length === 0 ? (
          <div className={`${components.backgrounds.card} border ${components.borders.primary} rounded-lg p-4 text-gray-700`}>
            Nu există categorii disponibile momentan.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {categories.map((category) => {
              const hasImage = !!category.image_versions?.medium;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category.id)}
                  className="text-left group rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white border-gray-200"
                >
                  <div className="aspect-square rounded-xl overflow-hidden relative">
                    {hasImage ? (
                      <img
                        src={getCategoryImageUrl(category, 'medium')}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`absolute inset-0 ${components.backgrounds.fallback} flex items-center justify-center ${hasImage ? 'hidden' : ''}`}>
                      <Package className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="px-4 py-4 text-center">
                    <p className="font-bold text-lg md:text-xl text-gray-900 group-hover:text-amber-700 transition-colors tracking-tight leading-tight">
                      {category.name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default CatalogPage;

