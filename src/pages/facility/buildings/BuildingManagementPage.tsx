// src/pages/facility/buildings/BuildingManagementPage.tsx
// import { Helmet } from 'react-helmet-async';
import BuildingManagement from "@/features/facility/buildings/BuildingManagement";

const BuildingManagementPage = () => {
  return (
    <>
      {/* <Helmet>
        <title>Building Management | Facility Management System</title>
      </Helmet> */}

      <div className="container mx-auto">
        <BuildingManagement />
      </div>
    </>
  );
};

export default BuildingManagementPage;