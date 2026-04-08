// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enAssets from './locales/en/assets.json';
import enTables from './locales/en/tables.json';
import enForm from './locales/en/form.json';
import enSidebar from './locales/en/sidebar.json';

import frCommon from './locales/fr/common.json';
import frAuth from './locales/fr/auth.json';
import frDashboard from './locales/fr/dashboard.json';
import frAssets from './locales/fr/assets.json';
import frTables from './locales/fr/tables.json';
import frForm from './locales/fr/form.json';
import frSidebar from './locales/fr/sidebar.json';

// Resources object with all translations
const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    assets: enAssets,
    tables: enTables,
    form: enForm,
    sidebar: enSidebar
  },
  fr: {
    common: frCommon,
    auth: frAuth,
    dashboard: frDashboard,
    assets: frAssets,
    tables: frTables,
    form: frForm,
    sidebar: frSidebar
  },
};

i18n
  // Load translations from backend
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    defaultNS: 'common',
    fallbackNS: 'common',
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'preferredLanguage',
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    
    react: {
      useSuspense: true,
    },
  });

export default i18n;