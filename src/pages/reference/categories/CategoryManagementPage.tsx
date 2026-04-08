// src/pages/facility/landlords/CategoryManagementPage.tsx
import CategoryManagement from "@/features/reference/categories/CategoryManagement";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Navigate } from "react-router-dom";

const CategoryManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('reference')
          
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <CategoryManagement />
      </div>
    </>
  );
};

export default CategoryManagementPage;