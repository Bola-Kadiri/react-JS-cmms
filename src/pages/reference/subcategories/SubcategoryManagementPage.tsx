// src/pages/facility/landlords/CategoryManagementPage.tsx
import SubcategoryManagement from "@/features/reference/subcategories/SubcategoryManagement";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Navigate } from "react-router-dom";

const SubcategoryManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('reference')
          
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <SubcategoryManagement />
      </div>
    </>
  );
};

export default SubcategoryManagementPage;