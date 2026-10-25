// src/config/permissions.ts

export type Permission = 'view' | 'edit' | 'review' | 'costing';
export type Feature = 
  | 'work_request' 
  | 'work_order' 
  | 'pending_ppm' 
  | 'requisition' 
  | 'ppm_setting' 
  | 'asset_register' 
  | 'inventory_register' 
  | 'item_request' 
  | 'inventory_adjustment' 
  | 'transfer_form' 
  | 'movement_history'                    
  | 'report' 
  | 'reference' 
  | 'django_admin' 
  | 'ppm_item'
  | 'comment'
  | 'vendor_contract';

export type Role =
  | 'SUPER ADMIN'
  | 'ADMIN'
  | 'REQUESTER'
  | 'REVIEWER'
  | 'APPROVER'
  | 'PROCUREMENT AND STORE'
  | 'Facility Account'
  | 'Facility Store'
  | 'Facility View'
  | 'FINANCE'
  // View-only access to their own client's facilities (enforced by the backend).
  | 'CLIENT'
  // Five-stage Work Request flow (company-wide roles, view-only for now).
  | 'CENTRAL OPERATION'
  | 'AP OFFICER'
  | 'HEAD OF FINANCE & TREASURY'
  // Vendor login; no staff screens until the vendor portal arrives.
  | 'CONTRACTOR';

// Roles holding the FINANCE powers (disburse). FINANCE is being retired;
// HEAD OF FINANCE & TREASURY takes over from it. Mirrors the backend.
export const FINANCE_ROLES = ['FINANCE', 'HEAD OF FINANCE & TREASURY'];

// Roles that see every work request, work order and completion.
export const SEE_ALL_ROLES = ['SUPER ADMIN', 'ADMIN', 'AP OFFICER', 'CENTRAL OPERATION', ...FINANCE_ROLES];

// Roles that see every payment requisition (CENTRAL OPERATION does not).
export const SEE_ALL_PAYMENT_ROLES = ['SUPER ADMIN', 'ADMIN', 'AP OFFICER', ...FINANCE_ROLES];

// Staff who only view the work lists and never raise documents from them.
export const VIEW_ONLY_STAFF_ROLES = ['AP OFFICER', 'CENTRAL OPERATION', ...FINANCE_ROLES];

export const hasRole = (roles: string[], role?: string) => roles.includes((role || '').toUpperCase());

export type RolePermissions = {
  [key in Role]: {
    [key in Feature]?: Permission[];
  };
};

