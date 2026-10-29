/**
 * Centralized theme configuration for consistent styling across the application
 */

export const theme = {
  // Background gradients
  backgrounds: {
    page: 'bg-gradient-to-br from-amber-50 to-orange-50',
    header: 'bg-gradient-to-br from-amber-50 to-orange-50',
    category: 'bg-gradient-to-r from-amber-50 to-orange-50',
    card: 'bg-white',
    cardHover: 'bg-gray-50',
    cardLight: 'bg-gray-50',
    fallback: 'bg-gradient-to-br from-amber-50 to-orange-50',
  },

  // Borders
  borders: {
    primary: 'border-amber-200',
    secondary: 'border-amber-100',
    hover: 'border-amber-300',
    red: 'border-red-300',
  },

  // Text colors
  text: {
    primary: 'text-amber-700',
    secondary: 'text-amber-700',
    accent: 'text-amber-400',
    muted: 'text-gray-600',
    dark: 'text-gray-900',
  },

  // Button variants
  buttons: {
    primary: {
      base: 'bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105',
      small: 'bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-800 hover:to-orange-800 text-white shadow-sm hover:shadow-md transition-all duration-300',
    },
    secondary: {
      base: 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all duration-300',
      danger: 'bg-white border-amber-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-300',
    },
  },

  // Card styles
  cards: {
    main: 'bg-white rounded-2xl shadow-lg border border-amber-200',
    item: 'border border-amber-200 rounded-xl bg-white hover:bg-gray-50 transition-all duration-300',
    header: 'bg-white rounded-2xl shadow-lg border border-amber-200',
  },

  // Common class combinations
  classes: {
    pageContainer: 'min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8',
    pageContainerLarge: 'min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12',
    floatingCart: 'relative bg-white rounded-full shadow-lg border border-amber-200 p-3 hover:shadow-xl transition-all duration-300 hover:scale-105',
    categoryBadge: 'inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 text-sm font-medium border border-amber-200',
    priceCard: 'bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200',
    imageContainer: 'aspect-square bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl overflow-hidden shadow-lg border-2 border-amber-100',
    thumbnailFallback: 'w-16 h-16 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-100 flex items-center justify-center',
    quantityButton: 'w-12 h-12 p-0 rounded-full bg-white border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all duration-300',
    quantityButtonSmall: 'w-8 h-8 p-0 bg-white border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all duration-300',
    backButton: 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all duration-300',
  },
};

/**
 * Utility function to combine theme classes with custom classes
 */
export const themeClass = (baseClass: string, customClass?: string): string => {
  return customClass ? `${baseClass} ${customClass}` : baseClass;
};

/**
 * Predefined component classes for common UI elements
 */
export const components = {
  // Page layouts
  page: {
    container: theme.classes.pageContainer,
    containerLarge: theme.classes.pageContainerLarge,
  },

  // Cards
  card: {
    main: theme.cards.main,
    item: theme.cards.item,
    header: theme.cards.header,
  },

  // Buttons
  button: {
    primary: (customClass?: string) => themeClass(theme.buttons.primary.base, customClass),
    primarySmall: (customClass?: string) => themeClass(theme.buttons.primary.small, customClass),
    secondary: (customClass?: string) => themeClass(theme.buttons.secondary.base, customClass),
    secondaryDanger: (customClass?: string) => themeClass(theme.buttons.secondary.danger, customClass),
  },

  // Interactive elements
  interactive: {
    floatingCart: theme.classes.floatingCart,
    categoryBadge: theme.classes.categoryBadge,
    priceCard: theme.classes.priceCard,
    imageContainer: theme.classes.imageContainer,
    thumbnailFallback: theme.classes.thumbnailFallback,
    quantityButton: theme.classes.quantityButton,
    quantityButtonSmall: theme.classes.quantityButtonSmall,
    backButton: theme.classes.backButton,
  },

  // Backgrounds
  backgrounds: theme.backgrounds,

  // Borders
  borders: theme.borders,
};

export default theme;
