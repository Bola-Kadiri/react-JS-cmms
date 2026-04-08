// src/types/i18next.d.ts
import 'i18next';

// Import all namespaces (for the default language, only)
import common from '../locales/en/common.json';
import auth from '../locales/en/auth.json';
import dashboard from '../locales/en/dashboard.json';
import assets from '../locales/en/assets.json';
import tables from '../locales/en/tables.json';
import form from '../locales/en/form.json';
import sidebar from '../locales/en/sidebar.json';

// Extend the i18next module declarations
declare module 'i18next' {
  interface CustomTypeOptions {
    // Define resources type for TypeScript
    resources: {
      common: typeof common;
      auth: typeof auth;
      dashboard: typeof dashboard;
      assets: typeof assets;
      tables: typeof tables;
      form: typeof form;
      sidebar: typeof sidebar;
    };
  }
}