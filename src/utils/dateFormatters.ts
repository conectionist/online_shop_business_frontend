/**
 * Utility functions for formatting dates in Romanian
 */

export const ROMANIAN_MONTHS = [
  'ianuarie',
  'februarie',
  'martie',
  'aprilie',
  'mai',
  'iunie',
  'iulie',
  'august',
  'septembrie',
  'octombrie',
  'noiembrie',
  'decembrie',
];

/**
 * Format a date string to Romanian format
 * @param dateString - Date string in format "YYYY-MM-DD" or ISO date string
 * @returns Formatted date string like "15 ianuarie 2026"
 */
export const formatDateRomanian = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }
    
    const day = date.getDate();
    const month = ROMANIAN_MONTHS[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original if error occurs
  }
};

/**
 * Format a date string to short Romanian format
 * @param dateString - Date string in format "YYYY-MM-DD" or ISO date string
 * @returns Formatted date string like "15.01.2026"
 */
export const formatDateShortRomanian = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString; // Return original if error occurs
  }
};

