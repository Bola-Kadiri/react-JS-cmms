// src/hooks/useTypedTranslation.ts
import { useTranslation } from 'react-i18next';
import { TranslationKeys, TypedTFunction, TranslationNamespaces } from '../types/i18n';

/**
 * Custom hook that provides type-safe translations
 * 
 * Can be used in several ways:
 * - useTypedTranslation() - Uses 'common' as default namespace
 * - useTypedTranslation('sidebar') - Uses 'sidebar' namespace
 * - useTypedTranslation(['sidebar', 'common']) - Uses multiple namespaces
 * 
 * @param namespace - Optional namespace or array of namespaces to use for translations
 * @returns Translation function and i18n instance
 */
export function useTypedTranslation(
  namespace?: TranslationNamespaces | ReadonlyArray<TranslationNamespaces>
) {
  // Cast to any to bypass strict type checking
  const { t, i18n } = useTranslation(namespace as any);
  
  // Typed wrapper around the translation function
  const typedT = (
    (key: string | TranslationKeys, options?: any) => t(key, options)
  ) as TypedTFunction;
  
  return { 
    t: typedT, 
    i18n,
    changeLanguage: i18n.changeLanguage,
    language: i18n.language
  };
}