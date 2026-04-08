// src/types/i18n.ts
import { TFunction } from 'i18next';

/**
 * Define translation namespaces - must match your JSON file names exactly
 */
export type TranslationNamespaces = 'common' | 'auth' | 'dashboard' | 'assets' | 'tables' | 'form' | 'sidebar';

/**
 * Utility type for constructing type-safe translation keys with namespace prefix
 */
export type TranslationKeys = 
  | `common:${string}` 
  | `auth:${string}` 
  | `dashboard:${string}` 
  | `assets:${string}` 
  | `tables:${string}` 
  | `form:${string}`
  | `sidebar:${string}`;

/**
 * Extended TFunction with type safety
 * Allows for both fully qualified keys with namespace and simple keys within current namespace
 */
export interface TypedTFunction extends TFunction {
  // Allow both patterns for maximum flexibility
  (key: string | TranslationKeys, options?: any): string;
}

/**
 * Currency types supported by the app
 */
export type SupportedCurrency = 'NGN' | 'USD' | 'EUR' | 'GBP';

/**
 * Date format options
 */
export type DateFormatOption = 'short' | 'medium' | 'long' | 'full';