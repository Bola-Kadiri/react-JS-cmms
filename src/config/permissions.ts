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
  | 'Facility View';

export type RolePermissions = {
  [key in Role]: {
    [key in Feature]?: Permission[];
  };
};

export const ROLE_FEATURES: RolePermissions = {
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
};