export const ROLE_FEATURES: RolePermissions = {
  'CLIENT': {
    'work_request': ['view'],
    'work_order': ['view'],
  },
  'SUPER ADMIN': {
    'work_request': ['view', 'edit', 'review'],
    'work_order': ['view', 'edit', 'review'],
    'pending_ppm': ['view', 'edit', 'review'],
    'requisition': ['view', 'edit', 'review'],
    'ppm_setting': ['view', 'edit', 'review'],
    'asset_register': ['view', 'edit'],
    'inventory_register': ['view', 'edit'],
    'item_request': ['view', 'edit'],
    'inventory_adjustment': ['view', 'edit'],
    'transfer_form': ['view', 'edit'],
    'movement_history': ['view', 'edit'],
    'report': ['view', 'edit'],
    'reference': ['view', 'edit'],
    'django_admin': ['view', 'edit'],
    'comment': ['view', 'edit'],
    'ppm_item': ['view', 'edit'],
    'vendor_contract': ['view', 'edit'],
  },
  'ADMIN': {
    'work_request': ['view', 'edit', 'review'],
    'work_order': ['view', 'edit', 'review'],
    'pending_ppm': ['view', 'edit', 'review'],
    'requisition': ['view', 'edit', 'review'],
    'ppm_setting': ['view', 'edit', 'review'],
    'asset_register': ['view', 'edit'],
    'inventory_register': ['view', 'edit'],
    'item_request': ['view', 'edit'],
    'inventory_adjustment': ['view', 'edit'],
    'transfer_form': ['view', 'edit'],
    'movement_history': ['view', 'edit'],
    'report': ['view', 'edit'],
    'reference': ['view', 'edit'],
    'comment': ['view', 'edit'],
    'ppm_item': ['view', 'edit'],
    'vendor_contract': ['view', 'edit'],
  },
  'REQUESTER': {
    'work_request': ['view', 'edit', 'review'],
    'work_order': ['view'],
    'pending_ppm': ['view', 'edit', 'review'],
    'requisition': ['view', 'edit'],
    'ppm_setting': ['view', 'edit'],
    'comment': ['view', 'edit'],
    'ppm_item': ['view', 'edit'],
  },
  'REVIEWER': {
    'work_request': ['view', 'review'],
    'work_order': ['view', 'review'],
    'pending_ppm': ['view', 'edit', 'review'],
    'requisition': ['view', 'edit', 'review'],
    'ppm_setting': ['view', 'review'],
    'comment': ['view', 'edit'],
    'ppm_item': ['view', 'edit'],
    'vendor_contract': ['view'],
  },
  'APPROVER': {
    'work_request': ['view', 'review'],
    'work_order': ['view', 'review'],
    'pending_ppm': ['view', 'edit', 'review'],
    'requisition': ['view', 'edit', 'review'],
    'ppm_setting': ['view', 'review'],
    'comment': ['view', 'edit'],
  },
  'PROCUREMENT AND STORE': {
    'work_request': ['view', 'costing'],
    'work_order': ['view'],
    'pending_ppm': ['view'],
    'requisition': ['view'],
    'ppm_setting': ['view'],
    'asset_register': ['view'],
    'inventory_register': ['view'],
    'item_request': ['view'],
    'report': ['view'],
    'reference': ['view'],
    'comment': ['view'],
    'ppm_item': ['view', 'edit'],
    'vendor_contract': ['view', 'edit'],
  },
  'Facility Account': {
    'work_request': ['view'],
    'work_order': ['view'],
    'pending_ppm': ['view'],
    'requisition': ['view'],
    'ppm_setting': ['view'],
    'asset_register': ['view'],
    'inventory_register': ['view'],
    'item_request': ['view'],
    'report': ['view'],
    'reference': ['view'],
    'comment': ['view'],
  },
  'Facility Store': {
    'work_request': ['view', 'edit'],
    'work_order': ['view', 'edit'],
    'pending_ppm': ['view', 'edit'],
    'requisition': ['view', 'edit'],
    'ppm_setting': ['view', 'edit'],
    'asset_register': ['view', 'edit'],
    'inventory_register': ['view', 'edit'],
    'item_request': ['view', 'edit'],
    'inventory_adjustment': ['view', 'edit'],
    'transfer_form': ['view', 'edit'],
    'movement_history': ['view', 'edit'],
    'report': ['view', 'edit'],
    'reference': ['view', 'edit'],
    'comment': ['view', 'edit'],
  },
  'Facility View': {
    'work_request': ['view'],
    'work_order': ['view'],
    'pending_ppm': ['view'],
    'requisition': ['view'],
    'ppm_setting': ['view'],
    'asset_register': ['view'],
    'inventory_register': ['view'],
    'item_request': ['view'],
    'inventory_adjustment': ['view'],
    'transfer_form': ['view'],
    'movement_history': ['view'],
    'report': ['view'],
    'reference': ['view'],
    'comment': ['view'],
  },
  'FINANCE': {
    'work_request': ['view'],
    'work_order': ['view'],
    'requisition': ['view'],
    'pending_ppm': ['view'],
    'report': ['view'],
    'comment': ['view'],
  },
  'HEAD OF FINANCE & TREASURY': {
    'work_request': ['view'],
    'work_order': ['view'],
    'requisition': ['view'],
    'pending_ppm': ['view'],
    'report': ['view'],
    'comment': ['view'],
  },
  'AP OFFICER': {
    'work_request': ['view'],
    'work_order': ['view'],
    'requisition': ['view'],
    'pending_ppm': ['view'],
    'report': ['view'],
    'comment': ['view'],
  },
  'CENTRAL OPERATION': {
    'work_request': ['view'],
    'work_order': ['view'],
    'pending_ppm': ['view'],
    'report': ['view'],
    'comment': ['view'],
  },
  'CONTRACTOR': {},
};