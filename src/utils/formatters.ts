// src/utils/formatters.ts
import { format, parseISO } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useTypedTranslation } from '../hooks/useTypedTranslation';
import { DateFormatOption, SupportedCurrency } from '../types/i18n';

/**
 * Simple date formatter that can be used without hooks
 */
export const formatDate = (
  dateString: string | null | undefined, 
  formatOption: DateFormatOption = 'medium'
) => {
  if (!dateString) return 'Not set';
  
  try {
    const datePatterns = {
      short: 'P', // 04/29/2025
      medium: 'PPP', // April 29, 2025
      long: 'PPPp', // April 29, 2025 at 12:00 AM
      full: 'PPPPp', // Wednesday, April 29, 2025 at 12:00 AM
    };
    
    return format(parseISO(dateString), datePatterns[formatOption], { locale: enUS });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Custom hook that provides formatting utilities for dates, numbers, and currency
 */
export function useFormatters() {
  const { i18n, t } = useTypedTranslation();
  
  /**
   * Get the locale to use for formatting based on current language
   */
  const getLocale = () => {
    switch (i18n.language) {
      case 'fr':
        return fr;
      default:
        return enUS;
    }
  };

  /**
   * Format a date string according to the current locale
   */
  const formatDate = (
    dateString: string | null | undefined, 
    formatOption: DateFormatOption = 'medium'
  ) => {
    if (!dateString) return t('common:notSet');
    
    try {
      const locale = getLocale();
      const datePatterns = {
        short: 'P', // 04/29/2025
        medium: 'PPP', // April 29, 2025
        long: 'PPPp', // April 29, 2025 at 12:00 AM
        full: 'PPPPp', // Wednesday, April 29, 2025 at 12:00 AM
      };
      
      return format(parseISO(dateString), datePatterns[formatOption], { locale });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  /**
   * Format a currency value according to the current locale and specified currency
   */
  const formatCurrency = (
    amount: number | string | null | undefined,
    currency: SupportedCurrency = 'NGN'
  ) => {
    if (amount === null || amount === undefined) return '';
    
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Currency formatting options by language
    const formatOptions: Record<string, Intl.NumberFormatOptions> = {
      en: {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
      fr: {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    };
    
    // Locale mapping
    const localeMap: Record<string, string> = {
      en: 'en-US',
      fr: 'fr-FR',
    };
    
    const locale = localeMap[i18n.language] || 'en-US';
    const options = formatOptions[i18n.language] || formatOptions.en;
    
    return new Intl.NumberFormat(locale, options).format(numericAmount || 0);
  };

  /**
   * Format a number according to the current locale
   */
  const formatNumber = (
    value: number | string | null | undefined,
    options: Intl.NumberFormatOptions = {}
  ) => {
    if (value === null || value === undefined) return '';
    
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    
    return new Intl.NumberFormat(locale, options).format(numericValue || 0);
  };

  /**
   * Format a percentage value according to the current locale
   */
  const formatPercent = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return '';
    
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numericValue || 0);
  };

  return {
    formatDate,
    formatCurrency,
    formatNumber,
    formatPercent
  };
}