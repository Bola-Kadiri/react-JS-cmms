// src/hooks/useFeatureAccess.ts
import { usePermissions } from '../contexts/PermissionsContext';
import { Feature } from '../config/permissions';

export const useFeatureAccess = (feature: Feature) => {
  const { canView, canEdit, hasPermission } = usePermissions();

  return {
    canView: canView(feature),
    canEdit: canEdit(feature),
    hasViewPermission: hasPermission(feature, 'view'),
    hasEditPermission: hasPermission(feature, 'edit'),
    isReadOnly: canView(feature) && !canEdit(feature),
    hasNoAccess: !canView(feature) && !canEdit(feature),
  };
};